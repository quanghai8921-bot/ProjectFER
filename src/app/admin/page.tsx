"use client"

import { useState, useEffect } from "react"
import { TrendingUp, TrendingDown, MoreHorizontal } from "lucide-react"
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer
} from 'recharts'

const SimpleAreaChart = ({ color, data }: { color: string, data: any[] }) => (
    <ResponsiveContainer width="100%" height={50}>
        <AreaChart data={data}>
            <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                fill="none"
                strokeWidth={2}
            />
        </AreaChart>
    </ResponsiveContainer>
)

interface DashboardStats {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    salesTrend: { date: string, revenue: number }[];
}

interface PopularDish {
    id: string;
    name: string;
    orders: number;
    percent: number;
    image?: string;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [popularDishes, setPopularDishes] = useState<PopularDish[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setIsLoading(true);
                const [statsRes, ordersRes] = await Promise.all([
                    fetch('/api/admin/stats'),
                    fetch('/api/orders')
                ]);

                if (statsRes.ok && ordersRes.ok) {
                    const statsData = await statsRes.json();
                    const ordersData = await ordersRes.json();

                    setStats(statsData.stats);

                    // Calculate popular dishes from orders
                    const dishSales: Record<string, { count: number, name: string, image?: string }> = {};
                    ordersData.orders.forEach((order: any) => {
                        order.orderitems.forEach((item: any) => {
                            const foodId = item.foodid;
                            if (!dishSales[foodId]) {
                                dishSales[foodId] = {
                                    count: 0,
                                    name: item.fooditems?.foodname || "Món ăn ẩn",
                                    image: item.fooditems?.foodimageurl
                                };
                            }
                            dishSales[foodId].count += (item.quantity || 1);
                        });
                    });

                    const sortedDishes = Object.entries(dishSales)
                        .map(([id, data]) => ({
                            id,
                            name: data.name,
                            orders: data.count,
                            image: data.image,
                            percent: 100 // To be calculated relative to top seller
                        }))
                        .sort((a, b) => b.orders - a.orders)
                        .slice(0, 5);

                    const topSeller = sortedDishes[0]?.orders || 1;
                    sortedDishes.forEach(d => d.percent = (d.orders / topSeller) * 100);

                    setPopularDishes(sortedDishes);
                }
            } catch (error) {
                console.error("Dashboard data fetch error:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    }

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Đang tải dữ liệu thực tế...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Doanh thu</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                                {formatCurrency(stats?.totalRevenue || 0)}
                            </h3>
                        </div>
                        <div className="flex items-center gap-1 text-green-500 bg-green-50 dark:bg-green-950/30 px-2 py-1 rounded-full text-xs font-bold">
                            <TrendingUp className="h-3 w-3" />
                            <span>+Thực tế</span>
                        </div>
                    </div>
                    <SimpleAreaChart color="#F97316" data={stats?.salesTrend.map(s => ({ value: s.revenue })) || []} />
                </div>

                <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Tổng đơn hàng</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                                {stats?.totalOrders || 0}
                            </h3>
                        </div>
                        <div className="flex items-center gap-1 text-green-500 bg-green-50 dark:bg-green-950/30 px-2 py-1 rounded-full text-xs font-bold">
                            <TrendingUp className="h-3 w-3" />
                            <span>+{stats?.totalOrders}</span>
                        </div>
                    </div>
                    <SimpleAreaChart color="#F97316" data={Array(8).fill(0).map(() => ({ value: Math.random() * 50 }))} />
                </div>

                <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Khách hàng</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                                {stats?.totalCustomers || 0}
                            </h3>
                        </div>
                        <div className="flex items-center gap-1 text-green-500 bg-green-50 dark:bg-green-950/30 px-2 py-1 rounded-full text-xs font-bold">
                            <TrendingUp className="h-3 w-3" />
                            <span>Hoạt động</span>
                        </div>
                    </div>
                    <SimpleAreaChart color="#F97316" data={Array(8).fill(0).map(() => ({ value: Math.random() * 50 }))} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Xu hướng doanh thu</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Biểu đồ doanh thu 7 ngày gần nhất</p>
                        </div>
                    </div>

                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats?.salesTrend.map(s => ({ name: new Date(s.date).toLocaleDateString('vi-VN', { weekday: 'short' }), value: s.revenue })) || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#F97316" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} dy={10} />
                                <Tooltip formatter={(value: any) => formatCurrency(Number(value) || 0)} />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#F97316"
                                    fillOpacity={1}
                                    fill="url(#colorSales)"
                                    strokeWidth={3}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Top món ăn bán chạy</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Dựa trên số lượng đơn hàng thực tế</p>
                    </div>
                    <div className="space-y-6">
                        {popularDishes.map((item, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-sm font-medium mb-2">
                                    <span className="text-gray-900 dark:text-gray-100">{item.name}</span>
                                    <span className="text-gray-500 dark:text-gray-400">{item.orders} suất</span>
                                </div>
                                <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-orange-500 rounded-full transition-all duration-1000"
                                        style={{ width: `${item.percent}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 dark:border-gray-800">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Hiệu suất món ăn theo doanh số</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50/50 dark:bg-gray-800/50">
                            <tr>
                                <th className="px-6 py-4 font-bold tracking-wider">Món ăn</th>
                                <th className="px-6 py-4 font-bold tracking-wider text-center">Số suất bán được</th>
                                <th className="px-6 py-4 font-bold tracking-wider text-right">Tỉ lệ so với top</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                            {popularDishes.map((dish, idx) => (
                                <tr key={dish.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {dish.image && (
                                                <div className="w-8 h-8 rounded-lg overflow-hidden border border-gray-100 dark:border-gray-800">
                                                    <img src={dish.image} alt={dish.name} className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                            <span className="text-gray-900 dark:text-gray-100 font-medium">{dish.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">{dish.orders}</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${idx === 0 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}>
                                            {Math.round(dish.percent)}%
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
