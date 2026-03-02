"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import {
    Trash2, Minus, Plus, MapPin,
    Banknote, QrCode, Info, Ticket,
    Flame, Clock, ShoppingBag, Sparkles, AlertCircle, ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function CartPage() {
    const router = useRouter()
    const [cartItems, setCartItems] = useState<any[]>([])
    const [isMounted, setIsMounted] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState("momo")
    const [isEditingAddress, setIsEditingAddress] = useState(false)
    const [addressTitle, setAddressTitle] = useState("Bitexco Office")
    const [addressDetails, setAddressDetails] = useState("Floor 15, No 2 Hai Trieu, D.1, HCMC")
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [voucherCode, setVoucherCode] = useState("")
    const [availableVouchers, setAvailableVouchers] = useState<any[]>([])
    const [appliedVoucher, setAppliedVoucher] = useState<any | null>(null)
    useEffect(() => {
        setIsMounted(true)

        const userStr = localStorage.getItem("user");
        if (userStr) {
            setIsLoggedIn(true);
            const user = JSON.parse(userStr);
            if (user.addressdelivery) {
                setAddressTitle("Registered Address");
                setAddressDetails(user.addressdelivery);
            }

            const userId = user.userid || user.UserId || user.id;
            loadCart(userId);
        } else {
            setIsLoggedIn(false);
            setCartItems([]);
        }


        const fetchActiveVouchers = async () => {
            try {
                const res = await fetch("/api/vouchers?status=Active");
                if (res.ok) {
                    const data = await res.json();
                    setAvailableVouchers(data);
                }
            } catch (err) {
                console.error("Error fetching vouchers:", err);
            }
        };
        fetchActiveVouchers();

        const handleCartUpdate = () => {
            const userStr = localStorage.getItem("user");
            if (userStr) {
                const user = JSON.parse(userStr);
                const userId = user.UserId || user.userid || user.id;
                loadCart(userId);
            }
        };

        window.addEventListener('cartUpdate', handleCartUpdate)
        return () => window.removeEventListener('cartUpdate', handleCartUpdate)
    }, [])

    const loadCart = async (userId: string) => {
        try {
            const res = await fetch(`/api/cart?userId=${userId}`);
            if (res.ok) {
                const data = await res.json();
                const items = data.items || [];

                const formattedItems = items.map((item: any) => {
                    const dish = item.fooditems;
                    const toppings = item.cartitemtoppings?.map((t: any) => t.toppingoptions?.toppingname).filter(Boolean).join(", ");

                    let extraPrice = 0;
                    if (item.cartitemtoppings && Array.isArray(item.cartitemtoppings)) {
                        extraPrice = item.cartitemtoppings.reduce((sum: number, t: any) => sum + (Number(t.toppingoptions?.price) || 0), 0);
                    }

                    const basePrice = Number(dish?.price) || 0;
                    const finalPrice = basePrice + extraPrice;

                    return {
                        id: item.cartitemid,
                        foodId: dish?.foodid,
                        title: dish?.foodname,
                        image: dish?.foodimageurl,
                        price: basePrice,
                        extraPrice: extraPrice,
                        quantity: Number(item.quantity) || 0,
                        desc: (dish?.descriptions || "") + (toppings ? ` (Thêm: ${toppings})` : ""),
                        calories: dish?.calories ? `${dish.calories} kcal` : "0 kcal",
                        time: dish?.preptime ? `${dish.preptime}m` : "0m",
                        category: dish?.categoryid
                    };
                });
                setCartItems(formattedItems);

                window.dispatchEvent(new Event('cartUpdate'));
            }
        } catch (error) {
            console.error("Failed to load cart from DB:", error);
            setCartItems([]);
        }
    }

    const updateQuantity = async (itemId: string, delta: number) => {
        const item = cartItems.find(i => i.id === itemId);
        if (!item) return;

        const newQuantity = item.quantity + delta;



        if (newQuantity < 0) return;

        try {
            const res = await fetch(`/api/cart/${itemId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity: newQuantity })
            });

            if (res.ok) {
                const userStr = localStorage.getItem("user");
                if (userStr) {
                    const user = JSON.parse(userStr);
                    const userId = user.UserId || user.userid || user.id;
                    loadCart(userId);
                }
            } else {
                alert("Không thể cập nhật số lượng.");
            }
        } catch (error) {
            console.error("Update quantity error:", error);
        }
    }

    const clearCart = async () => {
        const userStr = localStorage.getItem("user");
        if (!userStr) return;
        const user = JSON.parse(userStr);
        const userId = user.UserId || user.userid || user.id;

        if (!confirm("Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?")) return;

        try {
            const res = await fetch(`/api/cart?userId=${userId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setCartItems([]);
                window.dispatchEvent(new Event('cartUpdate'));
            } else {
                alert("Không thể xóa giỏ hàng.");
            }
        } catch (error) {
            console.error("Failed to clear cart:", error);
        }
    }


    const parsePrice = (priceStr: string | number) => {
        if (!priceStr) return 0;
        if (typeof priceStr === 'number') return priceStr;
        const numericStr = priceStr.replace(/[^\d]/g, '')
        return parseInt(numericStr, 10) || 0;
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    }

    const subtotal = cartItems.reduce((sum, item) => sum + (parsePrice(item.price) * (item.quantity || 1)) + parsePrice(item.extraPrice || 0), 0)
    const shippingFee = subtotal > 0 ? 15000 : 0


    let voucherDiscount = 0;
    if (appliedVoucher) {
        if (appliedVoucher.vouchertype === 'Ship' && appliedVoucher.discountvalue) {
            voucherDiscount = Math.min(shippingFee, appliedVoucher.discountvalue);
        } else {
            voucherDiscount = appliedVoucher.discountvalue || 0;
        }
    }

    const totalDiscount = voucherDiscount;
    const total = subtotal + shippingFee - totalDiscount;

    const totalItems = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)


    const totalCalories = cartItems.reduce((sum, item) => {
        const cal = parseInt((item.calories || "0").replace(/\D/g, '')) || 0;
        return sum + (cal * (item.quantity || 1));
    }, 0)

    if (!isMounted) return null

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
                <div className="flex items-center gap-3 mb-8">
                    <ShoppingBag className="w-8 h-8 text-orange-500" />
                    <h1 className="text-3xl font-bold text-gray-900">Giỏ hàng & Thanh toán</h1>
                </div>

                <div className="grid lg:grid-cols-12 gap-8">

                    <div className="lg:col-span-8 space-y-8">

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-xl font-bold text-gray-900">Đơn hàng của bạn</h2>
                                    <span className="bg-orange-100 text-orange-600 text-sm font-medium px-2.5 py-0.5 rounded-full">
                                        {totalItems} món
                                    </span>
                                </div>
                                {cartItems.length > 0 && (
                                    <button
                                        onClick={clearCart}
                                        className="text-gray-500 hover:text-red-500 text-sm flex items-center gap-1 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Xóa tất cả
                                    </button>
                                )}
                            </div>

                            {cartItems.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <ShoppingBag className="w-10 h-10 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Giỏ hàng trống</h3>
                                    <p className="text-gray-500 mb-6">Bạn chưa chọn items ăn nào. Hãy khám phá thực đơn nhé!</p>
                                    <Link href="/menu">
                                        <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-8">
                                            Xem Thực đơn
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="flex gap-4 items-start">
                                            <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 relative">
                                                <img
                                                    src={item.image || "/images/placeholder.jpg"}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover"
                                                />
                                                {item.rating && (
                                                    <div className="absolute top-1 left-1 bg-white/90 backdrop-blur-sm text-xs px-1.5 py-0.5 rounded-md font-medium flex items-center gap-1 shadow-sm">
                                                        <span className="text-yellow-400 text-[10px]">★</span>
                                                        {item.rating}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-grow min-w-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h3 className="font-semibold text-lg text-gray-900 truncate pr-4">{item.title}</h3>
                                                    <div className="font-bold text-orange-500 whitespace-nowrap">
                                                        {formatPrice(parsePrice(item.price) * (item.quantity || 1) + parsePrice(item.extraPrice || 0))}
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{item.desc || item.title}</p>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex flex-wrap items-center gap-3 text-xs">
                                                        {item.calories && (
                                                            <div className="flex items-center text-orange-600 bg-orange-50 px-2 py-1 rounded-md font-medium">
                                                                <Flame className="w-3.5 h-3.5 mr-1" />
                                                                {item.calories}
                                                            </div>
                                                        )}
                                                        {item.time && (
                                                            <div className="flex items-center text-gray-600 bg-gray-50 px-2 py-1 rounded-md font-medium">
                                                                <Clock className="w-3.5 h-3.5 mr-1 text-gray-400" />
                                                                {item.time}
                                                            </div>
                                                        )}
                                                        {item.category === "Food" && (
                                                            <div className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded-md font-medium hidden sm:flex">
                                                                <Sparkles className="w-3.5 h-3.5 mr-1" />
                                                                Lành mạnh
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center border border-gray-200 rounded-lg bg-white shadow-sm">
                                                        <button
                                                            onClick={() => updateQuantity(item.id, -1)}
                                                            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-l-lg transition-colors"
                                                        >
                                                            <Minus className="w-3.5 h-3.5" />
                                                        </button>
                                                        <span className="w-8 text-center font-medium text-gray-900 text-sm">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, 1)}
                                                            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-r-lg transition-colors"
                                                        >
                                                            <Plus className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>


                    </div>


                    <div className="lg:col-span-4">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Thông tin Thanh toán</h2>


                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-xs font-bold text-gray-500 tracking-wider uppercase">Địa chỉ Giao hàng</span>
                                    <button
                                        onClick={() => {
                                            if (isEditingAddress) {

                                                try {
                                                    const userStr = localStorage.getItem("user");
                                                    if (userStr) {
                                                        const user = JSON.parse(userStr);
                                                        user.address = addressDetails;
                                                        localStorage.setItem("user", JSON.stringify(user));

                                                        const registeredUsersStr = localStorage.getItem("registeredUsers");
                                                        if (registeredUsersStr && user.email) {
                                                            const registeredUsers = JSON.parse(registeredUsersStr);
                                                            if (registeredUsers[user.email]) {
                                                                registeredUsers[user.email].address = addressDetails;
                                                                localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers));
                                                            }
                                                        }
                                                    }
                                                } catch (e) {
                                                    console.error("Error saving address:", e);
                                                }
                                                setIsEditingAddress(false);
                                            } else {
                                                setIsEditingAddress(true);
                                            }
                                        }}
                                        className="text-orange-500 text-xs font-medium hover:underline"
                                    >
                                        {isEditingAddress ? "Lưu" : "Thay đổi"}
                                    </button>
                                </div>
                                <div className="flex gap-3 bg-orange-50/50 p-3 rounded-xl border border-orange-100">
                                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                                        <MapPin className="w-4 h-4 text-orange-600" />
                                    </div>
                                    <div className="flex-1 w-full">
                                        {isEditingAddress ? (
                                            <div className="space-y-2">
                                                <input
                                                    type="text"
                                                    value={addressTitle}
                                                    onChange={(e) => setAddressTitle(e.target.value)}
                                                    className="w-full bg-white border border-orange-200 rounded px-2 py-1 text-sm font-semibold text-gray-900 focus:outline-none focus:border-orange-500"
                                                    placeholder="Location name (e.g., Home)"
                                                />
                                                <input
                                                    type="text"
                                                    value={addressDetails}
                                                    onChange={(e) => setAddressDetails(e.target.value)}
                                                    className="w-full bg-white border border-orange-200 rounded px-2 py-1 text-xs text-gray-700 focus:outline-none focus:border-orange-500"
                                                    placeholder="Chi tiết địa chỉ"
                                                />
                                            </div>
                                        ) : (
                                            <div>
                                                <div className="font-semibold text-gray-900 text-sm mb-0.5">{addressTitle}</div>
                                                <div className="text-xs text-gray-500">{addressDetails}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>


                            <div className="mb-6">
                                <span className="text-xs font-bold text-gray-500 tracking-wider uppercase mb-3 block">Phương thức Thanh toán</span>
                                <div className="space-y-3">
                                    <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${paymentMethod === 'bankqr' ? 'border-orange-400 bg-orange-50/30' : 'border-gray-200 hover:bg-gray-50'}`}>
                                        <div className={`relative flex items-center justify-center content-center w-5 h-5 rounded-full border-2 ${paymentMethod === 'bankqr' ? 'border-orange-400' : 'border-gray-300'}`}>
                                            {paymentMethod === 'bankqr' && <div className="w-2.5 h-2.5 bg-orange-500 rounded-full" />}
                                        </div>
                                        <input type="radio" className="hidden" name="payment" value="bankqr" checked={paymentMethod === 'bankqr'} onChange={() => setPaymentMethod('bankqr')} />
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                            <QrCode className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <span className="font-medium text-gray-900 text-sm flex-1">QR Ngân hàng</span>
                                    </label>

                                    <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${paymentMethod === 'cash' ? 'border-orange-400 bg-orange-50/30' : 'border-gray-200 hover:bg-gray-50'}`}>
                                        <div className={`relative flex items-center justify-center content-center w-5 h-5 rounded-full border-2 ${paymentMethod === 'cash' ? 'border-orange-400' : 'border-gray-300'}`}>
                                            {paymentMethod === 'cash' && <div className="w-2.5 h-2.5 bg-orange-500 rounded-full" />}
                                        </div>
                                        <input type="radio" className="hidden" name="payment" value="cash" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} />
                                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                            <Banknote className="w-4 h-4 text-green-600" />
                                        </div>
                                        <span className="font-medium text-gray-900 text-sm flex-1">Tiền mặt</span>
                                    </label>
                                </div>
                            </div>

                            <Separator className="my-6 border-dashed" />


                            <div className="mb-6">
                                <span className="text-xs font-bold text-gray-500 tracking-wider uppercase mb-3 block">Mã giảm giá</span>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Nhập hoặc chọn mã..."
                                        className="bg-white border-gray-200 focus-visible:ring-orange-500/20 font-medium flex-1 h-11 rounded-xl uppercase"
                                        value={voucherCode}
                                        onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                                    />
                                    <Button
                                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold h-11 px-6 rounded-xl shadow-sm transition-all"
                                        onClick={async () => {
                                            if (!voucherCode) {
                                                alert("Vui lòng nhập mã voucher.");
                                                return;
                                            }

                                            if (!isLoggedIn) {
                                                alert("Vui lòng đăng nhập để sử dụng tính năng này.");
                                                return;
                                            }

                                            try {
                                                const userStr = localStorage.getItem("user");
                                                const user = JSON.parse(userStr || "");
                                                const userId = user.userid || user.UserId || user.id;

                                                const res = await fetch("/api/vouchers/validate", {
                                                    method: "POST",
                                                    headers: { "Content-Type": "application/json" },
                                                    body: JSON.stringify({ userid: userId, vouchercode: voucherCode })
                                                });

                                                const data = await res.json();
                                                if (res.ok && data.valid) {
                                                    if (subtotal < data.voucher.minordervalue) {
                                                        alert(`Đơn hàng cần đạt tối thiểu ${formatPrice(data.voucher.minordervalue)} để áp dụng mã này.`);
                                                        return;
                                                    }
                                                    setAppliedVoucher(data.voucher);
                                                    alert(`Đã áp dụng mã voucher ${data.voucher.vouchercode} (Giảm ${formatPrice(data.voucher.discountvalue)})`);
                                                } else {
                                                    alert(data.error || "Mã voucher không hợp lệ.");
                                                }
                                            } catch (error) {
                                                console.error("Voucher validation error:", error);
                                                alert("Lỗi khi kiểm tra mã voucher.");
                                            }
                                        }}
                                    >
                                        Áp dụng
                                    </Button>
                                </div>
                                {appliedVoucher && (
                                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-green-700">
                                            <Ticket className="w-4 h-4" />
                                            <span className="text-sm font-semibold">Đã áp dụng: {appliedVoucher.vouchercode}</span>
                                        </div>
                                        <button
                                            onClick={() => { setAppliedVoucher(null); setVoucherCode(""); }}
                                            className="text-xs text-red-500 hover:underline font-medium"
                                        >
                                            Gỡ bỏ
                                        </button>
                                    </div>
                                )}

                                {availableVouchers.length > 0 && !appliedVoucher && (
                                    <div className="mt-3 space-y-2">
                                        <p className="text-xs text-gray-500 font-medium mb-1">Mã khả dụng:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {availableVouchers.map(v => (
                                                <button
                                                    key={v.voucherid}
                                                    className="border border-orange-200 bg-orange-50/50 hover:bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                                                    onClick={() => {
                                                        setVoucherCode(v.vouchercode);
                                                    }}
                                                >
                                                    <Ticket className="w-3.5 h-3.5" />
                                                    {v.vouchercode}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Separator className="my-6 border-dashed" />


                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Shipping</span>
                                    <span className="font-medium text-gray-900">{formatPrice(shippingFee)}</span>
                                </div>
                                {appliedVoucher && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-orange-600 flex items-center gap-1">
                                            <Ticket className="w-3 h-3" /> Voucher Discount
                                        </span>
                                        <span className="font-medium text-orange-600">-{formatPrice(voucherDiscount)}</span>
                                    </div>
                                )}
                                <Separator className="my-3 border-gray-100" />
                                <div className="flex justify-between text-base font-bold">
                                    <span className="text-gray-500">Total Discount</span>
                                    <span className="font-medium text-green-600">-{formatPrice(totalDiscount)}</span>
                                </div>
                            </div>


                            {cartItems.length > 0 && (
                                <div className="bg-blue-50/50 rounded-xl p-3 border border-blue-100 mb-6 flex gap-3">
                                    <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <div className="text-xs font-semibold text-blue-800 mb-1">Tổng Dinh dưỡng</div>
                                        <div className="text-xs text-blue-600 leading-relaxed font-medium">
                                            {totalCalories} kcal • {Math.round(totalCalories * 0.05)}g pr • {Math.round(totalCalories * 0.12)}g cb
                                        </div>
                                    </div>
                                </div>
                            )}


                            <div className="pt-2 mb-6 text-right">
                                <div className="text-2xl font-bold text-orange-500">
                                    {formatPrice(total)}
                                </div>
                                <div className="text-[10px] text-gray-400 mt-1 uppercase tracking-wide">
                                    (Đã bao gồm VAT)
                                </div>
                            </div>

                            <Button
                                className="w-full h-14 rounded-2xl text-lg font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-xl shadow-orange-200"
                                disabled={cartItems.length === 0 || !isLoggedIn}
                                onClick={async () => {
                                    if (!isLoggedIn) {
                                        router.push("/auth/login");
                                        return;
                                    }

                                    try {
                                        const userStr = localStorage.getItem("user");
                                        const user = JSON.parse(userStr || "");
                                        const userId = user.userid || user.UserId || user.id;

                                        const res = await fetch("/api/orders", {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({
                                                userid: userId,
                                                shippingaddress: addressDetails,
                                                totalprice: total,
                                                paymentmethod: paymentMethod,
                                                vouchercode: appliedVoucher?.vouchercode || null
                                            })
                                        });

                                        const data = await res.json();
                                        if (res.ok && data.orderId) {

                                            setCartItems([]);
                                            setAppliedVoucher(null);
                                            window.dispatchEvent(new Event('cartUpdate'));
                                            router.push(`/checkout/qr?orderId=${data.orderId}`);
                                        } else {
                                            alert(`Lỗi đặt hàng: ${data.error || "Không rõ nguyên nhân"}`);
                                        }
                                    } catch (error) {
                                        console.error("Place Order Error:", error);
                                        alert("Đã xảy ra lỗi khi tạo đơn hàng.");
                                    }
                                }}
                            >
                                {isLoggedIn ? "Place Order Now" : "Login to Order"}
                                <ChevronRight className="w-5 h-5 ml-2" />
                            </Button>
                        </div>
                    </div>
                </div>
            </main >

            <Footer />
        </div >
    )
}
