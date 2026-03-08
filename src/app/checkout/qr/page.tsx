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
    const [orderMetadata, setOrderMetadata] = useState<any>(null)
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
                    setOrderMetadata({
                        foodamount: orderData.foodamount,
                        shippingfee: orderData.shippingfee,
                        voucher: orderData.vouchers
                    });

                    const formatted = orderData.orderitems?.map((oi: any) => ({
                        id: oi.orderitemid,
                        title: oi.fooditems?.foodname,
                        image: oi.fooditems?.foodimageurl,
                        price: (Number(oi.unitprice) || 0) + (oi.orderitemtoppings?.reduce((sum: number, t: any) => sum + (Number(t.price) || 0), 0) || 0),
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
            console.log("Client: Initiating payment confirmation for order:", orderId);
            const res = await fetch("/api/payment-confirmation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderid: orderId,
                    paymentstatus: 'completed'
                })
            });

            if (res.ok) {
                console.log("Client: Payment confirmed successfully");
                setPaymentSuccess(true);
                setIsCheckingPayment(false);


                window.dispatchEvent(new Event('cartUpdate'));


                setTimeout(() => {

                    router.push(`/order/${orderId}`);
                }, 2000);
            } else {
                const errData = await res.json().catch(() => ({}));
                console.error("Client: Payment confirmation failed on server:", errData);
                alert("Không thể xác nhận thanh toán. Lỗi: " + (errData.error || "Vui lòng thử lại."));
                setIsCheckingPayment(false);
            }
        } catch (error: any) {
            console.error("Client: Network error during payment confirmation:", error);
            alert("Lỗi kết nối: " + (error.message || "Vui lòng kiểm tra internet hoặc tắt trình chặn quảng cáo (AdBlock) và thử lại."));
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
    const shippingFee = orderMetadata?.shippingfee ?? (subtotal > 0 ? 15000 : 0)
    const discount = orderMetadata ? Math.max(0, subtotal - orderMetadata.foodamount) : 0
    const total = subtotal - discount + shippingFee

    if (!isMounted) return null

    return (
        <div className="min-h-screen bg-[#FDFDFD] dark:bg-gray-950 flex flex-col font-sans transition-colors duration-300">
            <Navbar />

            <main className="flex-grow container mx-auto px-4 py-8 max-w-5xl">

                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-8 flex items-center gap-2">
                    <Link href="/" className="hover:text-orange-500 transition-colors">Trang chủ</Link>
                    <span>/</span>
                    <Link href="/cart" className="hover:text-orange-500 transition-colors">Giỏ hàng</Link>
                    <span>/</span>
                    <span className="text-orange-500 font-bold">Thanh toán QR</span>
                </div>

                <div className="grid lg:grid-cols-12 gap-8">

                    <div className="lg:col-span-7 space-y-6">
                        <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 lg:p-12 shadow-sm border border-orange-50/50 dark:border-orange-900/10 flex flex-col items-center flex-grow">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 text-center">Quét mã QR để Thanh toán</h1>
                            <p className="text-gray-500 dark:text-gray-400 text-center mb-8">Sử dụng Momo, VNPay hoặc ứng dụng Ngân hàng</p>


                            <div className="flex items-center justify-center gap-4 mb-10">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center text-2xl font-bold text-orange-500 shadow-sm border border-orange-100 dark:border-orange-900/30">
                                        {minutes.toString().padStart(2, '0')}
                                    </div>
                                    <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 mt-2 uppercase tracking-widest">PHÚT</div>
                                </div>
                                <div className="text-2xl font-bold text-orange-500 pb-6">:</div>
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center text-2xl font-bold text-orange-500 shadow-sm border border-orange-100 dark:border-orange-900/30">
                                        {seconds.toString().padStart(2, '0')}
                                    </div>
                                    <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 mt-2 uppercase tracking-widest">GIÂY</div>
                                </div>
                            </div>


                            <div className="w-64 md:w-72 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border-4 border-white dark:border-gray-700 overflow-hidden mb-10 relative transition-all duration-300">
                                <img
                                    src="/images/bidvqr.jpg"
                                    alt="Payment QR Code"
                                    className="w-full h-auto object-contain dark:brightness-90"
                                />
                            </div>


                            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                                <Button variant="outline" className="flex-1 h-12 rounded-xl border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:text-orange-700 font-bold shadow-sm transition-all" disabled={isCheckingPayment || paymentSuccess}>
                                    <Download className="w-4 h-4 mr-2" />
                                    Tải mã QR
                                </Button>

                                <Button
                                    className={`flex-1 h-12 rounded-xl font-bold shadow-md transition-all ${paymentSuccess
                                        ? 'bg-green-500 hover:bg-green-600 text-white shadow-green-200'
                                        : isCheckingPayment
                                            ? 'bg-orange-400 cursor-not-allowed text-white'
                                            : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-200 dark:shadow-none'
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


                        <div className="bg-orange-50/50 dark:bg-orange-950/20 rounded-2xl p-5 border border-orange-100 dark:border-orange-900/30 flex items-center gap-4">
                            <ShieldCheck className="w-8 h-8 text-orange-500 dark:text-orange-400 flex-shrink-0" />
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Giao dịch của bạn hoàn toàn được bảo mật bởi hệ thống thanh toán tích hợp của chúng tôi.</p>
                        </div>
                    </div>


                    <div className="lg:col-span-5 space-y-6">

                        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-2 mb-6 border-b border-gray-50 dark:border-gray-800 pb-4">
                                <ReceiptText className="w-5 h-5 text-orange-500 dark:text-orange-400" />
                                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Tóm tắt Đơn hàng</h2>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500 dark:text-gray-400">Mã đơn hàng:</span>
                                    <span className="font-bold text-gray-900 dark:text-gray-100">{orderId}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500 dark:text-gray-400">Trạng thái:</span>
                                    <span className="bg-orange-50 dark:bg-orange-900/30 text-orange-500 dark:text-orange-400 px-3 py-1 rounded-full text-xs font-bold">Chờ thanh toán</span>
                                </div>
                            </div>

                            <Separator className="my-6 border-dashed" />


                            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex gap-3 items-center">
                                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                                            <img
                                                src={item.image || "/images/placeholder.jpg"}
                                                alt={item.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 truncate">{item.title}</h4>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">{item.quantity} x {formatPrice(parsePrice(item.price))}</div>
                                        </div>
                                        <div className="font-bold text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">
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
                                    <span className="text-gray-500 dark:text-gray-400">Tạm tính</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">{formatPrice(subtotal)}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-orange-600 flex items-center gap-1">
                                            Voucher Giảm giá ({orderMetadata?.voucher?.vouchercode})
                                        </span>
                                        <span className="font-medium text-orange-600">-{formatPrice(discount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 dark:text-gray-400">Phí giao hàng</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">{formatPrice(shippingFee)}</span>
                                </div>

                                <div className="flex justify-between items-center pt-4 mt-2">
                                    <span className="text-base font-bold text-orange-500">Tổng cộng</span>
                                    <span className="text-xl font-bold text-orange-500">{formatPrice(total)}</span>
                                </div>
                            </div>
                        </div>


                        <div className="bg-orange-50/30 dark:bg-orange-950/20 rounded-3xl p-6 border border-orange-50 dark:border-orange-900/10">
                            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">Cần giúp đỡ?</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                                Nếu bạn gặp bất kỳ khó khăn nào trong quá trình thanh toán, vui lòng liên hệ với chúng tôi.
                            </p>
                            <Link href="https://www.facebook.com/tfonghjhj" target="_blank" rel="noopener noreferrer">
                                <Button className="w-full bg-[#111827] hover:bg-black text-white rounded-xl h-12 font-bold shadow-md">
                                    <Headset className="w-4 h-4 mr-2" />
                                    Hỗ trợ 24/7
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
