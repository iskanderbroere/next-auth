import {
  Auth,
  createActionURL,
  skipCSRFCheck,
  type AuthConfig,
} from "@auth/core"
import type { ProviderType } from "@auth/core/providers"
import { redirectDocument } from "react-router"
import type { ReactRouterAuthResult } from "../index.js"

type SignInParams = Parameters<ReactRouterAuthResult["signIn"]>
export async function signIn(
  request: SignInParams[0],
  provider: SignInParams[1],
  options: SignInParams[2] = {},
  authorizationParams: SignInParams[3],
  config: AuthConfig
) {
  const headers = new Headers(request.headers)
  const { redirectTo } = options

  const callbackUrl = redirectTo?.toString() ?? headers.get("Referer") ?? "/"

  const requestUrl = new URL(request.url)
  const signInURL = createActionURL(
    "signin",
    requestUrl.protocol,
    headers,
    process.env,
    config
  )

  if (!provider) {
    signInURL.searchParams.append("callbackUrl", callbackUrl)
    return redirectDocument(signInURL.toString())
  }

  let url = `${signInURL}/${provider}?${new URLSearchParams(
    authorizationParams
  )}`
  let foundProvider: { id?: SignInParams[1]; type?: ProviderType } = {}

  for (const providerConfig of config.providers) {
    const { options, ...defaults } =
      typeof providerConfig === "function" ? providerConfig() : providerConfig
    const id = (options?.id as string | undefined) ?? defaults.id
    if (id === provider) {
      foundProvider = {
        id,
        type: (options?.type as ProviderType | undefined) ?? defaults.type,
      }
      break
    }
  }

  if (!foundProvider.id) {
    signInURL.searchParams.append("callbackUrl", callbackUrl)
    return redirectDocument(signInURL.toString())
  }

  if (foundProvider.type === "credentials") {
    url = url.replace("signin", "callback")
  }

  const formData = Object.fromEntries(await request.formData())
  headers.set("Content-Type", "application/x-www-form-urlencoded")

  const body = new URLSearchParams({
    ...formData,
    callbackUrl,
  })
  const signInRequest = new Request(url, { method: "POST", headers, body })

  return Auth(signInRequest, {
    ...config,
    skipCSRFCheck,
  })
}

type SignOutParams = Parameters<ReactRouterAuthResult["signOut"]>
export async function signOut(
  request: SignOutParams[0],
  options: SignOutParams[1],
  config: AuthConfig
) {
  const headers = new Headers(request.headers)
  headers.set("Content-Type", "application/x-www-form-urlencoded")

  const requestUrl = new URL(request.url)
  const url = createActionURL(
    "signout",
    requestUrl.protocol,
    headers,
    process.env,
    config
  )
  const callbackUrl = options?.redirectTo ?? headers.get("Referer") ?? "/"
  const body = new URLSearchParams({ callbackUrl })
  const signOutRequest = new Request(url, { method: "POST", headers, body })

  return Auth(signOutRequest, {
    ...config,
    skipCSRFCheck,
  })
}
