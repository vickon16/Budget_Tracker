import authConfig from "@/server/auth/auth.config";
import NextAuth from "next-auth";
import { NextResponse } from "next/server";

const { auth: middleware } = NextAuth(authConfig);

export default middleware((req) => {
  const pathname = req.nextUrl.pathname;
  if (!req.auth) {
    if (pathname === "/") {
      return NextResponse.next();
    }
    if (pathname !== "/auth/login") {
      const newUrl = new URL("/auth/login", req.nextUrl.origin);
      return NextResponse.redirect(newUrl);
    }
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
