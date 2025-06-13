import Product from "../models/product.model.js";

export const getCartProducts = async (req, res) => {
	try {
		// Filtra para garantir que estamos trabalhando apenas com itens de carrinho válidos
		const validCartItems = req.user.cartItems.filter(item => typeof item === 'object' && item.product);

		if (validCartItems.length === 0) {
			return res.json([]);
		}

		const productIds = validCartItems.map((item) => item.product);

		const products = await Product.find({ _id: { $in: productIds } }).lean();

		// Converte o array de produtos em um mapa para busca rápida
		const productMap = new Map(products.map(p => [p._id.toString(), p]));

		// Itera sobre os itens do carrinho do usuário e enriquece com os detalhes do produto
		const cartDetails = validCartItems.map(cartItem => {
			const productDetail = productMap.get(cartItem.product.toString());

			if (!productDetail) {
				return null; // Caso o produto tenha sido deletado
			}

			// Combina os detalhes do produto com os dados específicos do carrinho (quantidade, tamanho)
			return {
				...productDetail,
				_id: productDetail._id.toString(), // Garante que o ID do produto seja uma string
				quantity: cartItem.quantity,
				size: cartItem.size
			};
		}).filter(item => item !== null); // Remove itens nulos

		res.json(cartDetails);

	} catch (error) {
		console.log("Error in getCartProducts controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const addToCart = async (req, res) => {
	try {
		const { productId, size } = req.body;
		const user = req.user;

		if (!size) {
			return res.status(400).json({ message: "Product size is required" });
		}

		// Remove itens inválidos (strings) do carrinho antes de prosseguir
		user.cartItems = user.cartItems.filter(item => typeof item === 'object' && item.product);

		// Procura um item com o mesmo ID e tamanho
		const existingItem = user.cartItems.find(
			(item) => item.product.toString() === productId && item.size === size
		);

		if (existingItem) {
			existingItem.quantity += 1;
		} else {
			user.cartItems.push({ product: productId, size: size, quantity: 1 });
		}

		await user.save();
		res.json(user.cartItems);
	} catch (error) {
		console.log("Error in addToCart controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const removeAllFromCart = async (req, res) => {
	try {
		const { productId, size } = req.body; // ALTERADO: recebendo 'size'
		const user = req.user;

		if (!productId) { // Se nenhum productId for fornecido, limpa o carrinho
			user.cartItems = [];
		} else if (size) { // Se productId E size forem fornecidos, remove esse item específico
			user.cartItems = user.cartItems.filter(
				(item) => !(item.product.toString() === productId && item.size === size)
			);
		} else { // Se apenas productId for fornecido, remove todas as variantes daquele produto
			user.cartItems = user.cartItems.filter(
				(item) => !(item.product.toString() === productId)
			);
		}

		await user.save();
		res.json(user.cartItems);
	} catch (error) {
		console.log("Error in removeAllFromCart controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const updateQuantity = async (req, res) => {
	try {
		const { id: productId } = req.params;
		const { quantity, size } = req.body; // O tamanho também é importante aqui
		const user = req.user;

		// Procura um item com o mesmo ID e tamanho para atualizar
		const existingItem = user.cartItems.find(
			(item) => (item.product.toString() === productId && item.size === size)
		);

		if (existingItem) {
			if (quantity <= 0) {
				// Remove o item se a quantidade for 0 ou menos
				user.cartItems = user.cartItems.filter(
					(item) => !(item.product.toString() === productId && item.size === size)
				);
			} else {
				existingItem.quantity = quantity;
			}
			await user.save();
			res.json(user.cartItems);
		} else {
			res.status(404).json({ message: "Product not found in cart" });
		}
	} catch (error) {
		console.log("Error in updateQuantity controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};