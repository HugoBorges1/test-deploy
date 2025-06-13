import { useEffect } from "react";
import { useOrderStore } from "../stores/useOrderStore";
import LoadingSpinner from "./LoadingSpinner";
import { Trash } from "lucide-react";

const AdminOrdersTab = () => {
    const { allOrders, fetchAllOrders, updateOrderStatus, deleteOrder, loading } = useOrderStore();
    const adminStatuses = ["em processamento", "confirmado", "enviado"];

    useEffect(() => {
        fetchAllOrders();
    }, [fetchAllOrders]);

    const handleStatusChange = (orderId, newStatus) => {
        updateOrderStatus(orderId, newStatus);
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="max-w-7xl mx-auto rounded-lg p-px bg-gradient-to-r from-[#606cfc] to-[#ff64c4]">
            <div className="bg-black rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-800">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID do Pedido</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Cliente</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Data</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Total</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-black divide-y divide-gray-700">
                        {allOrders.map((order) => (
                            <tr key={order._id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{order._id.substring(0, 8)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{order.user.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{new Date(order.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">R${order.totalAmount.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {/* Mostra o status como texto se já foi recebido, senão mostra o seletor */}
                                    {order.status === 'recebido' ? (
                                        <span className="px-3 py-1 text-sm font-semibold rounded-full bg-gray-500/20 text-gray-400">
                                            Recebido
                                        </span>
                                    ) : (
                                        <select
                                            value={order.status}
                                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                            className="bg-gray-700 text-white rounded-md p-1 border-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500"
                                        >
                                            {adminStatuses.map(status => (
                                                <option key={status} value={status}>{status}</option>
                                            ))}
                                        </select>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <button 
                                        onClick={() => deleteOrder(order._id)}
                                        className="text-red-500 hover:text-red-400"
                                        title="Deletar Pedido"
                                    >
                                        <Trash size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminOrdersTab;