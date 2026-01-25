// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: req.headers, // 🔥 REQUIRED
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return req.cookies.get(name)?.value
                },
                set(name: string, value: string, options: any) {
                    response.cookies.set({ name, value, ...options })
                },
                remove(name: string, options: any) {
                    response.cookies.set({ name, value: '', ...options })
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const pathname = req.nextUrl.pathname

    // 🚫 Not logged in → block dashboard
    if (pathname.startsWith('/admin/dashboard') && !user) {
        return NextResponse.redirect(new URL('/admin', req.url))
    }

    // ✅ Logged in → skip login
    if (pathname === '/admin' && user) {
        return NextResponse.redirect(new URL('/admin/dashboard', req.url))
    }

    return response
}

export const config = {
    matcher: ['/admin/:path*'],
}
