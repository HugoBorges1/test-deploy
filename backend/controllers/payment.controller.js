// webedeve/backend/controllers/payment.controller.js

import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import { stripe } from "../lib/stripe.js";
import User from "../models/user.model.js";

// Função para simular o custo do frete
const calculateShippingCost = () => {
    return 15; // R$15,00 de frete fixo
}


async function generateUniqueOrderNumber(userId, productsInCart) {
    const orderCount = await Order.countDocuments({ user: userId });
    const P = orderCount + 1;
    const Q = productsInCart.reduce((sum, item) => sum + item.quantity, 0);
    const productIds = productsInCart.map(p => p.id);
    const productsWithCategory = await Product.find({ _id: { $in: productIds } }).select('category');
    const uniqueCategories = new Set(productsWithCategory.map(p => p.category));
    const C = Array.from(uniqueCategories).map(cat => cat.charAt(0).toUpperCase()).join('');

    let orderNumber;
    let isUnique = false;
    while (!isUnique) {
        const X = Math.random().toString(36).substring(2, 8).toUpperCase();
        orderNumber = `P${P}Q${Q}C${C}${X}`;
        const existingOrder = await Order.findOne({ orderNumber });
        if (!existingOrder) {
            isUnique = true;
        }
    }
    return orderNumber;
}


export const createCheckoutSession = async (req, res) => {
    try {
        const { products, couponCode, shippingAddress } = req.body;

        if (!shippingAddress || !shippingAddress.postalCode) {
            return res.status(400).json({ error: "Endereço de entrega é obrigatório." });
        }

        const shippingCost = calculateShippingCost();
        const shippingCostInCents = Math.round(shippingCost * 100);

        let totalAmount = 0;

        const lineItems = products.map((product) => {
            const amount = Math.round(product.price * 100);
            totalAmount += amount * product.quantity;
            return {
                price_data: {
                    currency: "brl",
                    product_data: { name: product.name, images: [product.image] },
                    unit_amount: amount,
                },
                quantity: product.quantity || 1,
            };
        });

        lineItems.push({
            price_data: {
                currency: 'brl',
                product_data: { name: 'Custo de Envio' },
                unit_amount: shippingCostInCents,
            },
            quantity: 1,
        });

        let coupon = null;
        if (couponCode) {
            coupon = await Coupon.findOne({ code: couponCode, userId: req.user._id, isActive: true });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
            
            discounts: coupon ? [{ coupon: await createStripeCoupon(coupon.discountPercentage) }] : [],
            metadata: {
                userId: req.user._id.toString(),
                couponCode: couponCode || "",
                products: JSON.stringify(products.map((p) => ({ id: p._id, quantity: p.quantity, price: p.price }))),
                shippingCost: shippingCost,
                shippingAddress: JSON.stringify(shippingAddress),
            },
        });

        res.status(200).json({ id: session.id });
    } catch (error) {
        console.error("Error processing checkout:", error);
        res.status(500).json({ message: "Error processing checkout", error: error.message });
    }
};

export const checkoutSuccess = async (req, res) => {
    try {
        const { sessionId } = req.body;
        if (!sessionId) {
            return res.status(400).json({ message: "Session ID is required" });
        }

        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['payment_intent']
        });

        if (session.payment_status === "paid") {
            const existingOrder = await Order.findOne({ stripeSessionId: sessionId });

            if (existingOrder) {
                return res.status(200).json({
                    success: true,
                    message: "Order has already been processed.",
                    orderId: existingOrder._id,
                    orderNumber: existingOrder.orderNumber,
                });
            }

            if (session.metadata.couponCode) {
                await Coupon.findOneAndUpdate({ code: session.metadata.couponCode, userId: session.metadata.userId }, { isActive: false });
            }

            // --- INÍCIO DA ALTERAÇÃO ---
            // Pega o endereço do frontend dos metadados
            const frontendAddress = JSON.parse(session.metadata.shippingAddress);

            // Mapeia os campos para o formato do schema do banco de dados
            const mappedAddress = {
                line1: frontendAddress.street,
                line2: frontendAddress.neighborhood,
                city: frontendAddress.city,
                postal_code: frontendAddress.postalCode,
                country: frontendAddress.country,
                state: frontendAddress.state || null, // O campo 'state' não existe no formulário, então será nulo
            };
            // --- FIM DA ALTERAÇÃO ---

            const products = JSON.parse(session.metadata.products);
            const orderNumber = await generateUniqueOrderNumber(session.metadata.userId, products);

            const newOrder = new Order({
                orderNumber: orderNumber,
                user: session.metadata.userId,
                products: products.map((p) => ({ product: p.id, quantity: p.quantity, price: p.price })),
                totalAmount: session.amount_total / 100,
                stripeSessionId: sessionId,
                shippingAddress: mappedAddress, // ALTERADO: Usa o objeto mapeado
                shippingCost: parseFloat(session.metadata.shippingCost),
                paymentMethod: session.payment_intent.payment_method_types[0],
                status: "em processamento",
            });

            await newOrder.save();
            await User.findByIdAndUpdate(session.metadata.userId, { $set: { cartItems: [] } });

            res.status(200).json({
                success: true,
                message: "Payment successful, order created, and coupon deactivated if used.",
                orderId: newOrder._id,
                orderNumber: newOrder.orderNumber,
            });
        } else {
            res.status(400).json({ success: false, message: "Payment not successful." });
        }
    } catch (error) {
        console.error("Error processing successful checkout:", error);
        res.status(500).json({ message: "Error processing successful checkout", error: error.message });
    }
};

async function createStripeCoupon(discountPercentage) {
    const coupon = await stripe.coupons.create({
        percent_off: discountPercentage,
        duration: "once",
    });

    return coupon.id;
}