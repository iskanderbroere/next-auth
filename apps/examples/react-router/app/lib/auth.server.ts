import ReactRouterAuth, { type ReactRouterAuthConfig } from "@auth/react-router"
import Keycloak from "@auth/react-router/providers/keycloak"
import { UnstorageAdapter } from "@auth/unstorage-adapter"
import { createStorage } from "unstorage"
import memoryDriver from "unstorage/drivers/memory"

const storage = createStorage({
  driver: memoryDriver(),
})

const config: ReactRouterAuthConfig = {
  providers: [Keycloak],
  adapter: UnstorageAdapter(storage),
}

export const { auth, handlers, signIn, signOut } = ReactRouterAuth(config)
