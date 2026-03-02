"use client";

import { useState, useRef, useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Send,
    Mic,
    Image as ImageIcon,
    Plus,
    MessageSquare,
    Sparkles,
    ThumbsUp,
    ThumbsDown,
    RotateCcw
} from "lucide-react";

type Message = {
    role: "user" | "assistant";
    content: string;
    suggestions?: any[]; // Store structured data like dishes here if needed
};

export default function AIAdvisorPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isLoading]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage: Message = { role: "user", content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: [...messages, userMessage] }),
            });

            const data = await response.json();

            if (data.error) {
                const errorMessage = data.details
                    ? `Lỗi: ${data.error}\n\nChi tiết: ${data.details.substring(0, 100)}...`
                    : `Lỗi: ${data.error}`;
                setMessages((prev) => [...prev, { role: "assistant", content: errorMessage }]);
                setIsLoading(false);
                return;
            }

            setMessages((prev) => [...prev, { role: "assistant", content: data.content }]);
        } catch (error) {
            console.error("Failed to send message:", error);
            setMessages((prev) => [...prev, { role: "assistant", content: "Xin lỗi, tôi đã gặp lỗi không xác định. Vui lòng thử lại." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <main className="flex-1 flex overflow-hidden h-[calc(100vh-64px)]">
                {/* Sidebar */}
                <aside className="w-64 bg-white border-r border-gray-100 hidden md:flex flex-col p-4">
                    <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white gap-2 mb-6">
                        <Plus className="w-4 h-4" /> Cuộc trò chuyện mới
                    </Button>

                    <div className="flex-1 overflow-y-auto space-y-6">
                        <div>
                            <h3 className="text-xs font-semibold text-gray-400 mb-3 px-2">HÔM NAY</h3>
                            <div className="space-y-1">
                                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-orange-50 rounded-lg flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 text-orange-400" />
                                    <span className="truncate">Gợi ý bữa ăn dưới 400 calo</span>
                                </button>
                                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 text-gray-400" />
                                    <span className="truncate">Lợi ích của gạo lứt</span>
                                </button>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-semibold text-gray-400 mb-3 px-2">7 NGÀY TRƯỚC</h3>
                            <div className="space-y-1">
                                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 text-gray-400" />
                                    <span className="truncate">Thực đơn ăn sạch (Eat clean)</span>
                                </button>
                                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 text-gray-400" />
                                    <span className="truncate">Món chay giàu protein</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col bg-white md:bg-[#F9FAFB]">

                    {/* Chat Header (Mobile Only) */}
                    <div className="md:hidden p-4 border-b bg-white flex items-center justify-between">
                        <span className="font-bold text-gray-700">Trợ lý Dinh dưỡng AI</span>
                        <Button size="icon" variant="ghost">
                            <Plus className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-8">
                        <div className="max-w-4xl mx-auto space-y-6">

                            {/* Greeting / Empty State */}
                            {messages.length === 0 && (
                                <div className="space-y-8 py-8 animate-in fade-in duration-500">
                                    <h1 className="text-3xl font-bold text-gray-300">
                                        Xin chào! <br />
                                        <span className="text-gray-400">Tôi có thể giúp gì cho bạn hôm nay?</span>
                                    </h1>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        {[
                                            { title: "Gợi ý bữa trưa nhanh", desc: "Dưới 500 calo, giàu đạm" },
                                            { title: "Bữa ăn sau tập luyện", desc: "Cần năng lượng phục hồi" },
                                            { title: "Tìm món chay ngon", desc: "Không gluten, nhiều rau" },
                                            { title: "Phân tích bữa ăn", desc: "Tải ảnh lên để tính calo" }
                                        ].map((card, idx) => (
                                            <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 hover:border-orange-200 hover:shadow-md transition-all cursor-pointer group" onClick={() => setInput(card.title)}>
                                                <h3 className="font-semibold text-gray-800 group-hover:text-orange-600">{card.title}</h3>
                                                <p className="text-sm text-gray-500">{card.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Chat History */}
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                    {msg.role === "assistant" && (
                                        <div className="w-8 h-8 rounded-full bg-orange-500 flex flex-col items-center justify-center text-white shrink-0 mt-1">
                                            <Sparkles className="w-4 h-4" />
                                        </div>
                                    )}

                                    <div className={`max-w-[80%] rounded-2xl p-4 ${msg.role === "user"
                                        ? "bg-orange-500 text-white rounded-tr-sm"
                                        : "bg-white border border-gray-100 shadow-sm rounded-tl-sm"
                                        }`}>
                                        <p className={`whitespace-pre-wrap leading-relaxed ${msg.role === "user" ? "text-white" : "text-gray-700"}`}>
                                            {msg.content}
                                        </p>

                                        {/* Interaction Buttons for AI Response */}
                                        {msg.role === "assistant" && (
                                            <div className="flex items-center gap-3 mt-4 pt-2 border-t border-gray-50">
                                                <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600">
                                                    <ThumbsUp className="w-3 h-3" /> Hữu ích
                                                </button>
                                                <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600">
                                                    <ThumbsDown className="w-3 h-3" /> Không hữu ích
                                                </button>
                                                <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-orange-500 ml-auto">
                                                    <RotateCcw className="w-3 h-3" /> Tạo lại
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {msg.role === "user" && (
                                        <Avatar className="w-8 h-8 mt-1 border-2 border-white shadow-sm">
                                            <AvatarImage src="/avatar-user.png" />
                                            <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">Me</AvatarFallback>
                                        </Avatar>
                                    )}
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white shrink-0">
                                        <Sparkles className="w-4 h-4" />
                                    </div>
                                    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-sm p-4 w-24 flex items-center justify-center gap-1">
                                        <span className="w-2 h-2 bg-orange-300 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="w-2 h-2 bg-orange-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></span>
                                    </div>
                                </div>
                            )}

                            <div ref={scrollRef} />
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="p-4 md:p-6 bg-white border-t border-gray-100">
                        <div className="max-w-4xl mx-auto">
                            {/* Quick Actions (Suggestion chips) */}
                            {messages.length > 0 && !isLoading && (
                                <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar mask-gradient">
                                    {["Thêm nhiều rau", "Lựa chọn rẻ hơn", "Không cay"].map((chip) => (
                                        <button
                                            key={chip}
                                            onClick={() => {
                                                const newMsg = chip;
                                                setInput(newMsg);
                                                // Ideally send immediately, but for now just populate input
                                            }}
                                            className="whitespace-nowrap px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm rounded-full transition-colors"
                                        >
                                            {chip}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className="relative flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-3xl p-2 focus-within:ring-2 focus-within:ring-orange-100 focus-within:border-orange-300 transition-all">
                                <Button size="icon" variant="ghost" className="text-gray-400 hover:text-gray-600 rounded-full h-10 w-10 shrink-0">
                                    <ImageIcon className="w-5 h-5" />
                                </Button>
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Hỏi SmartBite về dinh dưỡng hoặc gọi món..."
                                    className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-32 py-2.5 text-gray-700 placeholder:text-gray-400"
                                    rows={1}
                                    style={{ height: 'auto', minHeight: '44px' }}
                                />
                                <Button size="icon" variant="ghost" className="text-gray-400 hover:text-gray-600 rounded-full h-10 w-10 shrink-0">
                                    <Mic className="w-5 h-5" />
                                </Button>
                                <Button
                                    onClick={handleSend}
                                    disabled={!input.trim() || isLoading}
                                    size="icon"
                                    className={`rounded-full h-10 w-10 shrink-0 transition-all ${input.trim()
                                        ? "bg-orange-500 hover:bg-orange-600 text-white shadow-md"
                                        : "bg-gray-200 text-gray-400"
                                        }`}
                                >
                                    <Send className="w-4 h-4 ml-0.5" />
                                </Button>
                            </div>
                            <div className="text-center mt-2">
                                <p className="text-[10px] text-gray-400">SmartBite AI có thể hiển thị thông tin chưa chính xác, vui lòng kiểm tra lại các sự thật dinh dưỡng quan trọng.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
