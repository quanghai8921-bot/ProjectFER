"use client"

import { useState, useEffect, useMemo } from "react"
import { ProductGallery } from "@/components/sections/dish/product-gallery"
import { ProductInfo } from "@/components/sections/dish/product-info"
import { CustomizationOptions } from "@/components/sections/dish/customization-options"
import { IngredientsList } from "@/components/sections/dish/ingredients-list"
import { AddToCart } from "@/components/sections/dish/add-to-cart"
import { RelatedDishes } from "@/components/sections/dish/related-dishes"
import { Separator } from "@/components/ui/separator"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { DishReviews } from "@/components/sections/dish/dish-reviews"
import { ReviewDialog } from "@/components/shared/ReviewDialog"
import { ArrowLeft, Star } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

export default function DishPage() {
    const params = useParams()
    const id = params?.id as string
    const [dish, setDish] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")
    const [selectedExtras, setSelectedExtras] = useState<Record<number, boolean>>({})
    const [eligibility, setEligibility] = useState<{ eligible: boolean, orderId: string | null, orderItems: any[] }>({ eligible: false, orderId: null, orderItems: [] })
    const [isMounted, setIsMounted] = useState(false)
    const [reviewRefreshKey, setReviewRefreshKey] = useState(0)

    const handleToggleExtra = (idx: number) => {
        setSelectedExtras(prev => ({ ...prev, [idx]: !prev[idx] }))
    }

    const currentTotalPrice = useMemo(() => {
        if (!dish || !isMounted) return dish?.price || "";
        let extraPrice = 0;
        if (dish.extras) {
            dish.extras.forEach((extra: any, idx: number) => {
                if (selectedExtras[idx]) {
                    const num = parseInt(extra.price.replace(/[^\d]/g, ''), 10) || 0;
                    extraPrice += num;
                }
            })
        }
        const basePrice = parseInt((dish.price || "0").replace(/[^\d]/g, ''), 10) || 0;
        const total = basePrice + extraPrice;
        return total > 0 ? total.toLocaleString('vi-VN') + ' đ' : dish.price;
    }, [dish, selectedExtras, isMounted]);

    useEffect(() => {
        setIsMounted(true)
    }, [])

    useEffect(() => {
        if (!id) return;

        const fetchDish = async () => {
            try {
                const res = await fetch(`/api/dishes/${id}`);
                if (!res.ok) {
                    throw new Error("Không tìm thấy món ăn");
                }
                const data = await res.json();
                console.log("Fetched dish data:", data);
                setDish(data);
            } catch (err) {
                console.error(err);
                setError("Không thể tải chi tiết món ăn.");
            } finally {
                setIsLoading(false);
            }
        };

        const checkEligibility = async () => {
            try {
                const res = await fetch(`/api/reviews?action=check-eligibility&foodid=${dish?.foodid || id}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.eligible) {
                        setEligibility({
                            eligible: true,
                            orderId: data.orderId,
                            orderItems: data.orderItems?.map((oi: any) => ({
                                foodid: oi.foodid,
                                quantity: oi.quantity,
                                fooditems: {
                                    foodname: oi.fooditems?.foodname,
                                    foodimageurl: oi.fooditems?.foodimageurl
                                }
                            })) || []
                        });
                    }
                }
            } catch (err) {
                console.error("Lỗi kiểm tra điều kiện:", err);
            }
        };

        const fetchData = async () => {
            await fetchDish();
            await checkEligibility();
        };

        fetchData();
    }, [id, reviewRefreshKey]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col transition-colors duration-300">
                <Navbar />
                <main className="flex-grow flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                </main>
                <Footer />
            </div>
        )
    }

    const isUnavailable = !dish || (dish.foodstatus !== 'Available' && dish.foodstatus !== 'Có sẵn' && dish.foodstatus !== 'Out of Stock');

    if (error || isUnavailable) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col transition-colors duration-300">
                <Navbar />
                <main className="flex-grow flex flex-col items-center justify-center gap-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{dish?.foodstatus === 'Unavailable' ? 'Món ăn đã ngừng kinh doanh' : 'Không tìm thấy món ăn'}</h2>
                    <Link href="/menu">
                        <span className="text-orange-500 hover:underline">Quay lại Menu</span>
                    </Link>
                </main>
                <Footer />
            </div>
        )
    }



    const aiAnalysis = dish.aiReview ? {
        text: dish.aiReview.summary,
        tags: dish.aiReview.tags?.map((tag: string) => ({
            text: tag,
            color: "green",
            check: true
        })) || []
    } : undefined;


    const images = dish.images && dish.images.length > 0 ? dish.images : [dish.image];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col transition-colors duration-300">
            <Navbar />

            <main className={`flex-grow container mx-auto px-4 py-8 transition-all duration-500 ${dish.foodstatus === "Out of Stock" ? "grayscale opacity-60 pointer-events-none" : ""}`}>
                {dish.foodstatus === "Out of Stock" && (
                    <div className="bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg mb-6 text-sm font-medium border border-red-100 dark:border-red-900/30 flex items-center justify-center">
                        Thông báo: Món ăn này hiện đang tạm hết hàng. Quý khách vui lòng chọn món khác.
                    </div>
                )}

                <div className="mb-6">
                    <Link href="/menu" className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Quay lại Menu
                    </Link>
                </div>

                <div className="grid lg:grid-cols-12 gap-8 mb-12">

                    <div className="lg:col-span-7">
                        <ProductGallery images={images} />
                    </div>


                    <div className="lg:col-span-5 space-y-8">
                        <ProductInfo
                            title={dish.title}
                            price={dish.price}
                            originalPrice={null}
                            rating={dish.rating}
                            reviewCount={dish.reviewCount || 0}
                            time={dish.time}
                            calories={dish.calories}
                            description={dish.desc}
                            aiAnalysis={aiAnalysis}
                        />

                        <Separator className="dark:bg-gray-800" />

                        <IngredientsList ingredients={dish.ingredients} />

                        <Separator className="dark:bg-gray-800" />

                        <CustomizationOptions extras={dish.extras} selectedExtras={selectedExtras} onToggleExtra={handleToggleExtra} />


                        <div className="hidden md:block">
                            <AddToCart price={currentTotalPrice} dish={dish} selectedExtras={selectedExtras} />
                        </div>
                    </div>
                </div>


                <div className="md:hidden">
                    <AddToCart price={currentTotalPrice} dish={dish} selectedExtras={selectedExtras} />
                </div>

                <Separator className="my-12 dark:bg-gray-800" />


                <DishReviews foodId={dish.foodid} refreshKey={reviewRefreshKey} />

                <Separator className="my-12 dark:bg-gray-800" />

                <RelatedDishes currentDishId={dish.id} />
            </main>

            <Footer />
        </div>
    )
}
