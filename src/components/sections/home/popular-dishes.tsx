import { Star, Clock, Flame } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import dishesData from "@/data/dishes.json"



const dishes = (dishesData as any[]).map((dish) => ({
    ...dish,
    image: (
        <img
            src={dish.image}
            alt={dish.title}
            className="w-full h-full object-cover"
        />
    ),
}))

export function PopularDishes() {
    return (
        <section className="py-20 bg-gray-50/50">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">
                            Món ăn <span className="text-primary">Phổ biến</span>
                        </h2>
                        <p className="text-gray-500 mt-2">
                            Những món ăn được yêu thích nhất tại SmartBite
                        </p>
                    </div>
                    <Button variant="outline" className="hidden md:flex">
                        Xem tất cả
                    </Button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {dishes.map((dish, index) => (
                        <Link href={`/dishes/${dish.slug}`} key={index} className="block group">
                            <Card className="overflow-hidden bg-white hover:shadow-lg transition-all duration-300 border-gray-100 h-full">
                                <div className="relative aspect-[5/4] bg-gray-100 overflow-hidden">
                                    <div className="w-full h-full group-hover:scale-105 transition-transform duration-500">
                                        {dish.image}
                                    </div>
                                    <Badge className="absolute top-4 left-4 bg-orange-500 hover:bg-orange-600 z-10">Phổ biến</Badge>
                                </div>

                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors">{dish.title}</h3>
                                        <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
                                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                            {dish.rating}
                                        </div>
                                    </div>

                                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                                        {dish.desc}
                                    </p>

                                    <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                                        <div className="flex items-center gap-1">
                                            <Flame className="w-3 h-3" />
                                            {dish.calories}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {dish.time}
                                        </div>
                                    </div>

                                    <div className="font-bold text-primary text-lg">
                                        {dish.price}
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
