"use client";

import { useEffect, useState } from "react"
import { Flame, Clock, Star, UtensilsCrossed, Zap, Heart, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface PopularDish {
    id: string;
    title: string;
    desc: string;
    price: string;
    image: string;
    categories: string[];
    calories: string;
    time: string;
    rating: number;
    salesCount: number;
    aiReview: {
        summary: string;
        tags: string[];
    };
    foodstatus: string;
}

export function PopularDishes() {
    const [dishes, setDishes] = useState<PopularDish[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPopularDishes = async () => {
            try {
                const response = await fetch('/api/dishes/popular');
                if (response.ok) {
                    const data = await response.json();
                    setDishes(data);
                }
            } catch (error) {
                console.error("Error fetching popular dishes:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPopularDishes();
    }, []);

    if (loading) {
        return (
            <section className="py-24 bg-white dark:bg-gray-950">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6 animate-pulse">
                        <div className="space-y-4">
                            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
                            <div className="h-10 w-64 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="aspect-[4/5] bg-gray-100 dark:bg-gray-900 rounded-[2.5rem] animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (dishes.length === 0) return null;

    return (
        <section className="py-24 bg-white dark:bg-gray-950 overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6 relative">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="w-12 h-[2px] bg-primary hidden md:block"></span>
                            <span className="text-primary font-bold tracking-widest uppercase text-sm">Thực đơn nổi bật</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-gray-100 leading-tight mb-6">
                            Khám phá món ăn <span className="text-primary italic">phổ biến</span> nhất
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed">
                            Được lựa chọn dựa trên sự yêu thích của khách hàng và số lượng bán ra tại SmartBite.
                        </p>
                    </div>

                    <Link href="/menu">
                        <Button variant="outline" className="group rounded-full px-8 py-6 border-2 hover:bg-primary hover:border-primary hover:text-white transition-all duration-500 font-bold">
                            Xem tất cả thực đơn
                            <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
                    {dishes.map((dish) => (
                        <Link href={`/dishes/${dish.id}`} key={dish.id} className="block group transition-all duration-500 hover:-translate-y-3">
                            <Card className="h-full overflow-hidden border-none shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] transition-all duration-500 bg-white dark:bg-gray-900 rounded-[2.5rem] flex flex-col group-hover:ring-1 group-hover:ring-primary/20 p-0 gap-0">
                                <div className="relative aspect-[4/5] overflow-hidden">
                                    {dish.image ? (
                                        <img
                                            src={dish.image}
                                            alt={dish.title}
                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-300">
                                            <UtensilsCrossed className="w-16 h-16" />
                                        </div>
                                    )}

                                    <div className="absolute top-6 left-6 flex flex-col gap-2 z-10">
                                        {dish.aiReview?.tags && dish.aiReview.tags.map((tag, i) => (
                                            <div key={i} className="bg-white/90 dark:bg-gray-950/90 backdrop-blur-md text-gray-900 dark:text-gray-100 text-[10px] font-bold px-4 py-1.5 rounded-full shadow-lg flex items-center gap-2 uppercase tracking-wider">
                                                <Zap className="w-3 h-3 text-primary fill-current" />
                                                {tag}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="absolute top-6 right-6 z-10">
                                        <button className="w-10 h-10 rounded-full bg-white/90 dark:bg-gray-950/90 backdrop-blur-md flex items-center justify-center text-gray-400 hover:text-red-500 hover:scale-110 transition-all shadow-lg active:scale-95">
                                            <Heart className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                    <div className="absolute bottom-6 left-6 right-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                        <Button className="w-full rounded-full bg-primary hover:bg-primary/90 text-white font-bold py-6 shadow-xl shadow-primary/30">
                                            Đặt ngay {dish.price}
                                        </Button>
                                    </div>
                                </div>

                                <CardContent className="p-8 flex flex-col flex-1">
                                    <div className="flex justify-between items-start mb-4 gap-2">
                                        <h3 className="font-bold text-xl text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors line-clamp-1 leading-tight">
                                            {dish.title}
                                        </h3>
                                        <div className="flex items-center gap-1.5 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1.5 rounded-full flex-shrink-0">
                                            <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                                            <span className="text-xs font-black text-yellow-700 dark:text-yellow-500">{dish.rating}</span>
                                        </div>
                                    </div>

                                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-8 leading-relaxed flex-1 italic">
                                        "{dish.desc}"
                                    </p>

                                    <div className="flex flex-row items-center justify-between pt-6 border-t border-gray-100 dark:border-gray-800 gap-2 mt-auto">
                                        <div className="flex items-center gap-3 sm:gap-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center shrink-0">
                                                    <Flame className="w-4 h-4 text-orange-500" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter hidden xs:block">Năng lượng</span>
                                                    <span className="text-xs font-black text-gray-900 dark:text-gray-100 whitespace-nowrap">{dish.calories}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                                                    <Clock className="w-4 h-4 text-blue-500" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter hidden xs:block">Thời gian</span>
                                                    <span className="text-xs font-black text-gray-900 dark:text-gray-100 whitespace-nowrap">{dish.time}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-base sm:text-lg font-black text-primary whitespace-nowrap">
                                            {dish.price}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}
