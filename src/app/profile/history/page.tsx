"use client"

import { useState, useEffect } from "react"
import { formatVnDateTime } from "@/utils/date-utils"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import {
    ChevronRight,
    ReceiptText,
    Lightbulb,
    Flame,
    Leaf
} from "lucide-react"
import Link from "next/link"
import { ReviewDialog } from "@/components/shared/ReviewDialog"

const MOCK_ORDERS = [
    {
        id: "SB-2024-001",
        date: "24 Tháng 5, 2024 • 12:30",
        price: "125.000 đ",
        status: "Đã hoàn thành",
        calories: "650",
        protein: "35g",
        items: [
            { id: 1, name: "Cơm Gà Hội An", image: "/dishes/dish-1.jpg" },
            { id: 2, name: "Nước Ép Cần Tây", image: "/dishes/drink-1.jpg" }
        ]
    },
    {
        id: "SB-2024-002",
        date: "23 Tháng 5, 2024 • 18:45",
        price: "95.000 đ",
        status: "Đã hoàn thành",
        calories: "450",
        protein: "28g",
        items: [
            { id: 3, name: "Salad Ức Gà", image: "/dishes/dish-2.jpg" }
        ]
    }
]

export default function OrderHistoryPage() {
    const [isMounted, setIsMounted] = useState(false)
    const [activeTab, setActiveTab] = useState('Tất cả')
    const [orders, setOrders] = useState<any[]>(MOCK_ORDERS)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        setIsMounted(true)

        const fetchOrders = async () => {
            try {
                const res = await fetch('/api/orders');
                if (res.ok) {
                    const data = await res.json();
                    if (data.orders && Array.isArray(data.orders)) {
                        const statusMap: Record<number, string> = {
                            0: 'Đã hủy',
                            1: 'Đang chờ',
                            2: 'Đã xác nhận',
                            3: 'Đang nấu',
                            4: 'Đang giao',
                            5: 'Đã hoàn thành'
                        };

                        const formattedOrders = data.orders.map((o: any) => ({
                            id: o.orderid,
                            date: formatVnDateTime(o.ordertime),
                            price: new Intl.NumberFormat('vi-VN').format(o.finalamount) + ' đ',
                            status: statusMap[o.orderstatus] || 'Đang giao',
                            calories: o.orderitems?.reduce((sum: number, item: any) => sum + (item.fooditems?.calories || 0), 0) || 0,
                            protein: (o.orderitems?.reduce((sum: number, item: any) => sum + (item.fooditems?.protein || 0), 0) || 0) + 'g',
                            items: o.orderitems?.map((item: any) => ({
                                id: item.foodid,
                                name: item.fooditems?.foodname,
                                image: item.fooditems?.foodimageurl
                            })) || []
                        }));
                        setOrders(formattedOrders);
                    }
                }
            } catch (error) {
                console.error("Lỗi khi tải đơn hàng:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, [])

    if (!isMounted) return null

    const filteredOrders = activeTab === 'Tất cả'
        ? orders
        : orders.filter((order: any) => order.status === activeTab)

    const completedOrdersTotalCalories = orders
        .filter((order: any) => order.status === 'Đã hoàn thành')
        .reduce((sum, order) => sum + (Number(order.calories) || 0), 0)

    const calorieGoal = 2000
    const caloriePercentage = Math.min(Math.round((completedOrdersTotalCalories / calorieGoal) * 100), 100)

    return (
        <div className="min-h-screen bg-[#FDFDFD] dark:bg-gray-950 flex flex-col font-sans transition-colors">
            <Navbar />

            <main className="flex-grow container mx-auto px-4 py-12 max-w-6xl">
                <div className="mb-8 md:mb-10">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight leading-tight">Lịch sử Đơn hàng</h1>
                    <p className="text-sm md:text-lg text-gray-500 dark:text-gray-400 mt-2">Theo dõi các món ăn và lượng calo của bạn</p>
                </div>

                <div className="grid lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-8 space-y-6">
                        <div className="flex flex-wrap gap-3 mb-6">
                            {['Tất cả', 'Đang giao', 'Đã hoàn thành', 'Đã hủy'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${activeTab === tab
                                        ? 'bg-orange-500 text-white shadow-md shadow-orange-200 dark:shadow-orange-900/20'
                                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-4">
                            {filteredOrders.length > 0 ? filteredOrders.map((order: any) => (
                                <div key={order.id} className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow group">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-orange-50 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center text-orange-500 dark:text-orange-400 group-hover:scale-110 transition-transform">
                                                <ReceiptText className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 dark:text-gray-100">Đơn hàng #{order.id}</h3>
                                                <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mt-0.5">{order.date}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4 md:gap-6 w-full sm:w-auto">
                                            <div className="flex items-center justify-between w-full sm:w-auto sm:flex-col sm:items-end gap-2">
                                                <span className={`px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider ${order.status === 'Đã hoàn thành' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                                                    order.status === 'Đang giao' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                                                        order.status === 'Đã hủy' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                                                            'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                                <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1">
                                                    <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-tighter sm:hidden">Tổng</p>
                                                    <p className="font-bold text-gray-900 dark:text-gray-100 text-sm md:text-base">{order.price}</p>
                                                </div>
                                            </div>

                                            <div className="h-8 w-px bg-gray-100 dark:bg-gray-800 hidden sm:block"></div>

                                            <div className="flex items-center justify-between w-full sm:w-auto gap-8 border-t border-gray-50 dark:border-gray-800 pt-3 sm:pt-0 sm:border-0 mt-1 sm:mt-0">
                                                <div className="flex flex-col">
                                                    <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-tighter mb-0.5">Năng lượng</p>
                                                    <p className="font-bold text-orange-500 dark:text-orange-400 text-sm">{order.calories} kcal</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    {order.status === 'Đã hoàn thành' && (
                                                        <ReviewDialog
                                                            orderId={order.id}
                                                            type="order"
                                                            orderItems={order.items.map((item: any) => ({
                                                                foodid: item.id || 0,
                                                                quantity: 1,
                                                                fooditems: {
                                                                    foodname: item.name,
                                                                    foodimageurl: item.image || ""
                                                                }
                                                            }))}
                                                        />
                                                    )}
                                                    <Link href={`/order/${order.id}`}>
                                                        <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/30 hover:text-orange-500 dark:hover:text-orange-400 transition-colors">
                                                            <ChevronRight className="w-5 h-5" />
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-gray-50 dark:border-gray-800 flex flex-wrap gap-2">
                                        {order.items.map((item: any, idx: number) => (
                                            <span key={idx} className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-xl text-xs font-semibold hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-500 dark:hover:text-orange-400 transition-colors cursor-default">
                                                {item.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )) : (
                                <div className="bg-white dark:bg-gray-900 rounded-3xl p-16 text-center border border-gray-100 dark:border-gray-800 shadow-sm">
                                    <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <ReceiptText className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Chưa có đơn hàng nào</h3>
                                    <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-xs mx-auto">Bạn chưa đặt món quà nào từ SmartBite. Hãy khám phá thực đơn của chúng tôi!</p>
                                    <Link href="/menu">
                                        <Button className="rounded-2xl bg-[#111827] dark:bg-orange-500 hover:bg-black dark:hover:bg-orange-600 text-white px-8 h-12 font-bold shadow-lg shadow-gray-200 dark:shadow-orange-900/20">
                                            Khám phá thực đơn
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 dark:bg-orange-900/20 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 relative">Thống kê Calo</h2>
                            <div className="space-y-6 relative">
                                <div className="flex items-end gap-1">
                                    <span className="text-5xl font-black text-orange-500 leading-none">{completedOrdersTotalCalories.toLocaleString('vi-VN')}</span>
                                    <span className="text-gray-400 dark:text-gray-500 font-bold text-sm mb-1 uppercase tracking-widest">KCAL</span>
                                </div>
                                <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner">
                                    <div
                                        className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full relative transition-all duration-1000"
                                        style={{ width: `${caloriePercentage}%` }}
                                    >
                                        <div className="absolute top-0 right-0 w-1.5 h-full bg-white/20"></div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-50 dark:border-gray-800">
                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Mục tiêu: {calorieGoal.toLocaleString('vi-VN')} kcal</span>
                                    <span className="text-xs font-bold text-green-500 dark:text-green-400 tracking-wide">Đạt {caloriePercentage}%</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Dinh dưỡng đã dùng</h2>
                            <div className="space-y-5">
                                <div className="flex flex-col gap-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 dark:text-gray-400 font-medium">Chất đạm</span>
                                        <span className="font-bold text-gray-900 dark:text-gray-100">120g <span className="text-gray-400 dark:text-gray-500 font-normal">/ 150g</span></span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-50 dark:bg-gray-800 rounded-full overflow-hidden">
                                        <div className="w-[80%] h-full bg-blue-500 rounded-full shadow-sm"></div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 dark:text-gray-400 font-medium">Tinh bột</span>
                                        <span className="font-bold text-gray-900 dark:text-gray-100">210g <span className="text-gray-400 dark:text-gray-500 font-normal">/ 250g</span></span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-50 dark:bg-gray-800 rounded-full overflow-hidden">
                                        <div className="w-[84%] h-full bg-green-500 rounded-full shadow-sm"></div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 dark:text-gray-400 font-medium">Chất béo</span>
                                        <span className="font-bold text-gray-900 dark:text-gray-100">45g <span className="text-gray-400 dark:text-gray-500 font-normal">/ 65g</span></span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-50 dark:bg-gray-800 rounded-full overflow-hidden">
                                        <div className="w-[69%] h-full bg-yellow-500 rounded-full shadow-sm"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#111827] dark:bg-gray-800 rounded-3xl p-8 shadow-lg shadow-gray-200 dark:shadow-none text-white relative overflow-hidden group">
                            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/5 rounded-full transition-transform group-hover:scale-125"></div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">
                                    <Lightbulb className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="font-bold text-lg">Lời khuyên AI</h3>
                            </div>
                            <p className="text-gray-300 dark:text-gray-300 text-sm leading-relaxed mb-6 font-medium">
                                "Bạn đã đạt được lượng đạm lý tưởng cho hôm nay! Hãy tập trung vào việc bổ sung thêm chất xơ từ rau xanh vào bữa tối nhé."
                            </p>
                            <Button className="w-full bg-white dark:bg-orange-500 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-orange-600 font-bold rounded-2xl h-12 shadow-md transition-colors">
                                Xem phân tích chi tiết
                            </Button>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>

    )
}
