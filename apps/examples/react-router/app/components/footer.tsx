import CustomLink from "./custom-link"
import packageJSON from "@auth/react-router/package.json"

export default function Footer() {
  return (
    <footer className="mx-0 my-4 flex w-full flex-col gap-4 px-4 text-sm sm:mx-auto sm:my-12 sm:h-5 sm:max-w-3xl sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row">
        <CustomLink href="https://react-router.authjs.dev">
          Documentation
        </CustomLink>
        <CustomLink href="https://www.npmjs.com/package/@auth/react-router">
          NPM
        </CustomLink>
        <CustomLink href="https://github.com/nextauthjs/next-auth/tree/main/apps/examples/react-router">
          Source on GitHub
        </CustomLink>
      </div>
      <div className="flex items-center justify-start gap-2">
        <img
          className="size-5"
          src="https://authjs.dev/img/logo-sm.png"
          alt="Auth.js Logo"
        />
        <CustomLink href="https://npmjs.org/package/@auth/react-router">
          {packageJSON.version}
        </CustomLink>
      </div>
    </footer>
  )
}
