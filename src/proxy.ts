export { auth as proxy } from "@/auth";

export const config = {
  matcher: ["/cabinet/:path*", "/admin/:path*", "/doctor/:path*"],
};
