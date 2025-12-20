import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

const ALLOWED_ORIGIN = "https://trevicio-store.vercel.app";

export default authMiddleware({
  publicRoutes: ["/api/:path*"],

  afterAuth(_, req) {
    // Handle CORS preflight ONLY
    if (req.method === "OPTIONS") {
      const res = new NextResponse(null, { status: 204 });
      addCorsHeaders(res);
      return res;
    }

    // IMPORTANT:
    // Return NOTHING so Clerk continues normal auth behavior
    return;
  },
});

function addCorsHeaders(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.headers.set("Access-Control-Allow-Credentials", "true");
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
