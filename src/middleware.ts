import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const path = req.nextUrl.pathname;

        if (path.startsWith("/dashboard/owner") && token?.role !== "OWNER") {
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }

        if (path.startsWith("/dashboard/super") && token?.role !== "SUPER" && token?.role !== "OWNER") {
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }

        // Crew can access their dashboard, but maybe restrict others?
        // For now, assume basic role checks are sufficient.
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
);

export const config = {
    matcher: ["/dashboard/:path*"],
};
