
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

// Define protected routes
const protectedRoutes = ['/dashboard', '/room'];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if the current route is protected
    const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

    if (isProtected) {
        const token = request.cookies.get('token')?.value;

        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        const payload = await verifyToken(token);

        if (!payload) {
            // Token is invalid or expired
            return NextResponse.redirect(new URL('/login', request.url));
        }

        // Clone the request headers and add the user ID
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-user-id', payload.userId as string);

        // Continue with the modified headers
        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/room/:path*'],
};
