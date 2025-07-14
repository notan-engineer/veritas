"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Activity, BarChart3, FileText, Settings, Play, Loader2 } from "lucide-react";
import Link from "next/link";
import { HealthDashboard } from "./components/health-dashboard";
import { ContentFeed } from "./components/content-feed";
import { SourceManagement } from "./components/source-management";
import { JobTrigger } from "./components/job-trigger";

type TabType = "dashboard" | "content" | "sources";

export default function ScraperPage() {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [isTriggering, setIsTriggering] = useState(false);

  const tabs = [
    {
      id: "dashboard" as const,
      label: "Dashboard",
      icon: BarChart3,
      description: "Health metrics and job monitoring"
    },
    {
      id: "content" as const,
      label: "Content",
      icon: FileText,
      description: "Scraped article feed and viewer"
    },
    {
      id: "sources" as const,
      label: "Sources",
      icon: Settings,
      description: "Source management and configuration"
    }
  ];

  const handleJobTrigger = async (sources: string[], articlesPerSource: number) => {
    setIsTriggering(true);
    try {
      const response = await fetch('/api/scraper/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sources,
          maxArticles: articlesPerSource
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('Job triggered successfully:', result.jobId);
        // Switch to dashboard tab to show job progress
        setActiveTab("dashboard");
      } else {
        console.error('Failed to trigger job:', result.message);
      }
    } catch (error) {
      console.error('Error triggering job:', error);
    } finally {
      setIsTriggering(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 px-2 sm:px-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to News Feed
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
              <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              Scraper Dashboard
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Monitor scraping health, review content, and manage sources
            </p>
          </div>
        </div>
        
        {/* Job Trigger */}
        <div className="flex items-center gap-2">
          <JobTrigger 
            onTrigger={handleJobTrigger}
            isTriggering={isTriggering}
          />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-border">
        <nav className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {activeTab === "dashboard" && <HealthDashboard />}
        {activeTab === "content" && <ContentFeed />}
        {activeTab === "sources" && <SourceManagement />}
      </div>
    </div>
  );
} 