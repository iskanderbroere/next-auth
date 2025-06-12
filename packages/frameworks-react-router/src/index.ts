/**
 *
 * :::warning
 * `@auth/react-router` is currently experimental. The API _will_ change in the future.
 * :::
 *
 * React Router Auth is the official React Router integration for Auth.js.
 * It provides a simple way to add authentication to your React Router app in a few lines of code.
 *
 * ## Installation
 *
 * ```bash npm2yarn
 * npm install @auth/react-router
 * ```
 *
 * ## Usage
 *
 * ```ts title="app/lib/auth.server.ts"
 * import NextAuth from "@auth/react-router"
 * import GitHub from "@auth/react-router/providers/github"
 * export const { auth, handlers } = ReactRouterAuth({ providers: [ GitHub ] })
 * ```
 *
 * @module @auth/react-router
 */

import { Auth, customFetch, setEnvDefaults } from "@auth/core"
import type { ProviderId } from "@auth/core/providers"
import type { Awaitable, Session } from "@auth/core/types"
import { type ActionFunction, type LoaderFunction } from "react-router"
export { AuthError, CredentialsSignin } from "@auth/core/errors"

import { signIn, signOut } from "./lib/actions.js"
import { reqWithEnvURL } from "./lib/env.js"
import { initAuth, ReactRouterAuthConfig } from "./lib/index.js"

export { customFetch }

// Re-export types of Auth.js
export type {
  Account,
  DefaultSession,
  Profile,
  Session,
  User,
} from "@auth/core/types"

export type { ReactRouterAuthConfig }

/**
 * The result of invoking {@link ReactRouterAuth|ReactRouterAuth}, initialized with the {@link ReactRouterAuthConfig}.
 * It contains methods to set up and interact with Auth.js in your React Router app.
 */
export interface ReactRouterAuthResult {
  /**
   * The ReactRouterAuth [action](https://reactrouter.com/start/framework/actions) and [loader](https://reactrouter.com/start/framework/data-loading) handlers. These are used to expose an endpoint for OAuth/Email providers,
   * as well as REST API endpoints (such as `/api/auth/session`) that can be contacted from the client.
   *
   * After initializing ReactRouterAuth in `auth.ts`,
   * re-export these methods.
   *
   * ```ts title="app/routes.ts"
   * export default [
   *  route("auth/*", "routes/auth.ts"),
   *] satisfies RouteConfig
   * ```
   *
   * ```ts title="app/routes/auth.ts"
   * import { handlers } from "~/lib/auth.server"
   * export const action = handlers.action
   * export const loader = handlers.loader
   * ```
   *
   * ```ts title="app/lib/auth.server.ts"
   * export const { handlers } = ReactRouterAuth({...})
   * ```
   */
  handlers: {
    action: ActionFunction
    loader: LoaderFunction
  }
  /**
   * A universal method to interact with Auth.js in your React Router app.
   * After initializing ReactRouterAuth.js in `auth.ts`, use this method in route loaders.
   *
   * @example
   * ```ts title="app/root.tsx"
   * import { auth } from "~/lib/auth.server"
   *
   * export async function loader({ request }: Route.LoaderArgs) {
   *   const session = await auth(request);
   *   return session;
   * }
   * ```
   */
  auth: (request: Request) => Promise<Session | null>

