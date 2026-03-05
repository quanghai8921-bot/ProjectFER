import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Star, Utensils } from "lucide-react"

export function Hero() {
    return (
        <section className="bg-primary dark:bg-gray-950 pt-12 pb-24 md:pt-20 md:pb-32 overflow-hidden relative transition-colors duration-300">


            <div className="container mx-auto px-4 md:px-6">
                <div className="grid md:grid-cols-2 gap-12 items-center">


                    <div className="space-y-8 relative z-10">

                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-full text-sm font-medium">
                            <Sparkles className="h-4 w-4" />
                            <span>Tư vấn Dinh dưỡng AI Thông minh</span>
                        </div>


                        <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight">
                            Ăn ngon, sống khỏe <br />
                            <span className="text-white/90">cùng SmartBite</span>
                        </h1>


                        <p className="text-lg text-white/80 max-w-lg">
                            Khám phá thực đơn đa dạng, theo dõi calo và nhận tư vấn dinh dưỡng từ AI - tất cả trong một ứng dụng.
                        </p>


                        <div className="flex flex-wrap gap-4">
                            <Link href="/menu">
                                <Button size="lg" className="bg-white dark:bg-gray-800 text-primary dark:text-orange-500 hover:bg-white/90 dark:hover:bg-gray-700 rounded-full h-12 px-8 font-semibold transition-all">
                                    <Utensils className="mr-2 h-5 w-5" />
                                    Xem Thực đơn
                                </Button>
                            </Link>
                            <Link href="/ai-advisor">
                                <Button size="lg" variant="outline" className="bg-white/10 dark:bg-gray-800/40 text-white border-white/20 hover:bg-white/20 rounded-full h-12 px-8 font-semibold transition-all">
                                    <Sparkles className="mr-2 h-5 w-5" />
                                    Tư vấn AI
                                </Button>
                            </Link>

                            <a href="/profile">
                                <Button size="lg" variant="outline" className="bg-white/10 dark:bg-gray-800/40 text-white border-white/20 hover:bg-white/20 rounded-full h-12 px-8 font-semibold transition-all">
                                    <span className="mr-2 not-italic">👤</span>
                                    Hồ sơ của tôi
                                </Button>
                            </a>
                        </div>


                        <div className="flex gap-12 pt-4">
                            <div>
                                <div className="text-3xl font-bold text-white">50+</div>
                                <div className="text-sm text-white/70">Món ăn</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-white">1,500+</div>
                                <div className="text-sm text-white/70">Khách hàng</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-white flex items-center gap-1">
                                    4.9 <Star className="h-4 w-4 fill-white" />
                                </div>
                                <div className="text-sm text-white/70">Đánh giá</div>
                            </div>
                        </div>
                    </div>


                    <div className="relative flex justify-center items-center h-full min-h-[400px]">

                        <div className="absolute inset-[-20px] bg-gradient-to-tr from-[#FF5733]/30 to-orange-400/30 blur-3xl rounded-[3rem] animate-[pulse_4s_cubic-bezier(0.4,0,0.6,1)_infinite] z-0" />


                        <div className="relative w-full max-w-[550px] aspect-[4/3] rounded-[2rem] overflow-hidden border-[8px] border-white shadow-[0_0_80px_rgba(255,87,51,0.5)] z-10 transition-all duration-700 ease-out hover:scale-105 hover:shadow-[0_0_120px_rgba(255,87,51,0.8)] hover:-translate-y-2 cursor-pointer group">
                            <Image
                                src="/images/hero-image.jpg"
                                alt="SmartBite Healthy Food"
                                fill
                                className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                                priority
                            />


                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}
