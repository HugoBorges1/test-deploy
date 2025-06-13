import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import axios from "../lib/axios";
import { Users, Package, ShoppingCart, DollarSign } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const AnalyticsTab = () => {
	const [analyticsData, setAnalyticsData] = useState({
		users: 0,
		products: 0,
		totalSales: 0,
		totalRevenue: 0,
	});
	const [isLoading, setIsLoading] = useState(true);
	const [dailySalesData, setDailySalesData] = useState([]);

	useEffect(() => {
		const fetchAnalyticsData = async () => {
			try {
				const response = await axios.get("/analytics");
				setAnalyticsData(response.data.analyticsData);
				setDailySalesData(response.data.dailySalesData);
			} catch (error) {
				console.error("Error fetching analytics data:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchAnalyticsData();
	}, []);

	if (isLoading) {
		return <div>Carregando...</div>;
	}

	return (
		<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
				{/* ALTERADO: Chamadas ao AnalyticsCard atualizadas, sem a prop 'color' */}
				<AnalyticsCard
					title='Usuários totais'
					value={analyticsData.users.toLocaleString()}
					icon={Users}
				/>
				<AnalyticsCard
					title='Produtos totais'
					value={analyticsData.products.toLocaleString()}
					icon={Package}
				/>
				<AnalyticsCard
					title='Vendas totais'
					value={analyticsData.totalSales.toLocaleString()}
					icon={ShoppingCart}
				/>
				<AnalyticsCard
					title='Receita total'
					value={`R$ ${analyticsData.totalRevenue.toLocaleString()}`}
					icon={DollarSign}
				/>
			</div>
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.25 }}
			>
				<ResponsiveContainer width='100%' height={400}>
					<LineChart data={dailySalesData}>
						<CartesianGrid strokeDasharray='3 3' />
						<XAxis dataKey='date' stroke='#FFFFFF' />
						<YAxis yAxisId='left' stroke='#FFFFFF' />
						<YAxis yAxisId='right' orientation='right' stroke='#FFFFFF' />
						<Tooltip
							contentStyle={{
								backgroundColor: "rgba(20, 20, 20, 0.8)",
								borderColor: "#606cfc",
							}}
						/>
						<Legend />
						<Line
							yAxisId='left'
							type='monotone'
							dataKey='sales'
							stroke='#ff64c4'
							strokeWidth={2}
							activeDot={{ r: 8 }}
							name='Vendas'
						/>
						<Line
							yAxisId='right'
							type='monotone'
							dataKey='revenue'
							stroke='#606cfc'
							strokeWidth={2}
							activeDot={{ r: 8 }}
							name='Receita'
						/>
					</LineChart>
				</ResponsiveContainer>
			</motion.div>
		</div>
	);
};
export default AnalyticsTab;

// ALTERADO: O componente AnalyticsCard foi reestilizado para usar o gradiente diretamente
const AnalyticsCard = ({ title, value, icon: Icon }) => (
	<motion.div
		className={`bg-gradient-to-r from-[#606cfc] to-[#ff64c4] rounded-lg p-6 shadow-lg overflow-hidden relative`}
		initial={{ opacity: 0, y: 20 }}
		animate={{ opacity: 1, y: 0 }}
		transition={{ duration: 0.5 }}
	>
		<div className='flex justify-between items-center'>
			<div className='z-10'>
				<p className='text-white/80 text-sm mb-1 font-semibold'>{title}</p>
				<h3 className='text-white text-3xl font-bold'>{value}</h3>
			</div>
		</div>
		<div className='absolute -bottom-4 -right-4 text-white/10'>
			<Icon className='h-32 w-32' />
		</div>
	</motion.div>
);