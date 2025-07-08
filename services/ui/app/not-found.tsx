import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Search, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">Article Not Found</CardTitle>
          <CardDescription>
            The article you&apos;re looking for doesn&apos;t exist or may have been removed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This could be due to:
          </p>
          <ul className="text-sm text-muted-foreground space-y-1 text-left max-w-xs mx-auto">
            <li>• Invalid article ID</li>
            <li>• Article has been archived</li>
            <li>• Temporary data issue</li>
          </ul>
          
          <div className="flex flex-col gap-2 pt-4">
            <Link href="/">
              <Button className="w-full flex items-center gap-2">
                <Home className="h-4 w-4" />
                Return to News Feed
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 