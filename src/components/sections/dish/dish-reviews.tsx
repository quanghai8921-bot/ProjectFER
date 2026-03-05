"use client"

import { useState, useEffect } from "react"
import { Star, MessageSquare, Loader2, User } from "lucide-react"

interface DishReviewsProps {
    foodId: string
    refreshKey?: number
}

export function DishReviews({ foodId, refreshKey = 0 }: DishReviewsProps) {
    const [reviews, setReviews] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
        const fetchReviews = async () => {
            if (!foodId) return;
            try {
                const res = await fetch(`/api/reviews?foodid=${foodId}`)
                if (res.ok) {
                    const data = await res.json()
                    setReviews(data.reviews || [])
                }
            } catch (e) {
                console.error("Fetch dish reviews error:", e)
            } finally {
                setLoading(false)
            }
        }
        fetchReviews()
    }, [foodId, refreshKey])

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    Đánh giá từ khách hàng
                    <span className="text-sm font-medium text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                        {reviews.length}
                    </span>
                </h3>
            </div>

            {reviews.length === 0 ? (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-3xl p-12 text-center border-2 border-dashed border-gray-100 dark:border-gray-800">
                    <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100 dark:border-gray-800">
                        <MessageSquare className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium italic">Chưa có đánh giá nào cho món ăn này. Hãy là người đầu tiên đánh giá nhé!</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {reviews.map((review) => (
                        <div key={review.reviewid} className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-950/40 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400">
                                        <User className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-gray-100">
                                            {review.orders?.users?.fullname || "Khách hàng đã mua"}
                                        </h4>
                                        <p className="text-xs text-gray-400 dark:text-gray-500">
                                            {isMounted ? new Date(review.createdat).toLocaleDateString() : ""}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-0.5">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`w-4 h-4 ${star <= review.rating
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "fill-gray-100 dark:fill-gray-800 text-gray-200 dark:text-gray-700"
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>
                            {review.comment && (
                                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed italic border-l-2 border-orange-200 dark:border-orange-800 pl-4 py-1">
                                    "{review.comment}"
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
