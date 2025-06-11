import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import ReactRouterAuth from "../src"
// TODO: Move the MemoryAdapter to utils package
import { MemoryAdapter } from "../../core/test/memory-adapter"
import Nodemailer from "@auth/core/providers/nodemailer"
import Credentials from "@auth/core/providers/credentials"

const formData = new FormData()
formData.append("email", "jane@example.com")

describe("signIn action", () => {
  describe("with Nodemailer provider", () => {
    beforeEach(() => {
      vi.stubEnv("AUTH_URL", "http://auth.example.com/auth")
      vi.stubEnv("AUTH_SECRET", "notsosupersecret")
    })
    afterEach(() => {
      vi.unstubAllEnvs()
    })
    it("returns a redirect response to /verify-request", async () => {
      const reactRouterAuth = ReactRouterAuth({
        adapter: MemoryAdapter(),
        providers: [
          Nodemailer({
            sendVerificationRequest() {
              // ignore
            },
            server: {
              host: "smtp.example.com",
              port: 465,
              secure: true,
            },
          }),
        ],
      })

      const redirectResponse = await reactRouterAuth?.signIn(
        new Request("http://auth.example.com/auth/signin", {
          body: formData,
          method: "POST",
        }),
        "nodemailer"
      )
      expect(redirectResponse?.status).toEqual(302)
      expect(redirectResponse?.headers.get("Location")).toEqual(
        "http://auth.example.com/auth/verify-request?provider=nodemailer&type=email"
      )
    })

    it("returns a redirect response to /error page when sendVerificationRequest throws", async () => {
      const reactRouterAuth = ReactRouterAuth({
        adapter: MemoryAdapter(),
        providers: [
          Nodemailer({
            sendVerificationRequest() {
              throw new Error()
            },
            server: {
              host: "smtp.example.com",
              port: 465,
              secure: true,
            },
          }),
        ],
      })

      const redirectResponse = await reactRouterAuth.signIn(
        new Request("http://auth.example.com/auth/signin", {
          body: formData,
          method: "POST",
        }),
        "nodemailer"
      )
      expect(redirectResponse.status).toEqual(302)
      expect(redirectResponse.headers.get("Location")).toEqual(
        "http://auth.example.com/auth/error?error=Configuration"
      )
    })
  })

  describe("with Credentials provider", () => {
    it("returns a redirect response", async () => {
      const reactRouterAuth = ReactRouterAuth({
        adapter: MemoryAdapter(),
        providers: [
          Credentials({
            credentials: {
              username: { label: "Username" },
              password: { label: "Password", type: "password" },
            },
            async authorize() {
              return {
                id: "1",
                name: "Jane Doe",
                email: "jane@example.com",
                image: "http://auth.example.com/jane.jpg",
              }
            },
          }),
        ],
        session: {
          strategy: "jwt",
        },
        secret: ["1"],
      })

      const redirectResponse = await reactRouterAuth.signIn(
        new Request("http://auth.example.com/auth/signin", {
          body: formData,
          method: "POST",
          headers: {
            Host: "auth.example.com",
          },
        }),
        "credentials"
      )
      expect(redirectResponse.status).toEqual(302)
      expect(redirectResponse.headers.get("Location")).toEqual(
        "http://auth.example.com/"
      )
    })
  })

  describe("with unknown provider", () => {
    it("returns a redirect response to /signin with default callbackUrl", async () => {
      const reactRouterAuth = ReactRouterAuth({
        adapter: MemoryAdapter(),
        providers: [],
      })

      const redirectResponse = await reactRouterAuth.signIn(
        new Request("http://auth.example.com/auth/signin", {
          body: formData,
          method: "POST",
          headers: {
            Host: "auth.example.com",
          },
        }),
        "unknown"
      )
      expect(redirectResponse.status).toEqual(302)
      expect(redirectResponse.headers.get("Location")).toEqual(
        "http://auth.example.com/auth/signin?callbackUrl=%2F"
      )
    })

    it("returns a redirect response to /signin with redirectTo callbackUrl", async () => {
      const reactRouterAuth = ReactRouterAuth({
        adapter: MemoryAdapter(),
        providers: [],
      })

      const redirectResponse = await reactRouterAuth.signIn(
        new Request("http://auth.example.com/auth/signin", {
          body: formData,
          method: "POST",
          headers: {
            Host: "auth.example.com",
          },
        }),
        "unknown",
        { redirectTo: "/custom" }
      )
      expect(redirectResponse.status).toEqual(302)
      expect(redirectResponse.headers.get("Location")).toEqual(
        "http://auth.example.com/auth/signin?callbackUrl=%2Fcustom"
      )
    })

    it("returns a redirect response to /signin with callbackUrl from Referer header", async () => {
      const reactRouterAuth = ReactRouterAuth({
        adapter: MemoryAdapter(),
        providers: [],
      })

      const redirectResponse = await reactRouterAuth.signIn(
        new Request("http://auth.example.com/auth/signin", {
          body: formData,
          method: "POST",
          headers: {
            Host: "auth.example.com",
            Referer: "http://whatever.example.com",
          },
        }),
        "unknown"
      )
      expect(redirectResponse.status).toEqual(302)
      expect(redirectResponse.headers.get("Location")).toEqual(
        "http://auth.example.com/auth/signin?callbackUrl=http%3A%2F%2Fwhatever.example.com"
      )
    })
  })

  describe("with no provider", () => {
    it("returns a redirect response to /signin with default callbackUrl", async () => {
      const reactRouterAuth = ReactRouterAuth({
        adapter: MemoryAdapter(),
        providers: [],
      })

      const redirectResponse = await reactRouterAuth.signIn(
        new Request("http://auth.example.com/auth/signin", {
          body: formData,
          method: "POST",
          headers: {
            Host: "auth.example.com",
          },
        })
      )
      expect(redirectResponse.status).toEqual(302)
      expect(redirectResponse.headers.get("Location")).toEqual(
        "http://auth.example.com/auth/signin?callbackUrl=%2F"
      )
    })

    it("returns a redirect response to /signin with redirectTo callbackUrl", async () => {
      const reactRouterAuth = ReactRouterAuth({
        adapter: MemoryAdapter(),
        providers: [],
      })

      const redirectResponse = await reactRouterAuth.signIn(
        new Request("http://auth.example.com/auth/signin", {
          body: formData,
          method: "POST",
          headers: {
            Host: "auth.example.com",
          },
        }),
        undefined,
        { redirectTo: "/custom" }
      )
      expect(redirectResponse.status).toEqual(302)
      expect(redirectResponse.headers.get("Location")).toEqual(
        "http://auth.example.com/auth/signin?callbackUrl=%2Fcustom"
      )
    })
    it("returns a redirect response to /signin with callbackUrl from Referer header", async () => {
      const reactRouterAuth = ReactRouterAuth({
        adapter: MemoryAdapter(),
        providers: [],
      })

      const redirectResponse = await reactRouterAuth.signIn(
        new Request("http://auth.example.com/auth/signin", {
          body: formData,
          method: "POST",
          headers: {
            Host: "auth.example.com",
            Referer: "http://whatever.example.com",
          },
        })
      )
      expect(redirectResponse.status).toEqual(302)
      expect(redirectResponse.headers.get("Location")).toEqual(
        "http://auth.example.com/auth/signin?callbackUrl=http%3A%2F%2Fwhatever.example.com"
      )
    })
  })
})

