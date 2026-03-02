"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Download, Headset, ShieldCheck, ReceiptText, Loader2, CheckCircle2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function QRPaymentPage() {
    const router = useRouter()
    const [cartItems, setCartItems] = useState<any[]>([])
    const [isMounted, setIsMounted] = useState(false)
    const [timeLeft, setTimeLeft] = useState(599)
    const [orderId, setOrderId] = useState("")
    const [isCheckingPayment, setIsCheckingPayment] = useState(false)
    const [paymentSuccess, setPaymentSuccess] = useState(false)

    useEffect(() => {
        setIsMounted(true)


        const userStr = localStorage.getItem("user");
        if (!userStr) {
            router.push("/auth/login");
            return;
        }


        const params = new URLSearchParams(window.location.search);
        const urlOrderId = params.get('orderId');

        if (urlOrderId) {
            setOrderId(urlOrderId);
            fetchOrderDetails(urlOrderId);
        } else {



            setOrderId(`#SB-${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`);
        }


        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
        }, 1000)

        return () => clearInterval(timer)
    }, [])

    const fetchOrderDetails = async (id: string) => {
        try {
            const res = await fetch(`/api/orders/${id}`);
            if (res.ok) {
                const data = await res.json();
                if (data.order) {
                    const orderData = data.order;

                    const formatted = orderData.orderitems?.map((oi: any) => ({
                        id: oi.orderitemid,
                        title: oi.fooditems?.foodname,
                        image: oi.fooditems?.foodimageurl,
                        price: oi.priceattime,
                        quantity: oi.quantity
                    })) || [];
                    setCartItems(formatted);
                }
            }
        } catch (error) {
            console.error("Lỗi khi tải chi tiết đơn hàng:", error);
        }
    }

    const handlePaymentConfirm = async () => {
        setIsCheckingPayment(true)

        try {

            const res = await fetch("/api/payments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderid: orderId,
                    paymentstatus: 'completed'
                })
            });

            if (res.ok) {
                setPaymentSuccess(true);
                setIsCheckingPayment(false);


                window.dispatchEvent(new Event('cartUpdate'));


                setTimeout(() => {

                    router.push(`/order/${orderId}`);
                }, 2000);
            } else {
                alert("Không thể xác nhận thanh toán. Vui lòng thử lại.");
                setIsCheckingPayment(false);
            }
        } catch (error) {
            console.error("Lỗi xác nhận thanh toán:", error);
            setIsCheckingPayment(false);
        }
    }

    const minutes = Math.floor(timeLeft / 60)
    const seconds = timeLeft % 60

    const parsePrice = (priceStr: string | number) => {
        if (!priceStr) return 0;
        if (typeof priceStr === 'number') return priceStr;
        const numericStr = (priceStr as string).replace(/[^\d]/g, '')
        return parseInt(numericStr, 10) || 0;
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN').format(price) + 'đ'
    }

    const subtotal = cartItems.reduce((sum, item) => sum + (parsePrice(item.price) * (item.quantity || 1)), 0)
    const shippingFee = subtotal > 0 ? 15000 : 0
    const total = subtotal + shippingFee

    if (!isMounted) return null

    return (
        <div className="min-h-screen bg-[#FDFDFD] flex flex-col font-sans">
            <Navbar />

            <main className="flex-grow container mx-auto px-4 py-8 max-w-5xl">

                <div className="text-sm font-medium text-gray-500 mb-8 flex items-center gap-2">
                    <Link href="/" className="hover:text-orange-500 transition-colors">Trang chủ</Link>
                    <span>/</span>
                    <Link href="/cart" className="hover:text-orange-500 transition-colors">Giỏ hàng</Link>
                    <span>/</span>
                    <span className="text-orange-500 font-bold">Thanh toán QR</span>
                </div>

                <div className="grid lg:grid-cols-12 gap-8">

                    <div className="lg:col-span-7 space-y-6">
                        <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-sm border border-orange-50/50 flex flex-col items-center flex-grow">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">Quét mã QR để Thanh toán</h1>
                            <p className="text-gray-500 text-center mb-8">Sử dụng Momo, VNPay hoặc ứng dụng Ngân hàng</p>


                            <div className="flex items-center justify-center gap-4 mb-10">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-orange-50 rounded-xl flex items-center justify-center text-2xl font-bold text-orange-500 shadow-sm border border-orange-100">
                                        {minutes.toString().padStart(2, '0')}
                                    </div>
                                    <div className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest">PHÚT</div>
                                </div>
                                <div className="text-2xl font-bold text-orange-500 pb-6">:</div>
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-orange-50 rounded-xl flex items-center justify-center text-2xl font-bold text-orange-500 shadow-sm border border-orange-100">
                                        {seconds.toString().padStart(2, '0')}
                                    </div>
                                    <div className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest">GIÂY</div>
                                </div>
                            </div>


                            <div className="w-64 md:w-72 bg-white rounded-3xl shadow-xl border-4 border-white overflow-hidden mb-10 relative">
                                <img
                                    src="/images/bidvqr.jpg"
                                    alt="Payment QR Code"
                                    className="w-full h-auto object-contain"
                                />
                            </div>


                            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                                <Button variant="outline" className="flex-1 h-12 rounded-xl border-orange-200 bg-orange-50 text-orange-600 hover:bg-orange-100 hover:text-orange-700 font-bold shadow-sm" disabled={isCheckingPayment || paymentSuccess}>
                                    <Download className="w-4 h-4 mr-2" />
                                    Tải mã QR
                                </Button>

                                <Button
                                    className={`flex-1 h-12 rounded-xl font-bold shadow-md transition-all ${paymentSuccess
                                        ? 'bg-green-500 hover:bg-green-600 text-white shadow-green-200'
                                        : isCheckingPayment
                                            ? 'bg-orange-400 cursor-not-allowed text-white'
                                            : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-200'
                                        }`}
                                    onClick={handlePaymentConfirm}
                                    disabled={isCheckingPayment || paymentSuccess || !orderId || orderId.startsWith('#')}
                                >
                                    {paymentSuccess ? (
                                        <>
                                            <CheckCircle2 className="w-5 h-5 mr-2" />
                                            Thanh toán Thành công
                                        </>
                                    ) : isCheckingPayment ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Đang kiểm tra...
                                        </>
                                    ) : (
                                        "Tôi đã thanh toán"
                                    )}
                                </Button>
                            </div>
                        </div>


                        <div className="bg-orange-50/50 rounded-2xl p-5 border border-orange-100 flex items-center gap-4">
                            <ShieldCheck className="w-8 h-8 text-orange-500 flex-shrink-0" />
                            <p className="text-sm text-gray-600 font-medium">Giao dịch của bạn hoàn toàn được bảo mật bởi hệ thống thanh toán tích hợp của chúng tôi.</p>
                        </div>
                    </div>


                    <div className="lg:col-span-5 space-y-6">

                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-2 mb-6 border-b border-gray-50 pb-4">
                                <ReceiptText className="w-5 h-5 text-orange-500" />
                                <h2 className="text-lg font-bold text-gray-900">Tóm tắt Đơn hàng</h2>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Mã đơn hàng:</span>
                                    <span className="font-bold text-gray-900">{orderId}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Trạng thái:</span>
                                    <span className="bg-orange-50 text-orange-500 px-3 py-1 rounded-full text-xs font-bold">Chờ thanh toán</span>
                                </div>
                            </div>

                            <Separator className="my-6 border-dashed" />


                            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex gap-3 items-center">
                                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                            <img
                                                src={item.image || "/images/placeholder.jpg"}
                                                alt={item.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <h4 className="font-bold text-sm text-gray-900 truncate">{item.title}</h4>
                                            <div className="text-xs text-gray-500">{item.quantity} x {formatPrice(parsePrice(item.price))}</div>
                                        </div>
                                        <div className="font-bold text-sm text-gray-900 whitespace-nowrap">
                                            {formatPrice(parsePrice(item.price) * (item.quantity || 1))}
                                        </div>
                                    </div>
                                ))}
                                {cartItems.length === 0 && (
                                    <div className="text-center text-sm text-gray-500 py-4">Giỏ hàng trống</div>
                                )}
                            </div>

                            <Separator className="my-6 border-dashed" />


                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Tạm tính</span>
                                    <span className="font-medium text-gray-900">{formatPrice(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Phí giao hàng</span>
                                    <span className="font-medium text-gray-900">{formatPrice(shippingFee)}</span>
                                </div>

                                <div className="flex justify-between items-center pt-4 mt-2">
                                    <span className="text-base font-bold text-orange-500">Tổng cộng</span>
                                    <span className="text-xl font-bold text-orange-500">{formatPrice(total)}</span>
                                </div>
                            </div>
                        </div>


                        <div className="bg-orange-50/30 rounded-3xl p-6 border border-orange-50">
                            <h3 className="font-bold text-gray-900 mb-2">Cần giúp đỡ?</h3>
                            <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                                Nếu bạn gặp bất kỳ khó khăn nào trong quá trình thanh toán, vui lòng liên hệ với chúng tôi.
                            </p>
                            <Button className="w-full bg-[#111827] hover:bg-black text-white rounded-xl h-12 font-bold shadow-md">
                                <Headset className="w-4 h-4 mr-2" />
                                Hỗ trợ 24/7
                            </Button>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
