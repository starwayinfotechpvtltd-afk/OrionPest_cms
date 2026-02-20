// import { NextResponse } from "next/server";

// export function middleware(request) {
//   // Handle preflight
//   if (request.method === "OPTIONS") {
//     return new NextResponse(null, {
//       status: 200,
//       headers: {
//         "Access-Control-Allow-Origin": "*",
//         "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
//         "Access-Control-Allow-Headers": "Content-Type, Authorization",
//       },
//     });
//   }

//   const response = NextResponse.next();

//   response.headers.set("Access-Control-Allow-Origin", "*");
//   response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
//   response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

//   return response;
// }

// export const config = {
//   matcher: "/api/:path*",
// };





// import { NextResponse } from "next/server";
// import { verifyToken } from "@/lib/auth";

// const protectedRoutes = ["/dashboard"];
// const publicOnlyRoutes = ["/login", "/register"];

// export function middleware(request) {
//   const { pathname } = request.nextUrl;

//   if (request.method === "OPTIONS") {
//     return new NextResponse(null, {
//       status: 200,
//       headers: {
//         "Access-Control-Allow-Origin": "*",
//         "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
//         "Access-Control-Allow-Headers": "Content-Type, Authorization",
//       },
//     });
//   }

//   if (pathname.startsWith("/api")) {
//     const response = NextResponse.next();
//     response.headers.set("Access-Control-Allow-Origin", "*");
//     response.headers.set("Access-Control-Allow-Methods","GET, POST, PUT, PATCH, DELETE, OPTIONS");
//     response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
//     return response;
//   }

//   const token = request.cookies.get("token")?.value;


//   const decoded = token ? verifyToken(token) : null;

//   const isLoggedIn = !!decoded;

//   const isPublicOnly = publicOnlyRoutes.some((r) => pathname.startsWith(r));
//   if (isPublicOnly && isLoggedIn) {
//     return NextResponse.redirect(new URL("/dashboard", request.url));
//   }

//   const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));
//   if (isProtected && !isLoggedIn) {
//     const loginUrl = new URL("/login", request.url);
//     loginUrl.searchParams.set("next", pathname);
//     return NextResponse.redirect(loginUrl);
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     "/api/:path*",
//     "/dashboard/:path*",
//     "/login",   
//     "/register",   
//   ],
// };





import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

const protectedRoutes = ["/dashboard"];
const publicOnlyRoutes = ["/login", "/register"];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  // CORS all API routes
  if (pathname.startsWith("/api")) {
    const response = NextResponse.next();
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return response;
  }

  // AUTH verify token
  const token = request.cookies.get("token")?.value;
  const decoded = token ? await verifyToken(token) : null;
  const isLoggedIn = !!decoded;

  console.log("Middleware hit:", pathname);
  console.log("Token found:", !!token);
  console.log("Decoded:", decoded);

  const isPublicOnly = publicOnlyRoutes.some((r) => pathname.startsWith(r));
  if (isPublicOnly && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));
  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*", "/dashboard/:path*", "/login", "/register"],
};
