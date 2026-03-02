"use client"

import {
    TrendingUp,
    TrendingDown,
    MoreHorizontal
} from "lucide-react"
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts'

const salesData = [
    { name: 'Mon', value: 4000 },
    { name: 'Tue', value: 3000 },
    { name: 'Wed', value: 5000 },
    { name: 'Thu', value: 2780 },
    { name: 'Fri', value: 1890 },
    { name: 'Sat', value: 6390 },
    { name: 'Sun', value: 3490 },
]


const simpleWaveData = [
    { value: 10 }, { value: 20 }, { value: 15 }, { value: 30 }, { value: 25 }, { value: 40 }, { value: 35 }, { value: 50 }
]

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

export default function AdminDashboard() {
    return (
        <div className="space-y-6">


            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Doanh thu</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">$128,430</h3>
                        </div>
                        <div className="flex items-center gap-1 text-green-500 bg-green-50 px-2 py-1 rounded-full text-xs font-bold">
                            <TrendingUp className="h-3 w-3" />
                            <span>+12%</span>
                        </div>
                    </div>
                    <SimpleAreaChart color="#F97316" data={simpleWaveData} />
                </div>


                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Tổng đơn hàng</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">15,204</h3>
                        </div>
                        <div className="flex items-center gap-1 text-green-500 bg-green-50 px-2 py-1 rounded-full text-xs font-bold">
                            <TrendingUp className="h-3 w-3" />
                            <span>+5%</span>
                        </div>
                    </div>
                    <SimpleAreaChart color="#F97316" data={simpleWaveData.map(i => ({ value: i.value * 0.8 }))} />
                </div>


                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Người dùng hoạt động</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">8,942</h3>
                        </div>
                        <div className="flex items-center gap-1 text-green-500 bg-green-50 px-2 py-1 rounded-full text-xs font-bold">
                            <TrendingUp className="h-3 w-3" />
                            <span>+18%</span>
                        </div>
                    </div>
                    <SimpleAreaChart color="#F97316" data={simpleWaveData.slice().reverse()} />
                </div>


                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Tỷ lệ tăng trưởng</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">24.5%</h3>
                        </div>
                        <div className="flex items-center gap-1 text-green-500 bg-green-50 px-2 py-1 rounded-full text-xs font-bold">
                            <TrendingUp className="h-3 w-3" />
                            <span>+2%</span>
                        </div>
                    </div>
                    <SimpleAreaChart color="#F97316" data={simpleWaveData} />
                </div>
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Phân tích doanh thu</h3>
                            <p className="text-sm text-gray-500 mt-1">Theo dõi doanh thu trong 7 ngày qua</p>
                        </div>
                        <button className="flex items-center gap-2 text-sm font-medium text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg hover:bg-gray-100">
                            Weekly
                        </button>
                    </div>

                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#F97316" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} dy={10} />
                                <Tooltip />
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


                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Món ăn phổ biến</h3>
                        <p className="text-sm text-gray-500 mt-1">Top món ăn bán chạy</p>
                    </div>
                    <div className="space-y-6">
                        {[
                            { name: "Quinoa Power Bowl", orders: "1,240", percent: 85 },
                            { name: "Avocado Toast XL", orders: "980", percent: 70 },
                            { name: "Grilled Salmon Salad", orders: "850", percent: 55 },
                            { name: "Acai Super Berry", orders: "720", percent: 45 },
                            { name: "Mediterranean Wrap", orders: "640", percent: 35 },
                        ].map((item, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-sm font-medium mb-2">
                                    <span className="text-gray-900">{item.name}</span>
                                    <span className="text-gray-500">{item.orders} đơn</span>
                                </div>
                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-orange-500 rounded-full"
                                        style={{ width: `${item.percent}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>


            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50">
                    <h3 className="text-lg font-bold text-gray-900">Tóm tắt hiệu suất gần đây</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 font-bold tracking-wider">Ngày</th>
                                <th className="px-6 py-4 font-bold tracking-wider">Chỉ số</th>
                                <th className="px-6 py-4 font-bold tracking-wider">Giá trị hiện tại</th>
                                <th className="px-6 py-4 font-bold tracking-wider">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            <tr>
                                <td className="px-6 py-4 text-gray-900 font-medium">24/10/2023</td>
                                <td className="px-6 py-4 text-gray-600">Số lượng đăng ký hoạt động</td>
                                <td className="px-6 py-4 text-gray-900">2,431</td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Xuất sắc
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 text-gray-900 font-medium">23/10/2023</td>
                                <td className="px-6 py-4 text-gray-600">Hiệu quả giao hàng</td>
                                <td className="px-6 py-4 text-gray-900">94.2%</td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        Ổn định
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
