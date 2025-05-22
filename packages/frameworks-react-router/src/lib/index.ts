import type { AuthConfig, Awaitable, Session } from "@auth/core/types"
import { ReactRouterAuthResult } from "../index.js"
import { Auth, createActionURL } from "@auth/core"

/** Configure ReactRouterAuth.js. */
export interface ReactRouterAuthConfig extends Omit<AuthConfig, "raw"> {}

export function initAuth(
  config:
    | ReactRouterAuthConfig
    | ((request: Request | undefined) => Awaitable<ReactRouterAuthConfig>),
  onLazyLoad?: (config: ReactRouterAuthConfig) => void // To set the default env vars
): ReactRouterAuthResult["auth"] {
  if (typeof config === "function") {
    return async (request: Request) => {
      const _config = await config(request)
      onLazyLoad?.(_config)

      return getSession(request, _config).then((r) => r.json())
    }
  }
  return async (request: Request) => {
    return getSession(request, config).then((r) => r.json())
  }
}

async function getSession(request: Request, config: ReactRouterAuthConfig) {
  const headers = new Headers(request.headers)
  const requestUrl = new URL(request.url)

  const url = createActionURL(
    "session",
    request.headers.get("X-Forwarded-Proto") ?? requestUrl.protocol,
    headers,
    process.env,
    config
  )
  const req = new Request(url, {
    headers: { cookie: headers.get("cookie") ?? "" },
  })

  return Auth(req, {
    ...config,
    callbacks: {
      ...config.callbacks,
      // Since we are server-side, we don't need to filter out the session data
      // See https://authjs.dev/getting-started/migrating-to-v5#authenticating-server-side
      // TODO: Taint the session data to prevent accidental leakage to the client
      // https://react.dev/reference/react/experimental_taintObjectReference
      async session(...args) {
        const session =
          // If the user defined a custom session callback, use that instead
          (await config.callbacks?.session?.(...args)) ?? {
            ...args[0].session,
            expires:
              args[0].session.expires?.toISOString?.() ??
              args[0].session.expires,
          }
        const user = args[0].user ?? args[0].token
        return { user, ...session } satisfies Session
      },
    },
  }) as Promise<Response>
}
