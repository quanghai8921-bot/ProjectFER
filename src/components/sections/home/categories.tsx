import { Beef, Coffee, Cake, Leaf } from "lucide-react"
import Link from "next/link"

const categories = [
    { name: "Món chính", icon: Beef, slug: "mon-chinh" },
    { name: "Đồ uống", icon: Coffee, slug: "do-uong" },
    { name: "Tráng miệng", icon: Cake, slug: "trang-mieng" },
    { name: "Sức khỏe", icon: Leaf, slug: "suc-khoe" },
]

export function Categories() {
    return (
        <section className="py-16">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900">
                        Khám phá theo <span className="text-primary">Danh mục</span>
                    </h2>
                    <p className="text-gray-500 mt-2">
                        Lựa chọn đa dạng từ món chính, đồ uống, tráng miệng đến thực phẩm lành mạnh
                    </p>
                </div>

                <div className="flex flex-wrap justify-center gap-4">
                    {categories.map((cat, index) => (
                        <Link
                            key={index}
                            href={`/menu?category=${encodeURIComponent(cat.slug)}`}
                            className="group flex flex-col items-center justify-center p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/20 hover:bg-orange-50/50 transition-all min-w-[120px] h-[120px]"
                        >
                            <div className="w-10 h-10 bg-gray-50 text-gray-400 group-hover:bg-white group-hover:text-primary rounded-full flex items-center justify-center mb-3 transition-colors">
                                <cat.icon className="h-5 w-5" />
                            </div>
                            <span className="text-sm font-medium text-gray-600 group-hover:text-primary transition-colors">
                                {cat.name}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}
