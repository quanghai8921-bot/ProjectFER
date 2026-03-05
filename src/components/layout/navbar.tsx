"use client";

import Link from "next/link"
import Image from "next/image"
import { ShoppingCart, User, ReceiptText, History, LogOut, Sun, Moon, Menu, X } from "lucide-react"
import { useTheme } from "@/components/providers/theme-provider"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Navbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const { theme, toggleTheme } = useTheme();
  const [userName, setUserName] = useState<string>("User");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);


  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  useEffect(() => {

    const checkAuth = async () => {
      let userStr = localStorage.getItem("user");

      if (!userStr) {

        try {
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {

            const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || "User";
            const newUserObj = {
              userid: user.id,
              fullname: name,
              email: user.email,
              role: 'user',
            };
            localStorage.setItem("user", JSON.stringify(newUserObj));
            userStr = JSON.stringify(newUserObj);
          }
        } catch (e) {
          console.error("Lỗi khi fetch Supabase User:", e);
        }
      }

      if (userStr) {
        setIsLoggedIn(true);
        try {
          const user = JSON.parse(userStr);
          const name = user.fullname || user.FullName || user.name || "User";
          setUserName(name);
        } catch (e) {

        }
      } else {
        setIsLoggedIn(false);
      }
    };

    const checkCart = async () => {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          const userId = user.UserId || user.userid || user.id;
          if (userId) {
            const res = await fetch(`/api/cart?userId=${userId}`);
            if (res.ok) {
              const data = await res.json();
              const items = data.items || [];

              const count = items.reduce((sum: number, item: any) => sum + (Number(item.quantity) || 0), 0);

              setCartCount(count);
              return;
            }
          }
        } catch (e) {
          console.error("Lỗi khi fetch giỏ hàng Navbar:", e);
        }
      }
      setCartCount(0);
    };

    const checkActiveOrder = async () => {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          const userId = user.UserId || user.userid || user.id;
          if (userId) {
            const res = await fetch(`/api/orders?userid=${userId}`);
            if (res.ok) {
              const data = await res.json();
              const orders = data.orders || [];

              const activeOrder = orders.find((o: any) => Number(o.orderstatus) < 5);
              if (activeOrder) {
                setActiveOrderId(activeOrder.orderid);
              } else {
                setActiveOrderId(null);
              }
            }
          }
        } catch (e) {
          console.error("Lỗi khi fetch active order Navbar:", e);
        }
      }
    };

    checkAuth();
    checkCart();
    checkActiveOrder();


    window.addEventListener("authChange", checkAuth);
    window.addEventListener("cartUpdate", checkCart);
    window.addEventListener("orderUpdate", checkActiveOrder);

    window.addEventListener("storage", () => {
      checkAuth();
      checkCart();
      checkActiveOrder();
    });

    return () => {
      window.removeEventListener("authChange", checkAuth);
      window.removeEventListener("cartUpdate", checkCart);
      window.removeEventListener("orderUpdate", checkActiveOrder);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Lỗi khi đăng xuất khỏi server:', error);
    }
    localStorage.removeItem("user");
    setIsLoggedIn(false);

    window.dispatchEvent(new Event("authChange"));
    router.push('/');
  };

  return (
    <nav className="border-b dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-50 transition-colors">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-gray-600 dark:text-gray-300 mr-2"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="/images/logo.png"
            alt="SmartBite Logo"
            width={40}
            height={40}
            className="rounded-full object-contain sm:w-14 sm:h-14"
          />
          <span className="text-xl sm:text-2xl font-bold text-primary dark:text-orange-400">SmartBite</span>
        </Link>


        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600 dark:text-gray-300">
          <Link href="/" className="hover:text-primary transition-colors  ">
            Trang chủ
          </Link>
          <Link href="/menu" className="hover:text-primary transition-colors">
            Thực đơn
          </Link>
          <Link href="/ai-advisor" className="hover:text-primary transition-colors">
            Tư vấn AI
          </Link>
        </div>


        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-gray-600 dark:text-gray-300 hover:text-primary transition-colors"
            title={theme === "light" ? "Chuyển sang chế độ tối" : "Chuyển sang chế độ sáng"}
          >
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
          {isLoggedIn && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-600 hover:text-primary relative"
                title="Đơn hàng của tôi"
                onClick={() => {
                  router.push('/profile/history');
                }}
              >
                <ReceiptText className="h-5 w-5" />
                {activeOrderId && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-orange-500 border border-white"></span>
                )}
              </Button>

              <Link href="/cart" className="relative">
                <Button variant="ghost" size="icon" className="text-gray-600 hover:text-primary">
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                      {cartCount}
                    </span>
                  )}
                </Button>
              </Link>
            </>
          )}
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 p-0 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus-visible:ring-0">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 font-bold text-sm">
                    {getInitials(userName)}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 dark:bg-gray-900 dark:border-gray-800" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-gray-900 dark:text-gray-100">{userName}</p>
                    <p className="text-xs leading-none text-gray-500 dark:text-gray-400">Người dùng SmartBite</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer flex items-center">
                    <User className="mr-2 h-4 w-4 text-gray-500" />
                    <span>Hồ sơ cá nhân</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile/history" className="cursor-pointer flex items-center">
                    <History className="mr-2 h-4 w-4 text-gray-500" />
                    <span>Lịch sử & Calo</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 flex items-center">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary hidden sm:inline-flex">
                  Đăng nhập
                </Button>
              </Link>
              <Link href="/auth/register" className="hidden md:inline-flex">
                <Button className="rounded-full px-6 font-semibold">
                  Đăng ký
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {
        isMobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-900 border-b dark:border-gray-800 animate-in slide-in-from-top duration-300">
            <div className="flex flex-col p-4 space-y-4 font-medium text-gray-600 dark:text-gray-300">
              <Link
                href="/"
                className="hover:text-primary p-2 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Trang chủ
              </Link>
              <Link
                href="/menu"
                className="hover:text-primary p-2 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Thực đơn
              </Link>
              <Link
                href="/ai-advisor"
                className="hover:text-primary p-2 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Tư vấn AI
              </Link>
              {!isLoggedIn && (
                <div className="pt-2 flex flex-col gap-2">
                  <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full rounded-xl">Đăng nhập</Button>
                  </Link>
                  <Link href="/auth/register" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full rounded-xl">Đăng ký</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )
      }
    </nav >
  )
}
