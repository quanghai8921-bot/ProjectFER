import { Drumstick, Egg, Leaf, Utensils, Beef, Fish, Wheat } from "lucide-react"

const ICON_MAP: Record<string, any> = {
    "box": Utensils,
    "drumstick": Drumstick,
    "leaf": Leaf,
    "egg": Egg,
    "beef": Beef,
    "fish": Fish,
    "wheat": Wheat,
}

interface Ingredient {
    name: string
    amount: string
    icon: string
}

export function IngredientsList({ ingredients }: { ingredients?: Ingredient[] }) {
    if (!ingredients || ingredients.length === 0) return null;

    return (
        <div className="space-y-4">
            <h3 className="font-bold text-gray-900">Nguyên liệu chính</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {ingredients.map((item, index) => {
                    const Icon = ICON_MAP[item.icon] || Utensils
                    return (
                        <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                <Icon className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="font-medium text-gray-900 text-sm">{item.name}</div>
                                <div className="text-xs text-gray-500">{item.amount}</div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
