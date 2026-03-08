"use client"

import { useState } from "react"
import { Minus, Plus, ShoppingCart, Info, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface AddToCartProps {
    price?: string
    dish?: any
    selectedExtras?: Record<number, boolean>
}

export function AddToCart({ price, dish, selectedExtras }: AddToCartProps) {
    const [quantity, setQuantity] = useState(1)
    const router = useRouter()

    const decreaseQuantity = () => {
        if (quantity > 1) setQuantity(quantity - 1)
    }

    const increaseQuantity = () => {
        setQuantity(quantity + 1)
    }

    const handleAddToCart = async () => {
        if (!dish || dish.foodstatus === "Out of Stock" || dish.foodstatus === "Unavailable") {
            alert("Rất tiếc, món ăn này hiện không khả dụng.");
            return;
        }

        const userStr = localStorage.getItem("user");
        if (!userStr) {
            alert("Vui lòng đăng nhập để thêm món vào giỏ hàng.");
            router.push("/auth/login");
            return;
        }

        let user;
        try {
            user = JSON.parse(userStr);
        } catch (e) {
            console.error("Failed to parse user from localStorage:", e);
            alert("Lỗi dữ liệu đăng nhập. Vui lòng đăng xuất và đăng nhập lại.");
            return;
        }

        if (!user) {
            alert("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
            router.push("/auth/login");
            return;
        }

        const userId = user.userid || user.UserId || user.id;

        if (!userId) {
            alert("Vui lòng Đăng nhập lại để cập nhật thông tin tài khoản.");
            return;
        }


        const selectedExtrasArray = dish.extras
            ? dish.extras.filter((_: any, idx: number) => selectedExtras?.[idx])
            : [];



        const toppingIds = selectedExtrasArray
            .map((e: any) => e.id)
            .filter((id: any) => id !== undefined && id !== null && id !== "");

        try {
            console.log("Adding to cart:", { userId, foodId: dish.id, quantity, toppingIds });
            const res = await fetch('/api/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: userId,
                    foodId: dish.id,
                    quantity,
                    selectedExtras: toppingIds,
                    note: ""
                })
            });

            if (res.ok) {
                window.dispatchEvent(new Event('cartUpdate'));
                alert(`Đã thêm ${quantity} phần ${dish.title} vào giỏ hàng`);
            } else {
                let errorData;
                try {
                    errorData = await res.json();
                } catch (e) {
                    console.error("Failed to parse error JSON:", e);
                    throw new Error(`Server returned status ${res.status} (Not JSON)`);
                }

                console.error("Cart API Error:", errorData);
                if (errorData.error?.includes("foreign key constraint")) {
                    alert("Lỗi: Phiên đăng nhập chưa đồng bộ. Hệ thống đang tự động sửa lỗi, bạn vui lòng THỬ LẠI hoặc F5 trang.");
                } else {
                    alert(`Lỗi: ${errorData.error || "Không thể thêm vào giỏ hàng"}`);
                }
            }
        } catch (error: any) {
            console.error("Cart Error Details:", error);
            alert(`Đã xảy ra lỗi khi kết nối với máy chủ: ${error.message || "Không xác định"}`);
        }
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-950 p-3 sm:p-4 border-t border-gray-100 dark:border-gray-800 md:static md:bg-transparent md:border-t-0 md:p-0 transition-colors z-50">
            <div className="flex items-center gap-2 sm:gap-4 container mx-auto md:px-0 max-w-full overflow-hidden">
                <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 transition-colors shrink-0">
                    <button
                        onClick={decreaseQuantity}
                        className="w-8 h-10 sm:w-10 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-primary transition-colors"
                    >
                        <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 sm:w-8 text-center font-bold text-gray-900 dark:text-gray-100 text-sm sm:text-base">{quantity}</span>
                    <button
                        onClick={increaseQuantity}
                        className="w-8 h-10 sm:w-10 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-primary transition-colors"
                    >
                        <Plus className="w-3.5 h-3.5" />
                    </button>
                </div>

                <Button
                    onClick={handleAddToCart}
                    disabled={dish?.foodstatus === "Out of Stock"}
                    className={`flex-1 h-11 sm:h-12 text-sm sm:text-base font-bold transition-all rounded-xl shadow-lg min-w-0 px-2
                        ${dish?.foodstatus === "Out of Stock"
                            ? "bg-gray-200 text-gray-500 cursor-not-allowed shadow-none"
                            : "bg-primary hover:bg-orange-600 text-white shadow-orange-200 dark:shadow-none"}`}
                >
                    {dish?.foodstatus === "Out of Stock" ? (
                        "Đã hết món"
                    ) : (
                        <div className="flex items-center justify-center gap-1.5 w-full">
                            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                            <span className="truncate">Thêm giỏ hàng</span>
                            {price && <span className="whitespace-nowrap shrink-0 ml-auto pl-1 hidden xs:block">• {price}</span>}
                        </div>
                    )}
                </Button>

                <div className="hidden sm:flex w-12 h-12 items-center justify-center bg-orange-50 dark:bg-orange-950/20 rounded-xl text-orange-500 dark:text-orange-400 cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors border border-transparent dark:border-orange-800/30 shrink-0">
                    <Info className="w-6 h-6" />
                </div>
            </div>
        </div>
    )
}
