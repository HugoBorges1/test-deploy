import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

const getErrorMessage = (error, defaultMessage) => {
	return error.response?.data?.message || error.message || defaultMessage;
};

export const useCartStore = create((set, get) => ({
    cart: [],
    coupon: null,
    total: 0,
    subtotal: 0,
    isCouponApplied: false,
    
    // NOVO: Estado para o endereço de entrega
    shippingAddress: {
        street: "",
        neighborhood: "",
        city: "",
        country: "BR", // Padrão
        postalCode: "",
    },

    // NOVO: Ação para atualizar o endereço
    setShippingAddress: (address) => set((state) => ({
        shippingAddress: { ...state.shippingAddress, ...address }
    })),

	getMyCoupon: async () => {
		try {
			const response = await axios.get("/coupons");
			set({ coupon: response.data });
		} catch (error) {
			console.error("Error fetching coupon:", getErrorMessage(error, "Could not fetch coupon."));
		}
	},
	applyCoupon: async (code) => {
		try {
			const response = await axios.post("/coupons/validate", { code });
			set({ coupon: response.data, isCouponApplied: true });
			get().calculateTotals();
			toast.success("Coupon applied successfully");
		} catch (error) {
			toast.error(getErrorMessage(error, "Failed to apply coupon"));
		}
	},
	removeCoupon: () => {
		set({ coupon: null, isCouponApplied: false });
		get().calculateTotals();
		toast.success("Coupon removed");
	},
	getCartItems: async () => {
		try {
			const res = await axios.get("/cart");
			set({ cart: res.data });
			get().calculateTotals();
		} catch (error) {
			// ALTERADO: Tratamento de erro seguro. Não mostra toast, apenas loga o erro.
			console.error("Failed to fetch cart items:", getErrorMessage(error));
			set({ cart: [] }); // Limpa o carrinho em caso de erro para evitar estado inconsistente
		}
	},
	clearCart: async () => {
		// Esta função é para o sucesso da compra, então apenas limpa o estado local
		set({ cart: [], coupon: null, total: 0, subtotal: 0 });
	},
	addToCart: async (product, size) => {
		try {
			await axios.post("/cart", { productId: product._id, size: size });
			toast.success("Product added to cart");

			const state = get();
			const existingItem = state.cart.find(
				(item) => item._id === product._id && item.size === size
			);

			let newCart;
			if (existingItem) {
				newCart = state.cart.map((item) =>
					item._id === product._id && item.size === size
						? { ...item, quantity: item.quantity + 1 }
						: item
				);
			} else {
				newCart = [...state.cart, { ...product, quantity: 1, size: size }];
			}
			set({ cart: newCart });
			get().calculateTotals();
		} catch (error) {
			toast.error(getErrorMessage(error, "An error occurred while adding to cart."));
		}
	},
	// ALTERADO: Função de remover agora é mais específica
	removeFromCart: async (productId, size) => {
		try {
			await axios.delete(`/cart`, { data: { productId, size } });
			set((prevState) => ({
				cart: prevState.cart.filter((item) => !(item._id === productId && item.size === size)),
			}));
			get().calculateTotals();
			toast.success("Item removed from cart.");
		} catch (error) {
			toast.error(getErrorMessage(error, "Failed to remove item."));
		}
	},
	// ALTERADO: Função de atualizar agora está correta e mais simples
	updateQuantity: async (productId, quantity, size) => {
		if (quantity <= 0) {
			// Se a quantidade for zero ou menos, remove o item
			return get().removeFromCart(productId, size);
		}

		try {
			await axios.put(`/cart/${productId}`, { quantity, size });
			set((prevState) => ({
				cart: prevState.cart.map((item) =>
					item._id === productId && item.size === size ? { ...item, quantity } : item
				),
			}));
			get().calculateTotals();
		} catch (error) {
			toast.error(getErrorMessage(error, "Failed to update quantity"));
		}
	},
	calculateTotals: () => {
		const { cart, coupon, isCouponApplied } = get();
		const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
		let total = subtotal;

		if (coupon && isCouponApplied) {
			const discount = subtotal * (coupon.discountPercentage / 100);
			total = subtotal - discount;
		}

		set({ subtotal, total });
	},
}));