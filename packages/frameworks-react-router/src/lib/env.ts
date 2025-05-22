export function reqWithEnvURL(req: Request): Request {
  const authUrl = process.env.AUTH_URL
  if (!authUrl) return req
  const { origin: envOrigin } = new URL(authUrl)

  const { href, origin } = new URL(req.url)
  return new Request(href.replace(origin, envOrigin), req)
}
