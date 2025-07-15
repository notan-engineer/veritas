"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, FileText, Settings } from "lucide-react";
import { HealthDashboard } from "./components/health-dashboard";
import { ContentFeed } from "./components/content-feed";
import { SourceManagement } from "./components/source-management";
import { JobTrigger } from "./components/job-trigger";

type TabType = "dashboard" | "content" | "sources";

function ScraperPageContent() {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [isTriggering, setIsTriggering] = useState(false);
  const searchParams = useSearchParams();

  // Handle tab routing from URL parameters
  useEffect(() => {
    const tabParam = searchParams.get('tab') as TabType;
    if (tabParam && ['dashboard', 'content', 'sources'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

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
      {/* Tab Navigation with Trigger Button */}
      <div className="border-b border-border">
        <div className="flex items-center justify-between">
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
          
          {/* Job Trigger aligned with tabs */}
          <div className="flex items-center gap-2 pb-4">
            <JobTrigger 
              onTrigger={handleJobTrigger}
              isTriggering={isTriggering}
            />
          </div>
        </div>
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

export default function ScraperPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 px-2 sm:px-0"><div className="h-96 flex items-center justify-center">Loading...</div></div>}>
      <ScraperPageContent />
    </Suspense>
  );
}