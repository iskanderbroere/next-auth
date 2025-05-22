import { type RouteConfig, route } from "@react-router/dev/routes"

export default [route("auth/*", "routes/auth.ts")] satisfies RouteConfig
