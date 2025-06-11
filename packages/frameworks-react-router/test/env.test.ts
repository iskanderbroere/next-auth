import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { reqWithEnvURL } from "../lib/env"

describe("env", () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  describe("reqWithEnvURL", () => {
    it("should return the original request if AUTH_URL is not set", () => {
      const mockReq = new Request("http://example.com")
      const result = reqWithEnvURL(mockReq)

      expect(result).toBe(mockReq)
    })

    it("should return a new request with modified URL if AUTH_URL is set", () => {
      vi.stubEnv("AUTH_URL", "http://auth.example.com")

      const mockReq = new Request("http://example.com/path")

      const result = reqWithEnvURL(mockReq)

      expect(result.url).toBe("http://auth.example.com/path")
    })
  })
})