describe("signOut action", () => {
  beforeEach(() => {
    vi.stubEnv("AUTH_URL", "http://auth.example.com/auth")
    vi.stubEnv("AUTH_SECRET", "supersecret")
  })
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it("returns a redirect response", async () => {
    const reactRouterAuth = ReactRouterAuth({
      adapter: MemoryAdapter(),
      providers: [],
    })

    const redirectResponse = await reactRouterAuth.signOut(
      new Request("http://auth.example.com/auth/signout", {
        method: "POST",
        headers: {
          Host: "auth.example.com",
          Referer: "http://whatever.example.com",
        },
      })
    )
    expect(redirectResponse.status).toEqual(302)
    expect(redirectResponse.headers.get("Location")).toEqual(
      "http://auth.example.com"
    )
  })

  it("returns a redirect response with redirectTo callbackUrl", async () => {
    const reactRouterAuth = ReactRouterAuth({
      adapter: MemoryAdapter(),
      providers: [],
    })

    const redirectResponse = await reactRouterAuth.signOut(
      new Request("http://auth.example.com/auth/signout", {
        method: "POST",
        headers: {
          Host: "auth.example.com",
        },
      }),
      { redirectTo: "/custom" }
    )
    expect(redirectResponse.status).toEqual(302)
    expect(redirectResponse.headers.get("Location")).toEqual(
      "http://auth.example.com/custom"
    )
  })

  it("returns a redirect response with callbackUrl from Referer header", async () => {
    const reactRouterAuth = ReactRouterAuth({
      adapter: MemoryAdapter(),
      providers: [],
    })

    const redirectResponse = await reactRouterAuth.signOut(
      new Request("http://auth.example.com/auth/signout", {
        method: "POST",
        headers: {
          Host: "auth.example.com",
          Referer: "http://auth.example.com/custom",
        },
      })
    )
    expect(redirectResponse.status).toEqual(302)
    expect(redirectResponse.headers.get("Location")).toEqual(
      "http://auth.example.com/custom"
    )
  })
})
