"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Navbar } from "@/components/layout/navbar";
import { useTheme } from "@/components/providers/theme-provider";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
    Send,
    Mic,
    Image as ImageIcon,
    Plus,
    MessageSquare,
    Sparkles,
    ThumbsUp,
    ThumbsDown,
    RotateCcw,
    X,
    Paperclip,
    FileText,
    Trash2,
    Search
} from "lucide-react";

type Message = {
    role: "user" | "assistant";
    content: string;
    imageUrl?: string | null;
    fileName?: string | null;
    suggestions?: string[];
};

type ChatSession = {
    id: string;
    title: string;
    messages: Message[];
    updatedAt: number;
};

export default function AIAdvisorPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [feedback, setFeedback] = useState<Record<number, 'helpful' | 'not_helpful' | null>>({});
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const generalFileInputRef = useRef<HTMLInputElement>(null);
    const recognitionRef = useRef<any>(null);
    const originalInputRef = useRef("");
    const [isRecording, setIsRecording] = useState(false);
    const { theme } = useTheme();
    const isDarkMode = theme === "dark";

    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    const filteredSessions = sessions.filter(session =>
        session.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        const saved = localStorage.getItem("smartbite_ai_sessions");
        if (saved) {
            try {
                setSessions(JSON.parse(saved));
            } catch (e) { }
        }
    }, []);


    useEffect(() => {
        if (messages.length === 0 && currentSessionId === null) return;

        setSessions(prev => {
            let newSessions = [...prev];
            let sessionId = currentSessionId;

            if (messages.length === 0 && sessionId !== null) {
                return prev;
            }

            if (!sessionId && messages.length > 0) {
                sessionId = Date.now().toString();
                setCurrentSessionId(sessionId);

                const titleMatch = messages[0].content.slice(0, 30);
                const title = titleMatch + (messages[0].content.length > 30 ? "..." : "");

                newSessions.unshift({
                    id: sessionId,
                    title: title || "Cuộc trò chuyện mới",
                    messages: messages,
                    updatedAt: Date.now()
                });
            } else if (sessionId) {
                const index = newSessions.findIndex(s => s.id === sessionId);
                if (index !== -1) {
                    newSessions[index] = {
                        ...newSessions[index],
                        messages: messages,
                        updatedAt: Date.now()
                    };
                    if (index !== 0) {
                        const session = newSessions.splice(index, 1)[0];
                        newSessions.unshift(session);
                    }
                }
            }

            const sessionsToSave = newSessions.map(s => ({
                ...s,
                messages: s.messages.map(m => ({ ...m, imageUrl: null }))
            }));
            localStorage.setItem("smartbite_ai_sessions", JSON.stringify(sessionsToSave));

            return newSessions;
        });

    }, [messages]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isLoading]);

    const handleSend = async () => {
        if (!input.trim() && !selectedImage && !selectedFile) return;

        const userMessage: Message = {
            role: "user",
            content: input,
            imageUrl: selectedImage,
            fileName: selectedFile?.name
        };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);
        setSelectedImage(null);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        if (generalFileInputRef.current) generalFileInputRef.current.value = "";

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: [...messages, userMessage] }),
            });

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            setMessages((prev) => [...prev, { role: "assistant", content: data.content }]);
        } catch (error: unknown) {
            console.error("Failed to send message:", error);
            const errorMessage = error instanceof Error ? error.message : "Xin lỗi, tôi đã gặp lỗi. Vui lòng thử lại.";
            setMessages((prev) => [...prev, { role: "assistant", content: errorMessage }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegenerate = async (index: number) => {
        if (isLoading) return;
        if (messages[index].role !== "assistant") return;

        const newMessages = messages.slice(0, index);
        setMessages(newMessages);
        setIsLoading(true);

        setFeedback(prev => {
            const newFeedback = { ...prev };
            delete newFeedback[index];
            return newFeedback;
        });

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: newMessages }),
            });

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            setMessages((prev) => [...prev, { role: "assistant", content: data.content }]);
        } catch (error: unknown) {
            console.error("Failed to regenerate message:", error);
            const errorMessage = error instanceof Error ? error.message : "Xin lỗi, tôi đã gặp lỗi khi tạo lại phản hồi. Vui lòng thử lại.";
            setMessages((prev) => [...prev, { role: "assistant", content: errorMessage }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setSelectedImage(url);
        }
    };

    const handleRemoveImage = () => {
        setSelectedImage(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        if (generalFileInputRef.current) generalFileInputRef.current.value = "";
    };

    const toggleRecording = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert("Trình duyệt của bạn không hỗ trợ nhận diện giọng nói.");
            return;
        }

        if (isRecording) {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            setIsRecording(false);
        } else {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'vi-VN';

            originalInputRef.current = input;

            recognition.onstart = () => {
                setIsRecording(true);
            };

            recognition.onresult = (event: any) => {
                let transcript = "";
                for (let i = 0; i < event.results.length; ++i) {
                    transcript += event.results[i][0].transcript;
                }
                const prefix = originalInputRef.current ? originalInputRef.current + " " : "";
                setInput(prefix + transcript);
            };

            recognition.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                setIsRecording(false);
            };

            recognition.onend = () => {
                setIsRecording(false);
            };

            recognitionRef.current = recognition;
            recognition.start();
        }
    };

    const handleFeedback = (index: number, type: 'helpful' | 'not_helpful') => {
        setFeedback(prev => ({
            ...prev,
            [index]: prev[index] === type ? null : type
        }));
    };

    const handleNewChat = () => {
        setCurrentSessionId(null);
        setMessages([]);
        setFeedback({});
    };

    const loadSession = (id: string) => {
        const session = sessions.find(s => s.id === id);
        if (session) {
            setCurrentSessionId(id);
            setMessages(session.messages);
            setFeedback({});
        }
    };

    const deleteSession = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setSessions(prev => {
            const newSessions = prev.filter(s => s.id !== id);
            localStorage.setItem("smartbite_ai_sessions", JSON.stringify(newSessions.map(s => ({
                ...s,
                messages: s.messages.map(m => ({ ...m, imageUrl: null }))
            }))));
            return newSessions;
        });

        if (currentSessionId === id) {
            setCurrentSessionId(null);
            setMessages([]);
        }
    };

    return (
        <div className={isDarkMode ? 'dark' : ''}>
            <div className="h-[100dvh] overflow-hidden bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-300">
                <Navbar />

                <main className="flex-1 flex overflow-hidden">
                    {/* Sidebar */}
                    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 hidden md:flex flex-col p-4 transition-colors">
                        <div className="flex gap-2 mb-6 shrink-0">
                            <Button onClick={handleNewChat} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white gap-2">
                                <Plus className="w-4 h-4" /> Đoạn chat mới
                            </Button>
                        </div>

                        <div className="shrink-0 mb-4">
                            <div className="relative mb-4">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm lịch sử..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-600 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all dark:bg-gray-800"
                                />
                            </div>
                            <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-1 px-2">LỊCH SỬ</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-1 pr-1 pb-4">
                            {sessions.length === 0 ? (
                                <p className="text-sm text-gray-500 dark:text-gray-500 px-3 truncate italic">Chưa có trò chuyện nào</p>
                            ) : filteredSessions.length === 0 ? (
                                <p className="text-sm text-gray-500 dark:text-gray-500 px-3 truncate italic">Không tìm thấy kết quả</p>
                            ) : (
                                filteredSessions.map(session => (
                                    <button
                                        key={session.id}
                                        onClick={() => loadSession(session.id)}
                                        className={`w-full text-left px-3 py-2 text-sm rounded-lg flex items-center justify-between group transition-all duration-200 ${currentSessionId === session.id ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-medium shadow-sm' : 'text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200'}`}>
                                        <div className="flex items-center gap-2 overflow-hidden flex-1">
                                            <MessageSquare className={`w-4 h-4 shrink-0 transition-colors ${currentSessionId === session.id ? 'text-orange-500' : 'text-gray-400 dark:text-gray-500 group-hover:text-orange-400'}`} />
                                            <span className="truncate">{session.title}</span>
                                        </div>
                                        <div
                                            onClick={(e) => deleteSession(e, session.id)}
                                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-orange-100 dark:hover:bg-gray-700 rounded transition-all shrink-0">
                                            <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500 transition-colors" />
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </aside>

                    {/* Chat Area */}
                    <div className="flex-1 flex flex-col bg-white md:bg-[#F9FAFB] dark:bg-gray-950 md:dark:bg-gray-900 transition-colors">

                        {/* Chat Header (Mobile Only) */}
                        <div className="md:hidden p-4 border-b dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between transition-colors">
                            <span className="font-bold text-gray-700 dark:text-gray-100">Trợ lý Dinh dưỡng AI</span>
                            <div className="flex items-center gap-1">
                                <Button size="icon" variant="ghost" className="dark:text-gray-200">
                                    <Plus className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-8">
                            <div className="max-w-4xl mx-auto space-y-6 pr-2 md:pr-4 pb-4">

                                {/* Greeting / Empty State */}
                                {messages.length === 0 && (
                                    <div className="space-y-8 py-8 animate-in fade-in duration-500">
                                        <h1 className="text-3xl font-bold text-gray-300 dark:text-gray-600">
                                            Xin chào! <br />
                                            <span className="text-gray-400 dark:text-gray-500">Hôm nay tôi có thể giúp gì cho bạn?</span>
                                        </h1>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                                            {[
                                                { title: "Món chay giàu protein", desc: "Thực đơn thanh đạm, đủ chất" },
                                                { title: "Thực đơn giảm cân 7 ngày", desc: "Lộ trình ăn uống khoa học" },
                                                { title: "Tính calo ly trà sữa", desc: "Kèm phân tích lượng đường" },
                                                { title: "Phân tích bữa ăn", desc: "Tải ảnh lên để tính calo" }
                                            ].map((card, idx) => (
                                                <div key={idx} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group" onClick={() => setInput(card.title)}>
                                                    <h3 className="font-semibold text-sm md:text-base text-gray-800 dark:text-gray-200 group-hover:text-orange-600 dark:group-hover:text-orange-400">{card.title}</h3>
                                                    <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">{card.desc}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Chat History */}
                                {messages.map((msg, index) => (
                                    <div key={index} className={`flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                        {msg.role === "assistant" && (
                                            <div className="w-8 h-8 rounded-full bg-orange-500 flex flex-col items-center justify-center text-white shrink-0 mt-1 shadow-[0_0_15px_rgba(249,115,22,0.4)]">
                                                <Sparkles className="w-4 h-4" />
                                            </div>
                                        )}

                                        <div className={`max-w-[90%] md:max-w-[80%] rounded-2xl px-5 py-4 ${msg.role === "user"
                                            ? "bg-orange-500 text-white rounded-tr-sm"
                                            : "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm rounded-tl-sm"
                                            }`}>
                                            {msg.imageUrl && (
                                                <div className="mb-3">
                                                    <img src={msg.imageUrl} alt="Attached image" className="max-w-xs w-full sm:max-w-[200px] h-auto rounded-lg border border-white/20 shadow-sm" />
                                                </div>
                                            )}
                                            {msg.fileName && (
                                                <div className="mb-3 inline-flex items-center gap-2 bg-white/10 dark:bg-white/5 border border-white/20 p-2 pr-4 rounded-lg shadow-sm w-fit max-w-full">
                                                    <div className="p-1.5 bg-white/20 rounded-md">
                                                        <FileText className="w-4 h-4 text-white" />
                                                    </div>
                                                    <span className="text-sm font-medium text-white truncate">{msg.fileName}</span>
                                                </div>
                                            )}
                                            <div className={`text-[15px] leading-relaxed ${msg.role === "user" ? "text-white whitespace-pre-wrap" : "text-gray-700 dark:text-gray-300 markdown-content"}`}>
                                                {msg.role === "assistant" ? (
                                                    <ReactMarkdown
                                                        remarkPlugins={[remarkGfm]}
                                                        components={{
                                                            p: ({ node, ...props }) => <p className="mb-4 last:mb-0" {...props} />,
                                                            strong: ({ node, ...props }) => <strong className="font-semibold text-gray-900 dark:text-gray-100" {...props} />,
                                                            ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-5 space-y-2 marker:text-gray-400 dark:marker:text-gray-500" {...props} />,
                                                            ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-5 space-y-2 marker:text-gray-400 dark:marker:text-gray-500" {...props} />,
                                                            li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                                                            h1: ({ node, ...props }) => <h1 className="text-xl font-bold mt-6 mb-4 text-gray-900 dark:text-gray-100" {...props} />,
                                                            h2: ({ node, ...props }) => <h2 className="text-lg font-bold mt-5 mb-3 text-gray-900 dark:text-gray-100" {...props} />,
                                                            h3: ({ node, ...props }) => <h3 className="text-base font-bold mt-4 mb-2 text-gray-900 dark:text-gray-100" {...props} />,
                                                        }}
                                                    >
                                                        {msg.content}
                                                    </ReactMarkdown>
                                                ) : (
                                                    <p>{msg.content}</p>
                                                )}
                                            </div>

                                            {/* Interaction Buttons for AI Response */}
                                            {msg.role === "assistant" && (
                                                <div className="flex items-center gap-2 mt-4 pt-2 border-t border-gray-50 dark:border-gray-700/50">
                                                    <button
                                                        onClick={() => handleFeedback(index, 'helpful')}
                                                        className={`group overflow-hidden flex items-center gap-1.5 text-xs px-2 py-1 rounded-md transition-all active:scale-95 ${feedback[index] === 'helpful' ? 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400' : 'text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20'}`}>
                                                        <div className="flex items-center gap-1 z-10 bg-inherit rounded-full">
                                                            <ThumbsUp className={`w-3.5 h-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-110 group-active:scale-90 ${feedback[index] === 'helpful' ? 'fill-current' : ''}`} />
                                                            {feedback[index] === 'helpful' && <span className="font-semibold">1</span>}
                                                        </div>
                                                        <span className="inline-block transition-transform duration-300 origin-left group-hover:scale-105 group-hover:translate-x-0.5 group-hover:font-medium">Hữu ích</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleFeedback(index, 'not_helpful')}
                                                        className={`group overflow-hidden flex items-center gap-1.5 text-xs px-2 py-1 rounded-md transition-all active:scale-95 ${feedback[index] === 'not_helpful' ? 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400' : 'text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'}`}>
                                                        <div className="flex items-center gap-1 z-10 bg-inherit rounded-full">
                                                            <ThumbsDown className={`w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-y-0.5 group-hover:scale-110 group-active:scale-90 ${feedback[index] === 'not_helpful' ? 'fill-current' : ''}`} />
                                                            {feedback[index] === 'not_helpful' && <span className="font-semibold">1</span>}
                                                        </div>
                                                        <span className="inline-block transition-transform duration-300 origin-left group-hover:scale-105 group-hover:translate-x-0.5 group-hover:font-medium">Không hữu ích</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleRegenerate(index)}
                                                        disabled={isLoading}
                                                        className="group overflow-hidden flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 active:scale-95 transition-all px-2 py-1 rounded-md ml-auto disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                                                        <div className="flex items-center gap-1 z-10 bg-inherit rounded-full">
                                                            <RotateCcw className={`w-3.5 h-3.5 transition-transform duration-500 ${isLoading ? '' : 'group-hover:-rotate-180 group-hover:scale-110 group-active:-rotate-90'}`} />
                                                        </div>
                                                        <span className="inline-block transition-transform duration-300 origin-left group-hover:scale-105 group-hover:translate-x-0.5 group-hover:font-medium">Tạo lại phản hồi</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {msg.role === "user" && (
                                            <Avatar className="w-8 h-8 mt-1 border-2 border-white dark:border-transparent shadow-sm">
                                                <AvatarImage src="/avatar-user.png" />
                                                <AvatarFallback className="bg-blue-100 text-blue-600 text-xs font-bold">Tôi</AvatarFallback>
                                            </Avatar>
                                        )}
                                    </div>
                                ))}

                                {isLoading && (
                                    <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white shrink-0 shadow-[0_0_15px_rgba(249,115,22,0.4)]">
                                            <Sparkles className="w-4 h-4 animate-pulse relative z-10" />
                                        </div>
                                        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm rounded-2xl rounded-tl-sm p-4 w-24 flex items-center justify-center gap-1">
                                            <span className="w-2 h-2 bg-orange-300 dark:bg-orange-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                            <span className="w-2 h-2 bg-orange-400 dark:bg-orange-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                            <span className="w-2 h-2 bg-orange-500 dark:bg-orange-400 rounded-full animate-bounce"></span>
                                        </div>
                                    </div>
                                )}

                                <div ref={scrollRef} />
                            </div>
                        </div>

                        {/* Input Area */}
                        <div className="p-4 md:p-6 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 transition-colors">
                            <div className="max-w-4xl mx-auto">
                                {/* Quick Actions */}
                                {messages.length > 0 && !isLoading && (
                                    <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar mask-gradient">
                                        {["Món chay giàu protein", "Lên thực đơn giảm cân 7 ngày", "Tính calo ly trà sữa"].map((chip) => (
                                            <button
                                                key={chip}
                                                onClick={() => {
                                                    setInput(chip);
                                                }}
                                                className="whitespace-nowrap px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-orange-600 dark:hover:text-orange-400 hover:scale-[1.02] active:scale-95 text-gray-600 dark:text-gray-300 text-sm rounded-full transition-all shadow-sm"
                                            >
                                                {chip}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                <div className="flex flex-wrap gap-3">
                                    {selectedImage && (
                                        <div className="mb-3 relative inline-block animate-in fade-in zoom-in duration-200">
                                            <img src={selectedImage} alt="Selected" className="h-20 w-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm" />
                                            <button
                                                onClick={handleRemoveImage}
                                                className="absolute -top-2 -right-2 bg-white dark:bg-gray-800 rounded-full p-1 shadow-md border border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    )}

                                    {selectedFile && (
                                        <div className="mb-3 relative inline-flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2 pr-8 rounded-lg shadow-sm animate-in fade-in zoom-in duration-200 max-w-sm">
                                            <div className="p-2 bg-white dark:bg-gray-900 rounded-md border border-gray-100 dark:border-gray-700">
                                                <FileText className="w-5 h-5 text-blue-500" />
                                            </div>
                                            <div className="flex flex-col truncate">
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">{selectedFile.name}</span>
                                                <span className="text-xs text-gray-400 dark:text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</span>
                                            </div>
                                            <button
                                                onClick={handleRemoveFile}
                                                className="absolute -top-2 -right-2 bg-white dark:bg-gray-800 rounded-full p-1 shadow-md border border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="relative flex items-end gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-2 focus-within:ring-2 focus-within:ring-orange-100 dark:focus-within:ring-orange-900/30 focus-within:border-orange-300 dark:focus-within:border-orange-500/50 transition-all">
                                    <input type="file" className="hidden" ref={generalFileInputRef} onChange={handleFileSelect} />
                                    <Button
                                        onClick={() => generalFileInputRef.current?.click()}
                                        size="icon"
                                        variant="ghost"
                                        className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full h-10 w-10 shrink-0 transition-colors"
                                    >
                                        <Paperclip className="w-5 h-5" />
                                    </Button>

                                    <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageSelect} />
                                    <Button
                                        onClick={() => fileInputRef.current?.click()}
                                        size="icon"
                                        variant="ghost"
                                        className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full h-10 w-10 shrink-0 transition-colors -ml-1"
                                    >
                                        <ImageIcon className="w-5 h-5" />
                                    </Button>
                                    <textarea
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder={isRecording ? "Đang nghe..." : "Hỏi về thực đơn, lượng calo, công thức nấu ăn..."}
                                        className={`flex-1 bg-transparent border-none focus:ring-0 focus:outline-none outline-none resize-none max-h-32 py-2.5 text-gray-700 dark:text-gray-200 ${isRecording ? 'placeholder:text-red-400' : 'placeholder:text-gray-400 dark:placeholder:text-gray-500'}`}
                                        rows={1}
                                        style={{ height: 'auto', minHeight: '44px' }}
                                    />
                                    <Button
                                        onClick={toggleRecording}
                                        size="icon"
                                        variant="ghost"
                                        className={`rounded-full h-10 w-10 shrink-0 transition-all ${isRecording ? 'text-orange-500 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/40 animate-pulse' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                                    >
                                        <Mic className={`w-5 h-5 ${isRecording ? 'scale-110' : ''}`} />
                                    </Button>
                                    <Button
                                        onClick={handleSend}
                                        disabled={(!input.trim() && !selectedImage && !selectedFile) || isLoading}
                                        size="icon"
                                        className={`rounded-full h-10 w-10 shrink-0 transition-all duration-300 ease-out ${input.trim() || selectedImage || selectedFile
                                            ? "bg-orange-500 hover:bg-orange-600 text-white shadow-[0_4px_14px_0_rgba(249,115,22,0.39)] hover:shadow-[0_6px_20px_rgba(249,115,22,0.23)] hover:-translate-y-0.5"
                                            : "bg-transparent dark:bg-transparent text-gray-400 dark:text-gray-600"
                                            }`}
                                    >
                                        <Send className="w-5 h-5 ml-0.5" />
                                    </Button>
                                </div>
                                <div className="text-center mt-3">
                                    <p className="text-[11px] text-gray-500 dark:text-gray-400">SmartBite AI có thể hiển thị thông tin không chính xác, vui lòng kiểm tra lại các thông số dinh dưỡng quan trọng.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}