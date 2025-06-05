import {
  type RouteConfig,
  index,
  prefix,
  route,
} from "@react-router/dev/routes"

export default [
  index("routes/home.tsx"),
  route("auth/*", "routes/auth.ts"),
  ...prefix("actions", [
    route("sign-in", "routes/actions/sign-in.ts"),
    route("sign-out", "routes/actions/sign-out.ts"),
  ]),
] satisfies RouteConfig
