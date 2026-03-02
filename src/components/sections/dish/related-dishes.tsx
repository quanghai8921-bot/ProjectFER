import { Star, Clock, Flame, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const relatedDishes = [
    {
        title: "Healthy Bun Bo Hue",
        desc: "Bún bò Huế chính gốc với thịt bò nạc, ít dầu mỡ.",
        rating: 4.8,
        calories: "450 kcal",
        time: "20 mins",
        price: "65.000 đ",
        tag: "Phổ biến",
        tagColor: "bg-orange-500",
        image: "/images/bunbohue.jpg"
    },
    {
        title: "Grilled Chicken Burger",
        desc: "Burger với ức gà nướng than, xà lách tươi và sốt ít béo.",
        rating: 4.7,
        calories: "380 kcal",
        time: "15 mins",
        price: "59.000 đ",
        tag: "Mới",
        tagColor: "bg-green-500",
        image: "/images/burger.jpg"
    },
    {
        title: "Chicken Caesar Salad",
        desc: "Salad Caesar với gà nướng, sốt Caesar ít béo đặc biệt.",
        rating: 4.9,
        calories: "320 kcal",
        time: "10 mins",
        price: "85.000 đ",
        tag: null,
        image: "/images/caesar.jpg"
    },
    {
        title: "Avocado Quinoa Salad",
        desc: "Tuyệt vời cho người ăn chay với quinoa, bơ và rau xanh.",
        rating: 4.6,
        calories: "290 kcal",
        time: "15 mins",
        price: "90.000 đ",
        tag: "Chay",
        tagColor: "bg-purple-500",
        image: "/images/quinoa.jpg"
    },
]

export function RelatedDishes({ currentDishId }: { currentDishId?: string }) {
    return (
        <section className="py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Có thể bạn cũng thích</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedDishes.map((dish: any, index) => (
                    <Card key={index} className={`overflow-hidden bg-white hover:shadow-lg transition-all duration-300 border-gray-100 group cursor-pointer ${dish.foodstatus === "Out of Stock" ? "grayscale opacity-60" : ""}`}>
                        <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                            <div className="absolute inset-0 bg-gray-200 animate-pulse" />

                            {dish.tag && (
                                <Badge className={`absolute top-3 left-3 ${dish.tagColor} border-none text-white z-10`}>
                                    {dish.tag}
                                </Badge>
                            )}
                        </div>

                        <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-1">{dish.title}</h3>
                            </div>

                            <p className="text-xs text-gray-500 line-clamp-2 mb-3 h-8">
                                {dish.desc}
                            </p>

                            <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                                <div className="flex items-center gap-1">
                                    <Flame className="w-3 h-3" />
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
                                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-gray-100 hover:bg-primary hover:text-white transition-colors">
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
    )
}
