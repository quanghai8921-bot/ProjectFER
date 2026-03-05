"use client"

import { useState, useEffect } from "react"
import { Star, Clock, Flame, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function RelatedDishes({ currentDishId }: { currentDishId?: string }) {
    const [dishes, setDishes] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchRelated = async () => {
            try {
                const res = await fetch('/api/dishes')
                if (res.ok) {
                    const data = await res.json()
                    // Filter out current dish and take first 4 items
                    const filtered = data
                        .filter((d: any) => d.id !== currentDishId && d.foodstatus !== "Unavailable")
                        .slice(0, 4)
                    setDishes(filtered)
                }
            } catch (err) {
                console.error("Fetch related dishes error:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchRelated()
    }, [currentDishId])

    if (loading) {
        return (
            <section className="py-12">
                <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-6"></div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="aspect-[3/4] bg-gray-100 dark:bg-gray-900 rounded-3xl animate-pulse"></div>
                    ))}
                </div>
            </section>
        )
    }

    if (dishes.length === 0) return null;

    return (
        <section className="py-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Có thể bạn cũng thích</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {dishes.map((dish: any, index) => (
                    <Link key={dish.id || index} href={`/dishes/${dish.id}`}>
                        <Card className={`overflow-hidden h-full bg-white dark:bg-gray-900 hover:shadow-xl transition-all duration-500 border-gray-100 dark:border-gray-800 group cursor-pointer p-0 gap-0 ${dish.foodstatus === "Out of Stock" ? "grayscale opacity-60" : ""}`}>
                            <div className="relative aspect-[4/3] bg-gray-100 dark:bg-gray-800 overflow-hidden">
                                <img
                                    src={dish.image || "/images/placeholder.jpg"}
                                    alt={dish.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                {dish.tag && (
                                    <Badge className={`absolute top-3 left-3 bg-orange-500 border-none text-white z-10`}>
                                        {dish.tag}
                                    </Badge>
                                )}
                            </div>

                            <CardContent className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors line-clamp-1">{dish.title}</h3>
                                </div>

                                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 h-8">
                                    {dish.desc || dish.description}
                                </p>

                                <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500 mb-3">
                                    <div className="flex items-center gap-1">
                                        <Flame className="w-3 h-3 text-orange-500" />
                                        {dish.calories}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {dish.time}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="font-bold text-primary">
                                        {dish.price}
                                    </div>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-primary group-hover:text-white transition-colors">
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </section>
    )
}
