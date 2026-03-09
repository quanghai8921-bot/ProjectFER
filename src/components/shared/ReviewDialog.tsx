"use client"

import { useState, useEffect } from "react"
import { Star, MessageSquare, Loader2, Utensils, Send, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import Image from "next/image"

interface ReviewDialogProps {
    orderId: string
    orderItems?: any[]
    triggerElement?: React.ReactNode
    onReviewSubmitted?: () => void
    type?: 'all' | 'order' | 'dish'
}

export function ReviewDialog({ orderId, orderItems = [], triggerElement, onReviewSubmitted, type = 'all' }: ReviewDialogProps) {
    const [open, setOpen] = useState(false)
    const [isMounted, setIsMounted] = useState(false)

    const [orderRating, setOrderRating] = useState(0)
    const [orderHover, setOrderHover] = useState(0)
    const [orderComment, setOrderComment] = useState("")

    const [foodRatings, setFoodRatings] = useState<Record<string, { rating: number, hover: number, comment: string }>>({})

    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState("")

    const [loadingInfo, setLoadingInfo] = useState(false)
    const [justSubmitted, setJustSubmitted] = useState(false)
    const [initialReviewedFoodIds, setInitialReviewedFoodIds] = useState<Set<string>>(new Set())
    const [initialOrderReviewed, setInitialOrderReviewed] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])


    useEffect(() => {
        if (orderItems.length > 0) {
            const initial: Record<string, { rating: number, hover: number, comment: string }> = {}
            orderItems.forEach(item => {
                initial[item.foodid] = { rating: 0, hover: 0, comment: "" }
            })
            setFoodRatings(initial)
        }
    }, [orderItems])


    useEffect(() => {
        if (open && isMounted) {
            const checkReview = async () => {
                setLoadingInfo(true)
                try {
                    const res = await fetch(`/api/reviews?orderid=${orderId}`)
                    if (res.ok) {
                        const data = await res.json()
                        const reviewedFoodIds = new Set<string>()

                        if (data.orderReview) {
                            setOrderRating(data.orderReview.rating)
                            setOrderComment(data.orderReview.comment || "")
                            setInitialOrderReviewed(true)
                        } else {
                            setInitialOrderReviewed(false)
                        }

                        if (data.foodReviews && data.foodReviews.length > 0) {
                            const newFoodRatings: Record<string, any> = {}
                            data.foodReviews.forEach((fr: any) => {
                                reviewedFoodIds.add(fr.foodid)
                                newFoodRatings[fr.foodid] = {
                                    rating: fr.rating,
                                    hover: 0,
                                    comment: fr.comment || ""
                                }
                            })
                            setFoodRatings(prev => ({ ...prev, ...newFoodRatings }))
                        }
                        setInitialReviewedFoodIds(reviewedFoodIds)
                    }
                } catch (e) {
                    console.error("Check review error:", e)
                } finally {
                    setLoadingInfo(false)
                }
            }
            checkReview()
        }
    }, [open, orderId, isMounted])

    const handleSubmit = async () => {

        const hasNewOrderRating = (type === 'all' || type === 'order') && !initialOrderReviewed && orderRating > 0
        const hasNewFoodRating = (type === 'all' || type === 'dish') && Object.entries(foodRatings).some(([foodId, data]) =>
            !initialReviewedFoodIds.has(foodId) && data.rating > 0
        )

        if (!hasNewOrderRating && !hasNewFoodRating) {
            setError("Vui lòng thêm ít nhất một đánh giá mới.")
            return
        }

        setSubmitting(true)
        setError("")

        try {
            const foodReviews = Object.entries(foodRatings)
                .filter(([foodId, data]) => !initialReviewedFoodIds.has(foodId) && data.rating > 0)
                .map(([foodId, data]) => ({
                    foodId,
                    rating: data.rating,
                    comment: data.comment
                }))

            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId,
                    rating: hasNewOrderRating ? orderRating : null,
                    comment: hasNewOrderRating ? orderComment : "",
                    foodReviews: type === 'all' || type === 'dish' ? foodReviews : []
                })
            })

            if (res.ok) {
                setJustSubmitted(true)
                if (onReviewSubmitted) onReviewSubmitted()
                setTimeout(() => setOpen(false), 3000)
            } else {
                const data = await res.json()
                setError(data.error || "Không thể gửi đánh giá.")
            }
        } catch (e) {
            setError("Có lỗi xảy ra. Vui lòng thử lại.")
        } finally {
            setSubmitting(false)
        }
    }

    const updateFoodRating = (foodId: string, rating: number) => {
        setFoodRatings(prev => ({
            ...prev,
            [foodId]: { ...prev[foodId], rating }
        }))
    }

    const updateFoodHover = (foodId: string, hover: number) => {
        setFoodRatings(prev => ({
            ...prev,
            [foodId]: { ...prev[foodId], hover }
        }))
    }

    const updateFoodComment = (foodId: string, comment: string) => {
        setFoodRatings(prev => ({
            ...prev,
            [foodId]: { ...prev[foodId], comment }
        }))
    }

    if (!isMounted) {


        return null;
    }

    const displayOrderId = orderId ? orderId.substring(0, 8) : "";

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {triggerElement || (
                    <Button variant="outline" className="rounded-xl border-orange-200 text-orange-600 bg-orange-50 hover:bg-orange-100 font-bold shadow-sm">
                        <Star className="w-4 h-4 mr-2" />
                        {type === 'dish' ? 'Đánh giá món' : 'Đánh giá đơn hàng'}
                    </Button>
                )}
            </DialogTrigger>

            <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto rounded-3xl p-0 border-0 shadow-2xl focus:outline-none dark:bg-gray-950">
                <div className="bg-white dark:bg-gray-950">
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-8 text-white relative">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold text-white">
                                {justSubmitted ? "Cảm ơn bạn!" : type === 'dish' ? "Đánh giá món" : "Đánh giá đơn hàng"}
                            </DialogTitle>
                            <DialogDescription className="text-orange-100 text-base">
                                {justSubmitted
                                    ? "Ý kiến của bạn giúp chúng tôi cải thiện dịch vụ tốt hơn."
                                    : type === 'dish' ? "Bạn cảm thấy món ăn này như thế nào?" : "Bạn cảm thấy đơn hàng như thế nào?"}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="absolute -bottom-6 right-8 w-12 h-12 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg">
                            <Utensils className="w-6 h-6 text-orange-500" />
                        </div>
                    </div>

                    <div className="px-6 py-8 space-y-8">
                        {loadingInfo ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-4">
                                <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
                                <p className="text-gray-400 dark:text-gray-500 font-medium">Đang tải thông tin...</p>
                            </div>
                        ) : (
                            <div className="space-y-10">

                                {(type === 'all' || type === 'order') && (
                                    <section className="space-y-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-1 h-6 bg-orange-500 rounded-full"></div>
                                            <h4 className="font-bold text-gray-900 dark:text-gray-100 text-lg">Đánh giá đơn hàng</h4>
                                        </div>

                                        <div className="bg-orange-50/50 dark:bg-orange-900/10 p-6 rounded-3xl border border-orange-100/50 dark:border-orange-900/20">
                                            <div className="flex justify-center gap-3 mb-6">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={`order-star-${star}`}
                                                        type="button"
                                                        disabled={initialOrderReviewed || submitting || justSubmitted}
                                                        className={`transition-all duration-300 ${initialOrderReviewed || submitting || justSubmitted ? 'cursor-default' : 'cursor-pointer hover:scale-125'}`}
                                                        onMouseEnter={() => !initialOrderReviewed && !submitting && !justSubmitted && setOrderHover(star)}
                                                        onMouseLeave={() => !initialOrderReviewed && !submitting && !justSubmitted && setOrderHover(0)}
                                                        onClick={() => !initialOrderReviewed && !submitting && !justSubmitted && setOrderRating(star)}
                                                    >
                                                        <Star
                                                            className={`w-10 h-10 transition-all ${star <= (orderHover || orderRating)
                                                                ? "fill-orange-400 text-orange-400 drop-shadow-md"
                                                                : "fill-gray-100 dark:fill-gray-800 text-gray-200 dark:text-gray-700"
                                                                }`}
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="relative group">
                                                <MessageSquare className="absolute top-4 left-4 w-4 h-4 text-gray-300 dark:text-gray-600 group-focus-within:text-orange-400 transition-colors" />
                                                <textarea
                                                    disabled={initialOrderReviewed || submitting || justSubmitted}
                                                    placeholder="Để lại nhận xét về dịch vụ, giao hàng..."
                                                    className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl min-h-[100px] text-sm focus:outline-none focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-900/20 focus:border-orange-300 dark:focus:border-orange-800 transition-all resize-none shadow-sm disabled:opacity-80 disabled:bg-gray-50 dark:disabled:bg-gray-800 dark:text-gray-100"
                                                    value={orderComment}
                                                    onChange={(e) => setOrderComment(e.target.value)}
                                                ></textarea>
                                            </div>
                                        </div>
                                    </section>
                                )}


                                {(type === 'all' || type === 'dish') && orderItems.length > 0 && (
                                    <section className="space-y-6">
                                        {type === 'all' && (
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-1 h-6 bg-orange-500 rounded-full"></div>
                                                <h4 className="font-bold text-gray-900 dark:text-gray-100 text-lg">Đánh giá món</h4>
                                            </div>
                                        )}

                                        <div className="space-y-6">
                                            {orderItems.map((item) => (
                                                <div key={`food-item-${item.foodid}`} className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 hover:border-orange-200 dark:hover:border-orange-800 transition-all shadow-sm">
                                                    <div className="flex items-center gap-4 mb-5">
                                                        <div className="relative w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-50 dark:bg-gray-800 border border-gray-50 dark:border-gray-700">
                                                            {item.fooditems?.foodimageurl ? (
                                                                <Image
                                                                    src={item.fooditems.foodimageurl}
                                                                    alt={item.fooditems.foodname}
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                    <Utensils className="w-8 h-8 text-gray-200 dark:text-gray-700" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-grow">
                                                            <p className="text-base font-bold text-gray-900 dark:text-gray-100 leading-tight mb-1">{item.fooditems?.foodname}</p>
                                                            <div className="flex gap-1 mt-2">
                                                                {[1, 2, 3, 4, 5].map((star) => {
                                                                    const isAlreadyReviewed = initialReviewedFoodIds.has(item.foodid)
                                                                    const isDisabled = isAlreadyReviewed || submitting || justSubmitted
                                                                    return (
                                                                        <button
                                                                            key={`star-${item.foodid}-${star}`}
                                                                            type="button"
                                                                            disabled={isDisabled}
                                                                            onMouseEnter={() => !isDisabled && updateFoodHover(item.foodid, star)}
                                                                            onMouseLeave={() => !isDisabled && updateFoodHover(item.foodid, 0)}
                                                                            onClick={() => !isDisabled && updateFoodRating(item.foodid, star)}
                                                                            className={`transition-all ${isDisabled ? 'cursor-default' : 'hover:scale-110'}`}
                                                                        >
                                                                            <Star
                                                                                className={`w-6 h-6 transition-all ${star <= (foodRatings[item.foodid]?.hover || foodRatings[item.foodid]?.rating || 0)
                                                                                    ? "fill-yellow-400 text-yellow-400 drop-shadow-sm"
                                                                                    : "fill-gray-100 dark:fill-gray-800 text-gray-200 dark:text-gray-700"
                                                                                    }`}
                                                                            />
                                                                        </button>
                                                                    )
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="relative group">
                                                        <MessageSquare className="absolute top-3.5 left-3.5 w-3.5 h-3.5 text-gray-300 dark:text-gray-600 group-focus-within:text-orange-400 transition-colors" />
                                                        <textarea
                                                            disabled={initialReviewedFoodIds.has(item.foodid) || submitting || justSubmitted}
                                                            placeholder={`Bạn thấy món ${item.fooditems?.foodname} thế nào?`}
                                                            className="w-full pl-10 pr-4 py-3 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-2xl min-h-[80px] text-xs focus:outline-none focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-900/20 transition-all resize-none shadow-inner disabled:opacity-80 dark:text-gray-100"
                                                            value={foodRatings[item.foodid]?.comment || ""}
                                                            onChange={(e) => updateFoodComment(item.foodid, e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {error && (
                                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-2xl text-sm font-bold text-center border border-red-100 dark:border-red-900/30">
                                        {error}
                                    </div>
                                )}

                                <div className="pt-4">
                                    {!justSubmitted ? (
                                        <Button
                                            onClick={handleSubmit}
                                            disabled={submitting}
                                            className="w-full rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold h-14 text-lg transition-all shadow-lg active:scale-[0.98] disabled:opacity-70"
                                        >
                                            {submitting ? (
                                                <>
                                                    <Loader2 className="w-6 h-6 animate-spin mr-3" />
                                                    Đang gửi...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-5 h-5 mr-3" />
                                                    Gửi đánh giá
                                                </>
                                            )}
                                        </Button>
                                    ) : (
                                        <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-base font-bold p-6 rounded-3xl flex flex-col items-center justify-center border border-green-100 dark:border-green-900/30 gap-2">
                                            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white mb-2 shadow-lg shadow-green-100 dark:shadow-none">
                                                <CheckCircle2 className="w-6 h-6" />
                                            </div>
                                            <span>Đã lưu đánh giá thành công!</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
