"use client"

import { useState, useEffect } from "react"
import { formatVnDateTime } from "@/utils/date-utils"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import {
    ChevronRight,
    HelpCircle,
    ReceiptText,
    Check,
    ChefHat,
    Bike,
    MessageSquare,
    PhoneCall,
    MapPin,
    Clock,
    CreditCard,
    Lightbulb,
    Flame,
    Leaf
} from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ReviewDialog } from "@/components/shared/ReviewDialog"

export default function OrderTrackingPage() {
    const params = useParams()
    const [isMounted, setIsMounted] = useState(false)
    const [orderStatus, setOrderStatus] = useState<string | null>(null)
    const [currentOrder, setCurrentOrder] = useState<any>(null)
    const [notFound, setNotFound] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        setIsMounted(true)

        const fetchOrder = async () => {
            try {
                const res = await fetch(`/api/orders/${params.id}`, { cache: 'no-store' });
                if (res.status === 404) {
                    setNotFound(true);
                    setIsLoading(false);
                    return;
                }
                if (res.ok) {
                    const data = await res.json();
                    if (data.order) {
                        setNotFound(false);
                        setIsLoading(false);
                        const o = data.order;
                        const statusMap: Record<number, string> = {
                            0: 'đã hủy',
                            1: 'đang chờ',
                            2: 'đã xác nhận',
                            3: 'đang chuẩn bị',
                            4: 'đang giao',
                            5: 'đã hoàn thành'
                        };

                        setOrderStatus(statusMap[o.orderstatus] || 'đang chờ');

                        if (o.orderstatus === 0) {
                            alert("Đơn hàng của bạn đã bị hủy bởi hệ thống/admin.");
                            window.location.href = "/profile/history";
                            return;
                        }


                        const paymentInfo = Array.isArray(o.payments) ? o.payments[0] : o.payments;
                        setCurrentOrder({
                            id: o.orderid,
                            time: formatVnDateTime(o.ordertime),
                            displayTime: o.ordertime ? new Date(o.ordertime).toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false,
                                timeZone: 'Asia/Ho_Chi_Minh'
                            }) : "--:--",
                            price: new Intl.NumberFormat('vi-VN').format(o.finalamount) + ' đ',
                            status: statusMap[o.orderstatus] || 'đang chờ',
                            address: o.deliveryaddress,
                            paymentMethod: paymentInfo?.paymentmethod || 'Unknown',
                            paymentStatus: paymentInfo?.paymentstatus || 'pending',
                            cartDetails: o.orderitems?.map((oi: any) => {
                                const toppingObj: any = {};
                                const toppingsStr = oi.orderitemtoppings?.map((t: any) => t.toppingoptions?.toppingname).filter(Boolean).join(", ");
                                if (toppingsStr) toppingObj["Thêm"] = toppingsStr;

                                return {
                                    id: oi.foodid,
                                    title: oi.fooditems?.foodname,
                                    image: oi.fooditems?.foodimageurl,
                                    price: oi.unitprice,
                                    extraPrice: oi.orderitemtoppings?.reduce((sum: number, t: any) => sum + (Number(t.price) || 0), 0) || 0,
                                    quantity: oi.quantity,
                                    options: toppingObj
                                };
                            }) || []
                        });
                    }
                }
            } catch (error) {
                console.error("Fetch Order Error:", error);
            }
        }

        fetchOrder()
        const interval = setInterval(fetchOrder, 5000)

        return () => clearInterval(interval)
    }, [params.id])

    const handleCompleteOrder = async () => {
        try {
            const res = await fetch(`/api/orders/${params.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'completed' })
            });
            if (res.ok) {
                setOrderStatus('đã hoàn thành');
            }
        } catch (error) {
            console.error("Lỗi hoàn thành đơn hàng:", error);
        }
    };

    if (!isMounted) return null

    const currentStatus = orderStatus || 'pending'


    if (notFound && (params.id as string)?.startsWith('SB-')) {
        return (
            <div className="min-h-screen bg-[#FDFDFD] dark:bg-gray-950 flex flex-col font-sans text-sans transition-colors duration-300">
                <Navbar />
                <main className="flex-grow container mx-auto px-4 py-20 max-w-2xl text-center">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl p-12 shadow-sm border border-gray-100 dark:border-gray-800">
                        <div className="w-20 h-20 bg-orange-50 dark:bg-orange-950/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <HelpCircle className="w-10 h-10 text-orange-500" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 tracking-tight">Không tìm thấy Đơn hàng</h1>
                        <p className="text-gray-500 dark:text-gray-400 mb-10 leading-relaxed text-lg">
                            Chúng tôi không thể tìm thấy thông tin cho đơn hàng <span className="font-bold text-orange-600 block sm:inline">#{params.id}</span>.
                        </p>
                        <Link href="/">
                            <Button className="rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold h-14 px-8">
                                Quay lại trang chủ
                            </Button>
                        </Link>
                    </div>
                </main>
                <Footer />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#FDFDFD] dark:bg-gray-950 flex flex-col font-sans transition-colors duration-300">
            <Navbar />

            <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">

                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-6 flex items-center gap-2">
                    <Link href="/" className="hover:text-orange-500 transition-colors">Trang chủ</Link>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-gray-900 dark:text-gray-100">Theo dõi đơn hàng</span>
                </div>


                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">Đơn hàng {params.id ? `#${params.id}` : ''}</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Thời gian đặt: <span className="font-bold text-orange-500">{currentOrder?.displayTime || currentOrder?.time || "--:--"}</span></p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                        {currentStatus === 'đang giao' && (
                            <Button
                                onClick={handleCompleteOrder}
                                className="rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold shadow-sm py-6 md:py-2"
                            >
                                <Check className="w-4 h-4 mr-2" />
                                Xác nhận đã nhận hàng
                            </Button>
                        )}
                        <div className="flex flex-col sm:flex-row items-stretch gap-3">
                            <a href="https://www.facebook.com/tfonghjhj" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                                <Button variant="outline" className="rounded-xl border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium w-full py-6 md:py-2">
                                    <HelpCircle className="w-4 h-4 mr-2" />
                                    Hỗ trợ
                                </Button>
                            </a>
                            {currentStatus === 'completed' && params.id && (
                                <ReviewDialog
                                    orderId={params.id as string}
                                    type="all"
                                    orderItems={currentOrder?.cartDetails?.map((item: any) => ({
                                        foodid: item.id,
                                        quantity: item.quantity,
                                        fooditems: {
                                            foodname: item.title,
                                            foodimageurl: item.image
                                        }
                                    }))}
                                />
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-8">

                    <div className="lg:col-span-8 space-y-6">


                        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-800">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-8 flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-orange-50 dark:bg-orange-900/40 rounded-full inline-block"></span>
                                Trạng thái đơn hàng
                            </h2>

                            <div className="relative flex flex-col md:flex-row justify-between items-start gap-8 md:gap-0">
                                {/* Desktop/Vertical Progress Line */}
                                <div className="absolute left-6 md:left-[10%] md:right-[10%] top-6 bottom-6 md:bottom-auto md:h-1 w-1 md:w-auto bg-gray-100 dark:bg-gray-800 rounded-full -z-10"></div>
                                <div
                                    className={`absolute left-6 md:left-[10%] top-6 w-1 md:h-1 rounded-full -z-10 transition-all duration-700 ease-in-out ${['đang chờ', 'đã xác nhận'].includes(currentStatus) ? 'h-0 md:w-0' :
                                        currentStatus === 'đang chuẩn bị' ? 'h-[40%] md:w-[40%] bg-orange-400' :
                                            ['đang giao', 'đã hoàn thành'].includes(currentStatus) ? 'h-[90%] md:w-[80%] bg-green-500' : 'h-0 md:w-0'
                                        }`}
                                ></div>


                                <div className="flex flex-row md:flex-col items-center gap-4 md:gap-0 md:w-1/3 z-10">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg mb-0 md:mb-3 border-4 border-white dark:border-gray-800 transition-all shrink-0 ${currentStatus === 'đang chờ' ? 'bg-orange-100 dark:bg-orange-950/40 text-orange-500 shadow-orange-50 dark:shadow-orange-950/20' :
                                        'bg-green-500 text-white shadow-green-200 dark:shadow-green-950/20'
                                        }`}>
                                        {currentStatus === 'đang chờ' ? <Clock className="w-6 h-6" /> : <Check className="w-6 h-6" />}
                                    </div>
                                    <div className="md:contents">
                                        <h3 className={`font-bold text-left md:text-center transition-colors ${currentStatus === 'đang chờ' ? 'text-orange-500' : 'text-gray-900 dark:text-gray-100'
                                            }`}>
                                            {currentStatus === 'đang chờ' ? 'Chờ xác nhận' : 'Đã xác nhận'}
                                        </h3>
                                        <p className="hidden md:block text-xs text-gray-500 dark:text-gray-400 text-center mt-1">{currentOrder?.displayTime || "--:--"}</p>
                                    </div>
                                </div>


                                <div className="flex flex-row md:flex-col items-center gap-4 md:gap-0 md:w-1/3 z-10">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-0 md:mb-3 border-4 border-white dark:border-gray-800 relative transition-all duration-500 shrink-0 ${['đang chờ', 'đã xác nhận'].includes(currentStatus) ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500' :
                                        currentStatus === 'đang chuẩn bị' ? 'bg-orange-200 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 shadow-lg shadow-orange-100 dark:shadow-orange-950/20' :
                                            'bg-green-500 text-white shadow-lg shadow-green-200 dark:shadow-green-950/20'
                                        }`}>
                                        {['đang giao', 'đã hoàn thành'].includes(currentStatus) ? <Check className="w-6 h-6" /> : <ChefHat className="w-6 h-6" />}
                                        {currentStatus === 'đang chuẩn bị' && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse"></span>}
                                    </div>
                                    <div className="md:contents">
                                        <h3 className={`font-bold text-left md:text-center transition-colors ${currentStatus === 'đang chuẩn bị' ? 'text-orange-600 dark:text-orange-400' :
                                            ['đang chờ', 'đã xác nhận'].includes(currentStatus) ? 'text-gray-400 dark:text-gray-500' :
                                                'text-gray-900 dark:text-gray-100'
                                            }`}>Đang chuẩn bị</h3>
                                        {currentStatus === 'đang chuẩn bị' && (
                                            <p className="text-xs text-orange-500/80 dark:text-orange-400/80 text-left md:text-center mt-1 font-medium select-none">Đang thực hiện</p>
                                        )}
                                    </div>
                                </div>


                                <div className="flex flex-row md:flex-col items-center gap-4 md:gap-0 md:w-1/3 z-10">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-0 md:mb-3 border-4 border-white dark:border-gray-800 relative transition-all duration-500 shrink-0 ${['đang chờ', 'đã xác nhận', 'đang chuẩn bị'].includes(currentStatus) ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500' :
                                        currentStatus === 'đang giao' ? 'bg-blue-200 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 shadow-lg shadow-blue-100 dark:shadow-blue-950/20' :
                                            'bg-green-500 text-white shadow-lg shadow-green-200 dark:shadow-green-950/20'
                                        }`}>
                                        {currentStatus === 'đã hoàn thành' ? <Check className="w-6 h-6" /> : <Bike className="w-6 h-6" />}
                                        {currentStatus === 'đang giao' && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse"></span>}
                                    </div>
                                    <div className="md:contents">
                                        <h3 className={`font-bold text-left md:text-center transition-colors ${currentStatus === 'đang giao' ? 'text-blue-600 dark:text-blue-400' :
                                            ['đang chờ', 'đã xác nhận', 'đang chuẩn bị'].includes(currentStatus) ? 'text-gray-400 dark:text-gray-500' :
                                                'text-gray-900 dark:text-gray-100'
                                            }`}>
                                            {currentStatus === 'đã hoàn thành' ? 'Đã giao' : 'Đang giao'}
                                        </h3>
                                        {['đang chờ', 'đã xác nhận', 'đang chuẩn bị'].includes(currentStatus) && <p className="text-xs text-gray-400 dark:text-gray-500 text-left md:text-center mt-1">Đang chờ</p>}
                                    </div>
                                </div>
                            </div>
                        </div>


                        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6">Món đã đặt</h2>

                            <div className="space-y-6">
                                {currentOrder?.cartDetails && currentOrder.cartDetails.length > 0 ? (
                                    currentOrder.cartDetails.map((item: any, index: number) => (
                                        <div key={item.id || index} className="flex gap-4 items-start pb-6 border-b border-gray-50 dark:border-gray-800 last:border-0 last:pb-0">
                                            <div className="w-20 h-20 rounded-2xl bg-orange-50 dark:bg-orange-900/20 flex-shrink-0 overflow-hidden">
                                                <img src={item.image || "/images/placeholder.jpg"} alt={item.title} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-grow">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">{item.title}</h3>
                                                    <span className="font-bold text-orange-500">
                                                        {new Intl.NumberFormat('vi-VN').format((parseInt(item.price?.toString().replace(/[^\d]/g, '')) || 0) * (item.quantity || 1) + (parseInt(item.extraPrice?.toString().replace(/[^\d]/g, '')) || 0))} đ
                                                    </span>
                                                </div>
                                                {item.options && Object.keys(item.options).length > 0 && (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                                        {Object.entries(item.options).map(([key, val]) => `${key}: ${val}`).join(', ')}
                                                    </p>
                                                )}
                                                {item.note && (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 italic mb-2">
                                                        Ghi chú: {item.note}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-3">
                                                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold">x{item.quantity || 1}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-gray-500 dark:text-gray-400 text-sm py-4">
                                        <span className="font-medium text-gray-900 dark:text-gray-100">Chi tiết: </span>
                                        {currentOrder?.items || "Không có thông tin."}
                                    </div>
                                )}
                            </div>


                            <div className="space-y-3 pt-6 w-full max-w-sm ml-auto">
                                <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-800 mt-2">
                                    <span className="text-xl font-bold text-gray-900 dark:text-gray-100">Tổng cộng</span>
                                    <span className="text-2xl font-bold text-orange-500">{currentOrder?.price || "0 đ"}</span>
                                </div>
                            </div>
                        </div>
                    </div>


                    <div className="lg:col-span-4 space-y-6">


                        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                            <div className="p-5 flex justify-between items-center bg-white dark:bg-gray-900 border-b border-gray-50 dark:border-gray-800 z-10 relative">
                                <h3 className="font-bold text-gray-900 dark:text-gray-100">Vị trí tài xế</h3>
                                <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-widest flex items-center gap-1 transition-colors ${currentStatus === 'đang giao'
                                    ? 'bg-red-50 dark:bg-red-950/40 text-red-500'
                                    : (['đang chờ', 'đã xác nhận', 'đang chuẩn bị', 'đã hoàn thành'].includes(currentStatus)
                                        ? 'bg-green-50 dark:bg-green-950/40 text-green-500'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500')
                                    }`}>
                                    {currentStatus === 'đang giao' && <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block animate-pulse"></span>}
                                    {['đang chờ', 'đã xác nhận', 'đang chuẩn bị'].includes(currentStatus) && <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>}
                                    {currentStatus === 'đang giao' ? 'Trực tiếp' : currentStatus === 'đã hoàn thành' ? 'Hoàn thành' : (['đang chờ', 'đã xác nhận', 'đang chuẩn bị'].includes(currentStatus) ? 'Đang hoạt động' : 'Ngoại tuyến')}
                                </span>
                            </div>


                            <div className="relative h-48 bg-orange-100 dark:bg-orange-950/20 flex items-center justify-center overflow-hidden transition-opacity duration-1000">
                                <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\' fill=\'%23f97316\' fill-opacity=\'0.4\' fill-rule=\'nonzero\'/%3E%3C/g%3E%3C/svg%3E")' }}></div>

                                <svg className={`absolute w-full h-full drop-shadow-md transition-colors ${currentStatus === 'delivering' ? 'text-orange-300 dark:text-orange-900/40' : 'text-gray-300 dark:text-gray-700 opacity-50'}`} viewBox="0 0 100 100" preserveAspectRatio="none">
                                    <path d="M20,80 Q40,40 80,20" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="5,5" className={currentStatus === 'delivering' ? 'animate-[dash_2s_linear_infinite]' : ''} />
                                </svg>

                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                                    <div className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full mb-1 drop-shadow-md">2.5km</div>
                                    <div className="w-8 h-8 rounded-full bg-gray-900 border-2 border-white flex items-center justify-center shadow-lg">
                                        <Bike className="w-4 h-4 text-white" />
                                    </div>
                                </div>
                            </div>


                            <div className="p-5 flex items-center gap-4 bg-white dark:bg-gray-900 relative z-10 border-t border-gray-100 dark:border-gray-800">
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                                        <img src="/images/avatar-placeholder.jpg" alt="Driver" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                                </div>
                                <div className="flex-grow">
                                    <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm">Nguyen Van A</h4>
                                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                        <span className="text-yellow-500">★ 4.9</span>
                                        <span>(120+ orders)</span>
                                        <span>•</span>
                                        <span>Honda Wave</span>
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                        <MessageSquare className="w-4 h-4" />
                                    </button>
                                    <button className="w-9 h-9 rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center hover:bg-orange-200 dark:hover:bg-orange-900/60 transition-colors">
                                        <PhoneCall className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>


                        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-5">Thông tin giao hàng</h3>

                            <div className="space-y-6">
                                <div className="flex gap-4 items-start">
                                    <div className="w-8 h-8 rounded-full bg-orange-50 dark:bg-orange-950/20 text-orange-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Địa chỉ giao hàng</div>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-snug">
                                            {currentOrder?.address || "Nhận tại quầy / Chưa cập nhật"}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">Theo phương thức đã chọn khi thanh toán.</p>
                                    </div>
                                </div>

                                <div className="flex gap-4 items-start">
                                    <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/20 text-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Clock className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Thời gian Đặt</div>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{currentOrder?.time || "--:--"}</p>
                                    </div>
                                </div>

                                <div className="flex gap-4 items-start">
                                    <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-950/20 text-purple-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <CreditCard className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Phương thức Thanh toán</div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{currentOrder?.paymentMethod === 'momo' ? 'Ví MoMo' : (currentOrder?.paymentMethod === 'vnpay' ? 'VNPay' : 'Tiền mặt/Ngân hàng')}</p>
                                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-sm ${currentOrder?.paymentStatus === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400'}`}>
                                                {currentOrder?.paymentStatus === 'completed' ? 'Đã trả' : 'Chờ xử lý'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>


                        <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl p-6 shadow-lg shadow-orange-200 dark:shadow-orange-950/40 text-white border border-orange-400 dark:border-orange-500/30">
                            <div className="flex items-center gap-2 mb-3">
                                <Lightbulb className="w-5 h-5 text-yellow-300" />
                                <h3 className="font-bold text-lg">Mẹo từ SmartBite AI</h3>
                            </div>
                            <p className="text-orange-50 text-sm leading-relaxed mb-5 font-medium">
                                "Bữa trưa hôm nay của bạn có 850kcal. Để cân bằng dinh dưỡng, hãy thử thêm một chai nước ép cần tây cho bữa ăn nhẹ buổi chiều nhé!"
                            </p>
                            <Button className="w-full bg-white text-orange-600 hover:bg-orange-50 font-bold rounded-xl h-11">
                                Xem gợi ý đồ uống
                            </Button>
                        </div>

                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
