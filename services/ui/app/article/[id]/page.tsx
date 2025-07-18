import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Calendar, CheckCircle, ThumbsUp, ThumbsDown, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { getFactoidById } from "@/lib/data.server";
import { getRTLClasses, getRTLContainerClasses, getRTLFlexDirection } from "@/lib/rtl-utils";

interface ArticlePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const resolvedParams = await params;
  const factoid = await getFactoidById(resolvedParams.id);

  if (!factoid) {
    notFound();
  }

  const formatDate = (dateString: string) => {
    const locale = factoid.language === 'he' ? 'he-IL' : 'en-US';
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`max-w-4xl mx-auto space-y-6 sm:space-y-8 px-4 sm:px-0 ${getRTLContainerClasses(factoid.language)}`}>
      {/* Back Button */}
      <div>
        <Link href="/">
          <Button variant="ghost" className={`flex items-center gap-2 text-sm sm:text-base ${getRTLFlexDirection(factoid.language)}`}>
            <ArrowLeft className="h-4 w-4" />
            Back to News Feed
          </Button>
        </Link>
      </div>

      {/* Article Header */}
      <div className="space-y-4">
        <div className={`flex items-center gap-2 text-xs sm:text-sm text-muted-foreground ${getRTLFlexDirection(factoid.language)}`}>
          <Calendar className="h-4 w-4" />
          <span>{formatDate(factoid.created_at)}</span>
        </div>

        <h1 className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight ${getRTLClasses(factoid.language)}`}>
          {factoid.title}
        </h1>

        <p className={`text-sm sm:text-base md:text-xl text-muted-foreground leading-relaxed ${getRTLClasses(factoid.language)}`}>
          {factoid.description}
        </p>

        <div className={`flex flex-wrap gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent ${getRTLClasses(factoid.language)}`}>
          {(factoid.tags || []).map((tag) => (
            <Badge key={tag.id} variant="secondary" className="text-xs sm:text-sm">
              {tag.name}
            </Badge>
          ))}
        </div>

        {/* Hero Image Placeholder */}
        <div className="w-full h-48 sm:h-64 md:h-80 bg-muted rounded-lg flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <ImageIcon className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3" />
            <p className="text-sm sm:text-base">Article Hero Image</p>
          </div>
        </div>

        {/* Like/Dislike Buttons */}
        <div className={`flex items-center gap-3 pt-2 ${getRTLFlexDirection(factoid.language)}`}>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <ThumbsUp className="h-4 w-4" />
            <span className="text-sm">Like</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <ThumbsDown className="h-4 w-4" />
            <span className="text-sm">Dislike</span>
          </Button>
        </div>
      </div>

      {/* Factual Summary */}
      <Card>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 text-lg sm:text-xl ${getRTLFlexDirection(factoid.language)}`}>
            <CheckCircle className="h-5 w-5 text-green-600" />
            Verified Facts
          </CardTitle>
          <CardDescription className={`text-sm sm:text-base ${getRTLClasses(factoid.language)}`}>
            Key facts extracted and verified from multiple sources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4">
            {(factoid.bullet_points || []).map((point, index) => (
              <div key={index} className={`flex items-start gap-3 p-3 bg-muted/50 rounded-lg ${getRTLFlexDirection(factoid.language)}`}>
                <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                  {index + 1}
                </div>
                <p className={`text-sm sm:text-base leading-relaxed ${getRTLClasses(factoid.language)}`}>{point}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sources */}
      <Card>
        <CardHeader>
          <CardTitle className={`text-lg sm:text-xl ${getRTLClasses(factoid.language)}`}>Sources</CardTitle>
          <CardDescription className={`text-sm sm:text-base ${getRTLClasses(factoid.language)}`}>
            Multiple verified sources for this information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(factoid.sources || []).map((source, index) => (
              <div key={source.id} className={`flex items-center justify-between p-3 border rounded-lg ${getRTLFlexDirection(factoid.language)}`}>
                <div className={`flex items-center gap-3 min-w-0 flex-1 ${getRTLFlexDirection(factoid.language)}`}>
                  <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`font-medium text-sm sm:text-base ${getRTLClasses(factoid.language)}`}>{source.name}</p>
                    <p className={`text-xs sm:text-sm text-muted-foreground truncate ${getRTLClasses(factoid.language)}`}>
                      {source.scraped_content?.source_url || source.url}
                    </p>
                  </div>
                </div>
                <a
                  href={source.scraped_content?.source_url || source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 text-primary hover:underline flex-shrink-0 ml-2 ${getRTLFlexDirection(factoid.language)}`}
                >
                  <span className="text-xs sm:text-sm">Visit</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* About Veritas */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className={`text-lg sm:text-xl ${getRTLClasses(factoid.language)}`}>About This Article</CardTitle>
        </CardHeader>
        <CardContent className={`space-y-3 text-xs sm:text-sm text-muted-foreground ${getRTLClasses(factoid.language)}`}>
          <p>
            This article has been processed by Veritas to extract factual information from multiple sources. 
            Our system aggregates news from various outlets and presents verified facts in an easily digestible format.
          </p>
          <p>
            The bullet points above represent key facts that have been cross-referenced across multiple sources 
            to ensure accuracy and reduce bias.
          </p>
          <p>
            Always verify information from original sources, especially for critical decisions or breaking news.
          </p>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-6 sm:pt-8">
        <Link href="/">
          <Button variant="outline" className={`flex items-center gap-2 text-sm sm:text-base ${getRTLFlexDirection(factoid.language)}`}>
            <ArrowLeft className="h-4 w-4" />
            Back to News Feed
          </Button>
        </Link>
      </div>
    </div>
  );
} 