import { signIn } from "~/lib/auth.server"
import type { Route } from "./+types/sign-in"

export async function action({ request }: Route.ActionArgs) {
  return signIn(request)
}
