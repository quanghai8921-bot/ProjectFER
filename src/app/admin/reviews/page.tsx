"use client"

import { useState, useEffect } from "react"
import { Search, Star, MessageSquare, Calendar, User, ShoppingBag } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default function AdminReviews() {
    const [reviews, setReviews] = useState<any[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [filterRating, setFilterRating] = useState<number | null>(null)
    const [filterType, setFilterType] = useState<string>("all")
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await fetch('/api/reviews');
                if (res.ok) {
                    const data = await res.json();
                    setReviews(data.reviews || []);
                }
            } catch (error) {
                console.error("Load Reviews Error:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchReviews();
    }, []);

    const filteredReviews = reviews.filter(r => {
        const matchesSearch =
            r.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.orders?.users?.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.orderid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.fooditems?.foodname?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRating = filterRating === null || r.rating === filterRating;
        const matchesType = filterType === "all" || r.type === filterType;

        return matchesSearch && matchesRating && matchesType;
    });

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Phản hồi khách hàng</h1>
                    <p className="text-gray-500 mt-1">Theo dõi và quản lý các đánh giá từ khách hàng</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                onClick={() => setFilterRating(null)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filterRating === null ? 'bg-orange-100 text-orange-700' : 'bg-gray-50 hover:bg-gray-100 text-gray-600'}`}
                            >
                                Tất cả đánh giá
                            </button>
                            {[5, 4, 3, 2, 1].map(stars => (
                                <button
                                    key={stars}
                                    onClick={() => setFilterRating(stars)}
                                    className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium transition-colors ${filterRating === stars ? 'bg-orange-100 text-orange-700' : 'bg-gray-50 hover:bg-gray-100 text-gray-600'}`}
                                >
                                    {stars} <Star className="w-3.5 h-3.5 fill-current" />
                                </button>
                            ))}
                        </div>
                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Tìm khách hàng, món ăn, comment..."
                                className="pl-9 h-10 border-gray-200 bg-gray-50 focus-visible:ring-orange-100 rounded-xl"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-400">Loại đánh giá:</span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFilterType("all")}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${filterType === "all" ? "bg-gray-900 text-white shadow-md" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                            >
                                Tất cả
                            </button>
                            <button
                                onClick={() => setFilterType("order")}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${filterType === "order" ? "bg-blue-600 text-white shadow-md" : "bg-blue-50 text-blue-600 hover:bg-blue-100"}`}
                            >
                                Đơn hàng
                            </button>
                            <button
                                onClick={() => setFilterType("food")}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${filterType === "food" ? "bg-green-600 text-white shadow-md" : "bg-green-50 text-green-600 hover:bg-green-100"}`}
                            >
                                Món ăn
                            </button>
                        </div>
                    </div>
                </div>

                <div className="divide-y divide-gray-50">
                    {loading ? (
                        <div className="p-12 text-center text-gray-500">Đang tải dữ liệu...</div>
                    ) : filteredReviews.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            Không tìm thấy đánh giá nào.
                        </div>
                    ) : (
                        filteredReviews.map((review) => (
                            <div key={review.reviewid} className="p-6 hover:bg-gray-50/50 transition-colors">
                                <div className="flex flex-col lg:flex-row gap-6">
                                    
                                    <div className="w-full lg:w-1/4 space-y-4 border-r-0 lg:border-r border-gray-100 pr-0 lg:pr-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            {review.type === 'order' ? (
                                                <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-blue-100">Đơn hàng</span>
                                            ) : (
                                                <span className="bg-green-50 text-green-600 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-green-100">Món ăn</span>
                                            )}
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-2 text-gray-900 font-bold mb-1">
                                                <User className="w-4 h-4 text-gray-400" />
                                                <span>{review.orders?.users?.fullname || 'Guest'}</span>
                                            </div>
                                            <div className="text-xs text-gray-500 pl-6 truncate">
                                                {review.orders?.users?.email}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 text-gray-900 font-medium mb-1 text-sm">
                                                <ShoppingBag className="w-4 h-4 text-gray-400" />
                                                <span className="text-orange-600 font-bold italic">#{review.orderid?.substring(0, 8)}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] text-gray-400 pl-6 uppercase tracking-tight">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(review.orders?.ordertime || review.createdat).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>

                                    
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        className={`w-5 h-5 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400 drop-shadow-sm' : 'fill-gray-100 text-gray-200'}`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-xs text-gray-400 italic">
                                                {new Date(review.createdat).toLocaleString()}
                                            </span>
                                        </div>

                                        {review.type === 'food' && review.fooditems && (
                                            <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-2xl border border-gray-100/50">
                                                <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-white shadow-sm flex-shrink-0">
                                                    {review.fooditems.foodimageurl ? (
                                                        <img
                                                            src={review.fooditems.foodimageurl}
                                                            alt={review.fooditems.foodname}
                                                            className="object-cover w-full h-full"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gray-200" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase">Sản phẩm</p>
                                                    <p className="text-sm font-bold text-gray-900">{review.fooditems.foodname}</p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="bg-orange-50/30 rounded-2xl p-5 text-gray-700 relative border border-orange-100/20 group hover:border-orange-200/50 transition-all">
                                            <MessageSquare className="absolute top-4 right-4 w-4 h-4 text-orange-200 group-hover:scale-110 transition-transform" />
                                            {review.comment ? (
                                                <p className="pr-6 leading-relaxed text-sm font-medium">"{review.comment}"</p>
                                            ) : (
                                                <p className="pr-6 leading-relaxed text-sm italic text-gray-400">Khách hàng chỉ để lại đánh giá sao.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
