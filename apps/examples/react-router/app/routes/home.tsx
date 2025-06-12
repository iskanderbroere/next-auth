import CustomLink from "~/components/custom-link"
import { auth } from "~/lib/auth.server"
import type { Route } from "./+types/home"

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth(request)
  return { session }
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <title>ReactRouterAuth.js Example</title>
      <meta
        name="description"
        content="This is an example site to demonstrate how to use ReactRouterAuth.js for authentication"
      />
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold">ReactRouter Auth Example</h1>
        <div>
          This is an example site to demonstrate how to use{" "}
          <CustomLink href="https://react-router.authjs.dev">
            Auth.js
          </CustomLink>{" "}
          for authentication with{" "}
          <CustomLink href="https://reactrouter.com/" className="underline">
            React Router
          </CustomLink>
          .
        </div>
        <div className="flex flex-col rounded-md bg-gray-100">
          <div className="rounded-t-md bg-gray-200 p-4 font-bold">
            Current Session
          </div>
          <pre className="whitespace-pre-wrap break-all px-4 py-6">
            {JSON.stringify(loaderData.session, null, 2)}
          </pre>
        </div>
      </div>
    </>
  )
}
