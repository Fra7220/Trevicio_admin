import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

const ALLOWED_ORIGIN = "https://trevicio-store.vercel.app";

export default authMiddleware({
  publicRoutes: ["/api/:path*"],

  async afterAuth(auth, req) {
    // Handle preflight
    if (req.method === "OPTIONS") {
      const res = new NextResponse(null, { status: 204 });
      setCorsHeaders(res);
      return res;
    }

    const res = NextResponse.next();
    setCorsHeaders(res);
    return res;
  },
});

function setCorsHeaders(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.headers.set("Access-Control-Allow-Credentials", "true");
}

export const config = {
  matcher: ["/api/:path*"],
};
