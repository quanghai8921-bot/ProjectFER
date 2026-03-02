"use client"

import { useState, useEffect } from "react"
import { BarChart3, TrendingUp, Users, ShoppingBag, DollarSign, Calendar } from "lucide-react"
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts"

export default function Reports() {
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadStats = async () => {
            try {
                const res = await fetch('/api/admin/stats');
                if (res.ok) {
                    const data = await res.json();
                    setStats(data.stats);
                }
            } catch (error) {
                console.error("Load Stats Error:", error);
            } finally {
                setLoading(false);
            }
        }
        loadStats();
    }, []);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    }

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Chạy báo cáo</div>
    }

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Báo cáo kinh doanh</h1>
                    <p className="text-gray-500 mt-1">Tổng quan về hiệu suất kinh doanh của bạn</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 flex items-center gap-2 shadow-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-600">Tổng quan mọi thời điểm</span>
                </div>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                            <DollarSign className="w-6 h-6" />
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Tổng doanh thu</p>
                        <h3 className="text-2xl font-bold text-gray-900">{formatPrice(stats?.totalRevenue || 0)}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                            <ShoppingBag className="w-6 h-6" />
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Tổng đơn hàng</p>
                        <h3 className="text-2xl font-bold text-gray-900">{stats?.totalOrders || 0}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-500">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Giá trị đơn hàng trung bình</p>
                        <h3 className="text-2xl font-bold text-gray-900">{formatPrice(stats?.averageOrderValue || 0)}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500">
                            <Users className="w-6 h-6" />
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Tổng khách hàng</p>
                        <h3 className="text-2xl font-bold text-gray-900">{stats?.totalCustomers || 0}</h3>
                    </div>
                </div>
            </div>


            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                    <BarChart3 className="w-5 h-5 text-gray-500" />
                    <h3 className="font-bold text-gray-900 text-lg">Xu hướng doanh thu (Ngày hoạt động gần nhất)</h3>
                </div>
                <div className="h-80 w-full">
                    {stats?.salesTrend && stats.salesTrend.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.salesTrend}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(tick) => new Date(tick).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    tickFormatter={(tick) => `${(tick / 1000).toLocaleString('vi-VN')}k`}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                    width={80}
                                />
                                <Tooltip
                                    formatter={(value: any) => [formatPrice(Number(value) || 0), 'Doanh thu']}
                                    labelFormatter={(label) => new Date(label).toLocaleDateString('vi-VN')}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#f97316"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            Chưa có dữ liệu doanh thu.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