  /**
   * Sign in with a provider. If no provider is specified, the user will be redirected to the sign in page.
   *
   * By default, the user is redirected to the current page after signing in. You can override this behavior by setting the `redirectTo` option with a relative path.
   *
   * @example
   * ```ts title="app/layout.tsx"
   * import { signIn } from "../auth"
   *
   * export default function Layout() {
   *  return (
   *   <form action={async () => {
   *     "use server"
   *     await signIn("github")
   *   }}>
   *    <button>Sign in with GitHub</button>
   *   </form>
   * )
   * ```
   *
   * If an error occurs during signin, an instance of {@link AuthError} will be thrown. You can catch it like this:
   * ```ts title="app/layout.tsx"
   * import { AuthError } from "next-auth"
   * import { signIn } from "../auth"
   *
   * export default function Layout() {
   *  return (
   *    <form action={async (formData) => {
   *      "use server"
   *      try {
   *        await signIn("credentials", formData)
   *     } catch(error) {
   *       if (error instanceof AuthError) // Handle auth errors
   *       throw error // Rethrow all other errors
   *     }
   *    }}>
   *     <button>Sign in</button>
   *   </form>
   *  )
   * }
   * ```
   *
   */
  signIn: <P extends ProviderId>(
    request: Request,
    /** Provider to sign in to */
    provider?: P, // See: https://github.com/microsoft/TypeScript/issues/29729
    options?: {
      /** The relative path to redirect to after signing in. By default, the user is redirected to the current page. */
      redirectTo?: string
    },
    authorizationParams?:
      | string[][]
      | Record<string, string>
      | string
      | URLSearchParams
  ) => Promise<Response>
  /**
   * Sign out the user. If the session was created using a database strategy, the session will be removed from the database and the related cookie is invalidated.
   * If the session was created using a JWT, the cookie is invalidated.
   *
   * By default the user is redirected to the current page after signing out. You can override this behavior by setting the `redirectTo` option with a relative path.
   *
   * @example
   * ```ts title="app/layout.tsx"
   * import { signOut } from "../auth"
   *
   * export default function Layout() {
   *  return (
   *   <form action={async () => {
   *     "use server"
   *     await signOut()
   *   }}>
   *    <button>Sign out</button>
   *   </form>
   * )
   * ```
   *
   *
   */
  signOut: (
    request: Request,
    options?: {
      /** The relative path to redirect to after signing out. By default, the user is redirected to the current page. */
      redirectTo?: string
    }
  ) => Promise<Response>
}

/**
 *  Initialize ReactRouterAuth.js.
 *
 *  @example
 * ```ts title="auth.ts"
 * import ReactRouterAuth from "@auth/react-router"
 * import GitHub from "@auth/core/providers/github"
 *
 * export const { handlers, auth } = ReactRouterAuth({ providers: [GitHub] })
 * ```
 *
 * Lazy initialization:
 *
 * @example
 * ```ts title="auth.ts"
 * import ReactRouterAuth from "@auth/react-router"
 * import GitHub from "@auth/core/providers/github"
 *
 * export const { handlers, auth } = ReactRouterAuth(async (req) => {
 *   console.log(req) // do something with the request
 *   return {
 *     providers: [GitHub],
 *   },
 * })
 * ```
 */
export default function ReactRouterAuth(
  config:
    | ReactRouterAuthConfig
    | ((request: Request | undefined) => Awaitable<ReactRouterAuthConfig>)
): ReactRouterAuthResult {
  if (typeof config === "function") {
    const httpHandler = async (request: Request) => {
      const _config = await config(request)
      setEnvDefaults(process.env, _config)
      return Auth(reqWithEnvURL(request), _config)
    }

    const loader: LoaderFunction = async ({ request }) => {
      return await httpHandler(request)
    }

    const action: ActionFunction = async ({ request }) => {
      return await httpHandler(request)
    }

    return {
      handlers: {
        action,
        loader,
      } as const,
      auth: initAuth(config, (c) => setEnvDefaults(process.env, c)),
      signIn: async (request, provider, options, authorizationParams) => {
        const _config = await config(undefined)
        setEnvDefaults(process.env, _config)
        return signIn(request, provider, options, authorizationParams, _config)
      },
      signOut: async (request, options) => {
        const _config = await config(undefined)
        setEnvDefaults(process.env, _config)
        return signOut(request, options, _config)
      },
    }
  }
  setEnvDefaults(process.env, config)

  const httpHandler = (request: Request) => {
    return Auth(reqWithEnvURL(request), config)
  }

  const loader: LoaderFunction = async ({ request }) => {
    return await httpHandler(request)
  }

  const action: ActionFunction = async ({ request }) => {
    return await httpHandler(request)
  }

  return {
    handlers: {
      action,
      loader,
    } as const,
    auth: initAuth(config),
    signIn: (request, provider, options, authorizationParams) => {
      return signIn(request, provider, options, authorizationParams, config)
    },
    signOut: (request, options) => {
      return signOut(request, options, config)
    },
  }
}
