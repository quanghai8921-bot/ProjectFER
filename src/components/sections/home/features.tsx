import { Brain, Flame, Clock, Truck } from "lucide-react"

const features = [
    {
        icon: Brain,
        title: "Tư vấn Dinh dưỡng AI",
        description: "Nhận gợi ý món ăn phù hợp với mục tiêu sức khỏe của bạn từ trí tuệ nhân tạo.",
        color: "text-rose-500",
        bg: "bg-rose-50"
    },
    {
        icon: Flame,
        title: "Theo dõi Calo",
        description: "Kiểm soát lượng calo nạp vào hàng ngày với thông tin dinh dưỡng chi tiết.",
        color: "text-orange-500",
        bg: "bg-orange-50"
    },
    {
        icon: Clock,
        title: "Đặt hàng Nhanh chóng",
        description: "Giao diện đơn giản, đặt hàng chỉ trong vài bước với thanh toán tiện lợi.",
        color: "text-amber-500",
        bg: "bg-amber-50"
    },
    {
        icon: Truck,
        title: "Giao hàng Thần tốc",
        description: "Đội ngũ giao hàng chuyên nghiệp, nhanh chóng đảm bảo chất lượng và độ tươi ngon.",
        color: "text-emerald-500",
        bg: "bg-emerald-50"
    }
]

export function Features() {
    return (
        <section className="py-20 bg-gray-50/50">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        Tại sao chọn <span className="text-primary">SmartBite</span>?
                    </h2>
                    <p className="text-gray-500">
                        Chúng tôi kết hợp công nghệ AI tiên tiến với ẩm thực chất lượng, mang lại trải nghiệm ăn uống thông minh và lành mạnh.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                            <div className={`w-12 h-12 ${feature.bg} ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                                <feature.icon className="h-6 w-6" />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
