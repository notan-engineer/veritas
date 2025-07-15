'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Settings, Bell, Globe, Shield, User, Download, Loader2 } from "lucide-react";
import Link from "next/link";

interface ScrapingLogDisplay {
  level: 'info' | 'warn' | 'error';
  message: string;
}

interface NewsSource {
  id: string;
  name: string;
  domain: string;
  isActive: boolean;
  isEnabled: boolean;
}

export default function SettingsPage() {
  const [isScraping, setIsScraping] = useState(false);
  const [scrapingLogs, setScrapingLogs] = useState<string[]>([]);
  const [lastScrapingResult, setLastScrapingResult] = useState<string>('');
  const [availableSources, setAvailableSources] = useState<NewsSource[]>([]);
  const [loadingSources, setLoadingSources] = useState(true);

  // Fetch available sources from database
  useEffect(() => {
    const fetchSources = async () => {
      try {
        const response = await fetch('/api/scraper/sources');
        const result = await response.json();
        
        if (result.success && result.data?.sources) {
          // Only show active and enabled sources
          const activeSources = result.data.sources.filter((source: NewsSource) => 
            source.isActive && source.isEnabled
          );
          setAvailableSources(activeSources);
        } else {
          console.error('Failed to fetch sources:', result.message);
          // Fallback to empty array if sources can't be loaded
          setAvailableSources([]);
        }
      } catch (error) {
        console.error('Error fetching sources:', error);
        setAvailableSources([]);
      } finally {
        setLoadingSources(false);
      }
    };

    fetchSources();
  }, []);

  const triggerScraping = async (sources: string[]) => {
    setIsScraping(true);
    setScrapingLogs([]);
    setLastScrapingResult('');

    try {
      const response = await fetch('/api/scraper/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sources: sources,
          maxArticles: 3
        }),
      });

      const result = await response.json();

      if (result.success) {
        setLastScrapingResult(`✅ Success: ${result.message}`);
        setScrapingLogs(result.logs.map((log: ScrapingLogDisplay) => `${log.level}: ${log.message}`));
      } else {
        setLastScrapingResult(`❌ Error: ${result.message}`);
        setScrapingLogs(result.logs?.map((log: ScrapingLogDisplay) => `${log.level}: ${log.message}`) || []);
      }
    } catch (error) {
      setLastScrapingResult(`❌ Network Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setScrapingLogs(['Failed to connect to scraper service']);
    } finally {
      setIsScraping(false);
    }
  };
  return (
    <div className="max-w-4xl mx-auto space-y-8 px-2 sm:px-0">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="ghost" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to News Feed
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your Veritas preferences and information sources</p>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        {/* Display Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Display Preferences
            </CardTitle>
            <CardDescription>
              Customize your news reading experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Coming Soon</p>
              <p className="text-sm text-muted-foreground">
                Personalize your feed with topic preferences, reading time estimates, and content filters.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent">
              <Badge variant="outline">Topic Preferences</Badge>
              <Badge variant="outline">Reading Time</Badge>
              <Badge variant="outline">Content Filters</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Information Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Information Sources
            </CardTitle>
            <CardDescription>
              Manage your trusted news sources
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Coming Soon</p>
              <p className="text-sm text-muted-foreground">
                Add, remove, and prioritize your preferred news sources and RSS feeds.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent">
              <Badge variant="outline">RSS Feeds</Badge>
              <Badge variant="outline">Source Priority</Badge>
              <Badge variant="outline">Source Validation</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Configure breaking news alerts and updates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Coming Soon</p>
              <p className="text-sm text-muted-foreground">
                Set up notifications for breaking news, topic updates, and source alerts.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent">
              <Badge variant="outline">Breaking News</Badge>
              <Badge variant="outline">Topic Alerts</Badge>
              <Badge variant="outline">Email Digest</Badge>
            </div>
          </CardContent>
        </Card>

        {/* App Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              App Configuration
            </CardTitle>
            <CardDescription>
              Manage app settings and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Coming Soon</p>
              <p className="text-sm text-muted-foreground">
                Configure app behavior, data preferences, and system settings.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent">
              <Badge variant="outline">Data Preferences</Badge>
              <Badge variant="outline">System Settings</Badge>
              <Badge variant="outline">App Behavior</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Scraper */}
      <Card className="bg-blue-50/50 dark:bg-blue-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Content Scraper
          </CardTitle>
          <CardDescription>
            Manually trigger news content collection from RSS feeds
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingSources ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2 text-sm text-muted-foreground">Loading sources...</span>
            </div>
          ) : availableSources.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">
                No active sources available. Visit the{' '}
                <Link href="/scraper?tab=sources" className="text-primary hover:underline">
                  Scraper Sources section
                </Link>{' '}
                to add sources.
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {/* Individual source buttons - first few sources */}
              <div className="grid gap-3 md:grid-cols-2">
                {availableSources.slice(0, 2).map((source) => (
                  <Button 
                    key={source.id}
                    onClick={() => triggerScraping([source.name])}
                    disabled={isScraping}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    {isScraping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    Scrape {source.name}
                  </Button>
                ))}
              </div>
              
              {/* Scrape all sources button */}
              <Button 
                onClick={() => triggerScraping(availableSources.map(s => s.name))}
                disabled={isScraping || availableSources.length === 0}
                className="w-full flex items-center gap-2"
              >
                {isScraping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                Scrape All Sources ({availableSources.length})
              </Button>
            </div>
          )}
          
          {lastScrapingResult && (
            <div className="mt-4 p-3 bg-background rounded-lg">
              <p className="text-sm font-medium mb-2">Last Result:</p>
              <p className="text-sm text-muted-foreground">{lastScrapingResult}</p>
            </div>
          )}
          
          {scrapingLogs.length > 0 && (
            <div className="mt-4 p-3 bg-background rounded-lg">
              <p className="text-sm font-medium mb-2">Scraping Logs:</p>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {scrapingLogs.map((log, index) => (
                  <p key={index} className="text-xs text-muted-foreground font-mono">
                    {log}
                  </p>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex flex-wrap gap-2">
            {availableSources.map((source) => (
              <Badge key={source.id} variant="outline">
                {source.name}
              </Badge>
            ))}
            {availableSources.length === 0 && !loadingSources && (
              <Badge variant="outline">No Sources</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Development Status */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Development Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 bg-background rounded-lg">
                <div className="text-2xl font-bold text-green-600">Phase 1-4</div>
                <div className="text-sm text-muted-foreground">Completed</div>
                <div className="text-xs text-muted-foreground mt-1">Core UI & Mock Data</div>
              </div>
              <div className="text-center p-4 bg-background rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">Phase 5</div>
                <div className="text-sm text-muted-foreground">In Progress</div>
                <div className="text-xs text-muted-foreground mt-1">RSS Integration</div>
              </div>
              <div className="text-center p-4 bg-background rounded-lg">
                <div className="text-2xl font-bold text-gray-400">Phase 6-8</div>
                <div className="text-sm text-muted-foreground">Planned</div>
                <div className="text-xs text-muted-foreground mt-1">Advanced Features</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              The settings functionality will be implemented in Phase 5 with real data integration and app configuration.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Link href="/">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Return to News Feed
          </Button>
        </Link>
        <Button disabled className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Save Settings
        </Button>
      </div>
    </div>
  );
} 