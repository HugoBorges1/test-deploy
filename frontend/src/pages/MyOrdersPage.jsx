import { useEffect } from "react";
import { useLocation } from "react-router-dom"; 
import { useOrderStore } from "../stores/useOrderStore";
import OrderCard from "../components/OrderCard";
import LoadingSpinner from "../components/LoadingSpinner";

const MyOrdersPage = () => {
    const { myOrders, fetchMyOrders, loading } = useOrderStore();
    const location = useLocation();

    useEffect(() => {
        fetchMyOrders();
    }, [fetchMyOrders]);

    const highlightedOrderId = location.hash.substring(1);

    if (loading) return <LoadingSpinner />;

    return (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-[#606cfc] to-[#ff64c4] text-transparent bg-clip-text">
                Meus Pedidos
            </h1>
            <div className="space-y-6">
                {myOrders.length === 0 ? (
                    <p className="text-center text-gray-400">Você ainda não fez nenhum pedido.</p>
                ) : (
                    myOrders.map((order) => (
                        <OrderCard
                            key={order._id}
                            order={order}
                            isInitiallyOpen={order._id === highlightedOrderId}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default MyOrdersPage;