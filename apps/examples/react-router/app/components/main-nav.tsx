import CustomLink from "./custom-link"
import { Button } from "./ui/button"

export function MainNav() {
  return (
    <div className="flex items-center gap-4">
      <CustomLink href="/">
        <Button variant="ghost" className="p-0">
          <img src="/logo.png" alt="Home" className="w-8" />
        </Button>
      </CustomLink>
    </div>
  )
}
