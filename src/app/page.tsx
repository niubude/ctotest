import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Welcome to SVN Code Review</h1>
        <p className="text-lg text-muted-foreground">
          AI-powered code review tool for SVN repositories
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Repositories</CardTitle>
            <CardDescription>
              Manage and browse your SVN repositories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/repositories">
              <Button className="w-full">View Repositories</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reviews</CardTitle>
            <CardDescription>
              Browse and create code reviews for your commits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/reviews">
              <Button className="w-full">View Reviews</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>
              Configure your preferences and integrations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/settings">
              <Button className="w-full">Open Settings</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            Follow these steps to set up your code review workflow
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              1
            </div>
            <div className="space-y-1">
              <p className="font-medium">Connect your SVN repository</p>
              <p className="text-sm text-muted-foreground">
                Add your SVN repository URL and credentials in the repositories section
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              2
            </div>
            <div className="space-y-1">
              <p className="font-medium">Configure AI settings</p>
              <p className="text-sm text-muted-foreground">
                Set up your OpenAI API key in settings for AI-powered code reviews
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              3
            </div>
            <div className="space-y-1">
              <p className="font-medium">Start reviewing code</p>
              <p className="text-sm text-muted-foreground">
                Select commits from your repository and generate AI-powered code reviews
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
