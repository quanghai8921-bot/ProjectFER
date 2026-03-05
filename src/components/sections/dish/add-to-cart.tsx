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
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-950 p-4 border-t border-gray-100 dark:border-gray-800 md:static md:bg-transparent md:border-t-0 md:p-0 transition-colors">
            <div className="flex items-center gap-4 container mx-auto md:px-0">
                <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 transition-colors">
                    <button
                        onClick={decreaseQuantity}
                        className="w-10 h-10 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-primary transition-colors"
                    >
                        <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-medium text-gray-900 dark:text-gray-100">{quantity}</span>
                    <button
                        onClick={increaseQuantity}
                        className="w-10 h-10 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-primary transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>

                <Button
                    onClick={handleAddToCart}
                    disabled={dish?.foodstatus === "Out of Stock"}
                    className={`flex-1 h-12 text-base font-semibold transition-all rounded-xl shadow-lg 
                        ${dish?.foodstatus === "Out of Stock"
                            ? "bg-gray-200 text-gray-500 cursor-not-allowed shadow-none"
                            : "bg-primary hover:bg-orange-600 text-white shadow-orange-200 dark:shadow-none"}`}
                >
                    {dish?.foodstatus === "Out of Stock" ? (
                        "Đã hết món"
                    ) : (
                        <>
                            <ShoppingCart className="w-5 h-5 mr-2" />
                            Thêm vào giỏ hàng {price ? `• ${price}` : ''}
                        </>
                    )}
                </Button>

                <div className="w-12 h-12 flex items-center justify-center bg-orange-50 dark:bg-orange-950/20 rounded-xl text-orange-500 dark:text-orange-400 cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors border border-transparent dark:border-orange-800/30">
                    <Info className="w-6 h-6" />
                </div>
            </div>
        </div>
    )
}
