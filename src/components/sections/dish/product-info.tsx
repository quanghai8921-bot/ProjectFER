import { Star, Clock, Flame, Sparkles } from "lucide-react"

interface AiTag {
    text: string
    color: string
    check: boolean
}

interface AiAnalysis {
    text: string
    tags: AiTag[]
}

interface ProductInfoProps {
    title: string
    price: string
    originalPrice?: string | null
    rating: number
    reviewCount: number
    time: string
    calories: string
    description: string
    aiAnalysis?: AiAnalysis
}

export function ProductInfo({
    title,
    price,
    originalPrice,
    rating,
    reviewCount,
    time,
    calories,
    description,
    aiAnalysis,
}: ProductInfoProps) {
    return (
        <div className="flex flex-col gap-6">

            <div>
                <div className="flex justify-between items-start">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-orange-500">{price}</div>
                        {originalPrice && (
                            <div className="text-sm text-gray-400 line-through">
                                {originalPrice}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-6 mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium text-gray-900 dark:text-gray-100">{rating}</span>
                        <span>({reviewCount} đánh giá)</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{time}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Flame className="w-4 h-4 text-orange-500" />
                        <span>{calories}</span>
                    </div>
                </div>
            </div>


            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>


            {aiAnalysis && (
                <div className="bg-orange-50 dark:bg-orange-950/20 rounded-2xl p-6 relative overflow-hidden border border-orange-100 dark:border-orange-900/30 transition-colors">

                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Sparkles className="w-24 h-24 text-orange-500" />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 font-bold mb-2">
                            <Sparkles className="w-5 h-5" />
                            <h3>SmartBite AI đánh giá</h3>
                        </div>

                        <div
                            className="text-sm text-gray-700 dark:text-gray-300 mb-4"
                            dangerouslySetInnerHTML={{ __html: aiAnalysis.text }}
                        />

                        <div className="flex flex-wrap gap-2">
                            {aiAnalysis.tags.map((tag, index) => {
                                const colors = {
                                    blue: { bg: "bg-blue-100 dark:bg-blue-900/40", text: "text-blue-800 dark:text-blue-300", dot: "bg-blue-500" },
                                    green: { bg: "bg-green-100 dark:bg-green-900/40", text: "text-green-800 dark:text-green-300", dot: "bg-green-500" },
                                    yellow: { bg: "bg-yellow-100 dark:bg-yellow-900/40", text: "text-yellow-800 dark:text-yellow-300", dot: "bg-yellow-500" },
                                    purple: { bg: "bg-purple-100 dark:bg-purple-900/40", text: "text-purple-800 dark:text-purple-300", dot: "bg-purple-500" },
                                }[tag.color] || { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-800 dark:text-gray-300", dot: "bg-gray-500" }

                                return (
                                    <span
                                        key={index}
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}
                                    >
                                        <span className={`w-1.5 h-1.5 ${colors.dot} rounded-full mr-1.5`}></span>
                                        {tag.text}
                                    </span>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
