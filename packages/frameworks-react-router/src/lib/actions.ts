import {
  Auth,
  createActionURL,
  raw,
  skipCSRFCheck,
  type AuthConfig,
} from "@auth/core"
import type { ProviderType } from "@auth/core/providers"
import { createCookie, redirect } from "react-router"
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
  const { shouldRedirect = true, redirectTo, ...rest } = options

  const hasFormDataInOptions = Object.keys(rest).length > 0
  const formData = hasFormDataInOptions
    ? rest
    : Object.fromEntries(await request.formData())

  const callbackUrl = redirectTo?.toString() ?? headers.get("Referer") ?? "/"
  const requestUrl = new URL(request.url)
  const signInURL = createActionURL(
    "signin",
    request.headers.get("X-Forwarded-Proto") ?? requestUrl.protocol,
    headers,
    process.env,
    config
  )

  if (!provider) {
    signInURL.searchParams.append("callbackUrl", callbackUrl)
    if (shouldRedirect) redirect(signInURL.toString())
    return signInURL.toString()
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
    const url = `${signInURL}?${new URLSearchParams({ callbackUrl })}`
    if (shouldRedirect) redirect(url)
    return url
  }

  if (foundProvider.type === "credentials") {
    url = url.replace("signin", "callback")
  }

  const body = new URLSearchParams({
    ...formData,
    callbackUrl,
  })
  const signInRequest = new Request(url, { method: "POST", headers, body })
  const signInResponse = await Auth(signInRequest, {
    ...config,
    raw,
    skipCSRFCheck,
  })

  const redirectHeaders = new Headers()
  for (const { name, value, options } of signInResponse?.cookies ?? []) {
    const sessionCookie = createCookie(name)
    const serializedSessionCookie = await sessionCookie.serialize(
      value,
      options
    )
    redirectHeaders.append("Set-Cookie", serializedSessionCookie)
  }

  const responseUrl =
    signInResponse instanceof Response
      ? signInResponse.headers.get("Location")
      : signInResponse.redirect

  // NOTE: if for some unexpected reason the responseUrl is not set,
  // we redirect to the original url
  const redirectUrl = responseUrl ?? url

  if (shouldRedirect) {
    return redirect(redirectUrl, {
      headers: redirectHeaders,
    })
  }
  return redirectUrl as any
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
    request.headers.get("X-Forwarded-Proto") ?? requestUrl.protocol,
    headers,
    process.env,
    config
  )
  const callbackUrl = options?.redirectTo ?? headers.get("Referer") ?? "/"
  const body = new URLSearchParams({ callbackUrl })
  const signOutRequest = new Request(url, { method: "POST", headers, body })

  const signOutResponse = await Auth(signOutRequest, {
    ...config,
    // todo: remove rawwwww
    raw,
    skipCSRFCheck,
  })

  const redirectHeaders = new Headers()
  console.log(signOutResponse.headers)
  for (const { name, value, options } of signOutResponse?.cookies ?? []) {
    const sessionCookie = createCookie(name)
    const serializedSessionCookie = await sessionCookie.serialize(
      value,
      options
    )
    redirectHeaders.append("Set-Cookie", serializedSessionCookie)
  }

  if (options?.shouldRedirect ?? true) {
    return redirect(signOutResponse.redirect!, {
      headers: redirectHeaders,
    })
  }

  return signOutResponse as any
}
