import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Lấy thông tin user để làm mới session nếu cần
    const { data: { user } } = await supabase.auth.getUser()

    const adminToken = request.cookies.get('admin_token')?.value
    const isApiRoute = request.nextUrl.pathname.startsWith('/api')
    const isAuthRoute = request.nextUrl.pathname.startsWith('/auth')
    const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')

    // 1. Bảo vệ trang Admin (Chặn khách thường vào trang admin)
    if (isAdminRoute && !adminToken) {
        return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // 2. Chặn admin vào các trang dành cho khách hàng
    if (adminToken && !isAdminRoute && !isApiRoute && !isAuthRoute) {
        return NextResponse.redirect(new URL('/admin', request.url))
    }

    // 3. Chặn user đã login vào lại trang login/register
    if (user && isAuthRoute && !request.nextUrl.pathname.includes('logout')) {
        return NextResponse.redirect(new URL(adminToken ? '/admin' : '/', request.url))
    }

    return supabaseResponse
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}