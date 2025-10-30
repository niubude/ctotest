import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  return (
    <header className="border-b">
      <div className="container flex h-16 items-center px-4">
        <div className="mr-8 flex items-center space-x-2">
          <Link href="/" className="text-xl font-bold">
            SVN Code Review
          </Link>
        </div>
        <nav className="flex flex-1 items-center space-x-6 text-sm font-medium">
          <Link
            href="/repositories"
            className="transition-colors hover:text-foreground/80"
          >
            Repositories
          </Link>
          <Link
            href="/reviews"
            className="transition-colors hover:text-foreground/80"
          >
            Reviews
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger className="transition-colors hover:text-foreground/80">
              Configuration
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <Link href="/config/repositories">SVN Repositories</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/config/rules">Review Rules</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/config/prompts">System Prompts</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/config/history">Review History</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link
            href="/settings"
            className="transition-colors hover:text-foreground/80"
          >
            Settings
          </Link>
        </nav>
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm">
            Sign In
          </Button>
        </div>
      </div>
      <Separator />
    </header>
  );
}
