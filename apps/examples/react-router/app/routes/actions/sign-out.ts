import { signOut } from "~/lib/auth.server"
import type { Route } from "./+types/sign-out"

export async function action({ request }: Route.ActionArgs) {
  return signOut(request)
}
