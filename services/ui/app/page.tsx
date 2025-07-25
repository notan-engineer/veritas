"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Calendar, ThumbsUp, ThumbsDown, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { getAllFactoids, getAllTags, type Factoid } from "@/lib/data-service";
import { getRTLClasses, getRTLContainerClasses, getRTLFlexDirection } from "@/lib/rtl-utils";
import * as React from "react";

function ArticleSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-muted rounded-lg p-4 space-y-3">
        <div className="h-5 w-3/4 bg-muted-foreground/20 rounded" />
        <div className="h-4 w-1/2 bg-muted-foreground/10 rounded" />
        <div className="h-3 w-full bg-muted-foreground/10 rounded" />
        <div className="h-3 w-5/6 bg-muted-foreground/10 rounded" />
        <div className="flex gap-2 mt-2">
          <div className="h-5 w-16 bg-muted-foreground/10 rounded-full" />
          <div className="h-5 w-12 bg-muted-foreground/10 rounded-full" />
        </div>
      </div>
    </div>
  );
}

function TopicSkeleton() {
  return (
    <div className="flex gap-2 justify-center mb-4 animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-8 w-20 bg-muted-foreground/10 rounded-full" />
      ))}
    </div>
  );
}

export default function HomePage() {
  const [selectedTopic, setSelectedTopic] = React.useState("All");
  const [expandedArticles, setExpandedArticles] = React.useState<Set<string>>(new Set());
  const [loading, setLoading] = React.useState(true);
  const [articleReactions, setArticleReactions] = React.useState<Record<string, 'like' | 'dislike' | null>>({});
  const [factoids, setFactoids] = React.useState<Factoid[]>([]);
  const [topics, setTopics] = React.useState<string[]>([]);

  const filteredFactoids = selectedTopic === "All" 
    ? factoids 
    : factoids.filter(factoid => factoid.tags?.some(tag => tag.name === selectedTopic));

  const toggleArticleExpansion = (articleId: string) => {
    const newExpanded = new Set(expandedArticles);
    if (newExpanded.has(articleId)) {
      newExpanded.delete(articleId);
    } else {
      newExpanded.add(articleId);
    }
    setExpandedArticles(newExpanded);
  };

  const handleReaction = (articleId: string, reaction: 'like' | 'dislike') => {
    setArticleReactions(prev => ({
      ...prev,
      [articleId]: prev[articleId] === reaction ? null : reaction
    }));
  };

  const formatDate = (dateString: string, language: 'en' | 'he' | 'ar' | 'other') => {
    const locale = language === 'he' ? 'he-IL' : 'en-US';
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Fetch articles and topics on component mount
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [factoidsData, topicsData] = await Promise.all([
          getAllFactoids(),
          getAllTags().then(tags => tags.map(tag => tag.name))
        ]);
        setFactoids(factoidsData);
        setTopics(topicsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Simulate loading on topic change
  React.useEffect(() => {
    if (factoids.length > 0) {
      setLoading(true);
      const timeout = setTimeout(() => setLoading(false), 400);
      return () => clearTimeout(timeout);
    }
  }, [selectedTopic, factoids.length]);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="text-center space-y-3 sm:space-y-4 px-4 sm:px-0">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">Veritas News Feed</h1>
        <p className="text-sm sm:text-base md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Factual, multi-sourced summaries of current events. Combat information overload with verified facts.
        </p>
      </div>

      {/* Topic Filter */}
      {loading ? <TopicSkeleton /> : (
        <div className="flex gap-2 overflow-x-auto whitespace-nowrap sm:overflow-visible sm:whitespace-normal sm:flex-wrap sm:justify-center pb-2 sm:pb-0 px-4 sm:px-0 scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent">
          {topics.map((topic) => (
            <Button
              key={topic}
              variant={selectedTopic === topic ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTopic(topic)}
              className="transition-colors whitespace-nowrap text-xs sm:text-sm flex-shrink-0"
            >
              {topic}
            </Button>
          ))}
        </div>
      )}

      {/* Article Count */}
      <div className="text-center text-xs sm:text-sm text-muted-foreground px-4 sm:px-0">
        Showing {filteredFactoids.length} factoid{filteredFactoids.length !== 1 ? 's' : ''}
        {selectedTopic !== "All" && ` in ${selectedTopic}`}
      </div>

      {/* Articles Grid */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 px-4 sm:px-0">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <ArticleSkeleton key={i} />)
          : filteredFactoids.map((factoid) => (
            <Card key={factoid.id} className={`h-fit hover:shadow-xl hover:-translate-y-1 transition-all duration-200 ${getRTLContainerClasses(factoid.language)}`}>
              <CardHeader className="pb-3">
                {/* Hero Image Placeholder */}
                <div className="w-full h-32 sm:h-40 bg-muted rounded-lg flex items-center justify-center mb-3">
                  <div className="text-center text-muted-foreground">
                    <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-xs">Article Image</p>
                  </div>
                </div>

                {/* Expand/Collapse and Title Row */}
                <div className={`flex items-start gap-2 ${getRTLFlexDirection(factoid.language)}`}>
                  {factoid.language === 'he' ? (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleArticleExpansion(factoid.id)}
                        className="flex-shrink-0"
                      >
                        {expandedArticles.has(factoid.id) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                      <CardTitle className={`text-base sm:text-lg leading-tight ${getRTLClasses(factoid.language)}`}>
                        <Link 
                          href={`/article/${factoid.id}`}
                          className="hover:text-primary transition-colors"
                        >
                          {factoid.title}
                        </Link>
                      </CardTitle>
                    </>
                  ) : (
                    <>
                      <CardTitle className={`text-base sm:text-lg leading-tight ${getRTLClasses(factoid.language)}`}>
                        <Link 
                          href={`/article/${factoid.id}`}
                          className="hover:text-primary transition-colors"
                        >
                          {factoid.title}
                        </Link>
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleArticleExpansion(factoid.id)}
                        className="flex-shrink-0"
                      >
                        {expandedArticles.has(factoid.id) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </>
                  )}
                </div>
                {/* Timestamp Row */}
                <div className={`flex items-center gap-2 text-xs sm:text-sm text-muted-foreground ${factoid.language === 'he' ? 'justify-end' : 'justify-start'}`}>
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(factoid.created_at, factoid.language)}</span>
                </div>
                {/* Expandable Description */}
                {expandedArticles.has(factoid.id) && (
                  <CardDescription className={`text-xs sm:text-sm leading-relaxed line-clamp-4 ${getRTLClasses(factoid.language)}`}>
                    {factoid.description}
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent className="space-y-3 pt-0">
                {/* Tags */}
                <div className={`flex flex-wrap gap-1 ${factoid.language === 'he' ? 'justify-end' : 'justify-start'} ${getRTLClasses(factoid.language)}`}>
                  {(factoid.tags || []).map((tag) => (
                    <Badge key={tag.id} variant="secondary" className="text-xs">
                      {tag.name}
                    </Badge>
                  ))}
                </div>

                {/* Like/Dislike Buttons */}
                <div className="flex items-center gap-2 pt-2 justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReaction(factoid.id, 'like')}
                    className={`flex items-center gap-1 text-xs ${
                      articleReactions[factoid.id] === 'like' ? 'text-green-600' : 'text-muted-foreground'
                    }`}
                  >
                    <ThumbsUp className="h-3 w-3" />
                    <span>Like</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReaction(factoid.id, 'dislike')}
                    className={`flex items-center gap-1 text-xs ${
                      articleReactions[factoid.id] === 'dislike' ? 'text-red-600' : 'text-muted-foreground'
                    }`}
                  >
                    <ThumbsDown className="h-3 w-3" />
                    <span>Dislike</span>
                  </Button>
                </div>


              </CardContent>
            </Card>
          ))}
      </div>

      {/* Empty State */}
      {!loading && filteredFactoids.length === 0 && (
        <div className="text-center py-8 sm:py-12 px-4 sm:px-0">
          <div className="text-muted-foreground">
            <p className="text-base sm:text-lg">No articles found for &quot;{selectedTopic}&quot;</p>
            <p className="text-xs sm:text-sm mt-2">Try selecting a different topic or check back later.</p>
          </div>
        </div>
      )}
    </div>
  );
}
