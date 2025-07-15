"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Loader2, ChevronDown, Settings, Activity } from "lucide-react";

interface JobTriggerProps {
  onTrigger: (sources: string[], articlesPerSource: number) => Promise<void>;
  isTriggering: boolean;
}

interface Source {
  id: string;
  name: string;
  domain: string;
  url: string;
  description: string;
  isActive: boolean;
  isEnabled: boolean;
  successRate: number;
  lastScrapedAt?: Date;
}

export function JobTrigger({ onTrigger, isTriggering }: JobTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [articlesPerSource, setArticlesPerSource] = useState(3);
  const [availableSources, setAvailableSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<'idle' | 'running' | 'completed' | 'failed'>('idle');
  const [jobProgress, setJobProgress] = useState(0);
  const [jobDetails, setJobDetails] = useState<{
    totalArticles: number;
    duration: number;
    errors: number;
  } | null>(null);

  // Load available sources
  useEffect(() => {
    const loadSources = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/scraper/sources?enabled=true');
        const result = await response.json();
        
        if (result.success) {
          const sources = result.data.sources || [];
          setAvailableSources(sources);
          // Select all sources by default
          setSelectedSources(sources.map((source: Source) => source.id));
        } else {
          console.error('Failed to load sources:', result.error);
        }
      } catch (error) {
        console.error('Error loading sources:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSources();
  }, []);

  // Real-time job status monitoring
  useEffect(() => {
    if (currentJobId) {
      const checkJobStatus = async () => {
        try {
          const response = await fetch(`/api/scraper/jobs/${currentJobId}`);
          const result = await response.json();
          
          if (result.success) {
            const job = result.data;
            setJobStatus(job.status);
            setJobProgress(job.progress || 0);
            
            // Update job details
            if (job.status === 'completed' || job.status === 'failed') {
              setJobDetails({
                totalArticles: job.totalArticlesScraped || 0,
                duration: job.duration || 0,
                errors: job.totalErrors || 0
              });
              
              // Clear current job after completion
              if (job.status === 'completed') {
                setTimeout(() => {
                  setCurrentJobId(null);
                  setJobStatus('idle');
                  setJobProgress(0);
                  setJobDetails(null);
                }, 3000); // Clear after 3 seconds
              }
            }
          }
        } catch (error) {
          console.error('Error checking job status:', error);
        }
      };

      // Check status every 2 seconds for active jobs
      const interval = setInterval(checkJobStatus, 2000);
      return () => clearInterval(interval);
    }
  }, [currentJobId]);

  const handleSourceToggle = (sourceId: string) => {
    setSelectedSources(prev => 
      prev.includes(sourceId) 
        ? prev.filter(id => id !== sourceId)
        : [...prev, sourceId]
    );
  };

  const handleTrigger = async () => {
    if (selectedSources.length === 0) {
      alert('Please select at least one source');
      return;
    }

    setJobStatus('running');
    setJobProgress(0);
    setJobDetails(null);

    try {
      // Try to trigger job and get job ID for tracking
      const response = await fetch('/api/scraper/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sources: selectedSources,
          articlesPerSource: articlesPerSource,
          immediate: true
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setCurrentJobId(result.jobId);
        setJobStatus('running');
      } else {
        setJobStatus('failed');
        alert(`Failed to trigger job: ${result.message || result.error}`);
      }
    } catch (error) {
      console.error('Error triggering job:', error);
      setJobStatus('failed');
      // Fallback to original onTrigger method
      await onTrigger(selectedSources, articlesPerSource);
    }
    
    setIsOpen(false);
  };

  const getSourceNames = () => {
    return selectedSources
      .map(id => availableSources.find(s => s.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isTriggering || jobStatus === 'running'}
        className="flex items-center gap-2"
      >
        {isTriggering || jobStatus === 'running' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : jobStatus === 'completed' ? (
          <Activity className="h-4 w-4 text-green-500" />
        ) : jobStatus === 'failed' ? (
          <Activity className="h-4 w-4 text-red-500" />
        ) : (
          <Play className="h-4 w-4" />
        )}
        {isTriggering || jobStatus === 'running' ? 'Running...' : 
         jobStatus === 'completed' ? 'Completed' :
         jobStatus === 'failed' ? 'Failed' : 'Trigger Job'}
        <ChevronDown className="h-4 w-4" />
      </Button>

      {/* Job Status Display */}
      {jobStatus === 'running' && (
        <div className="absolute top-full right-0 z-40 mt-1 bg-white border rounded-lg shadow-lg p-2 min-w-48">
          <div className="flex items-center gap-2 text-sm">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Job in progress...</span>
          </div>
          {jobProgress > 0 && (
            <div className="mt-1">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full transition-all duration-300" style={{ width: `${jobProgress}%` }}></div>
              </div>
              <div className="text-xs text-gray-600 mt-1">{jobProgress}% complete</div>
            </div>
          )}
        </div>
      )}

      {jobStatus === 'completed' && jobDetails && (
        <div className="absolute top-full right-0 z-40 mt-1 bg-green-50 border border-green-200 rounded-lg shadow-lg p-2 min-w-48">
          <div className="flex items-center gap-2 text-sm text-green-800">
            <Activity className="h-3 w-3" />
            <span>Job completed successfully!</span>
          </div>
          <div className="text-xs text-green-600 mt-1">
            <div>{jobDetails.totalArticles} articles scraped</div>
            <div>Duration: {jobDetails.duration}s</div>
            {jobDetails.errors > 0 && <div className="text-orange-600">{jobDetails.errors} errors</div>}
          </div>
        </div>
      )}

      {jobStatus === 'failed' && jobDetails && (
        <div className="absolute top-full right-0 z-40 mt-1 bg-red-50 border border-red-200 rounded-lg shadow-lg p-2 min-w-48">
          <div className="flex items-center gap-2 text-sm text-red-800">
            <Activity className="h-3 w-3" />
            <span>Job failed</span>
          </div>
          <div className="text-xs text-red-600 mt-1">
            <div>{jobDetails.errors} errors occurred</div>
            <div>Duration: {jobDetails.duration}s</div>
          </div>
        </div>
      )}

      {isOpen && (
        <Card className="absolute top-full right-0 z-50 w-96 mt-2 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Trigger Scraping Job
            </CardTitle>
            <CardDescription>
              Select sources and configure the scraping job
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Articles per source */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Articles per source
              </label>
              <input
                type="number"
                min="1"
                value={articlesPerSource}
                onChange={(e) => setArticlesPerSource(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Enter number of articles"
              />
              <div className="text-xs text-muted-foreground mt-1">
                Enter the number of articles to scrape per source
              </div>
            </div>

            {/* Source selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Select Sources ({selectedSources.length} selected)
              </label>
              
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="ml-2 text-sm">Loading sources...</span>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {availableSources.map((source) => (
                    <div
                      key={source.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedSources.includes(source.id)
                          ? 'bg-blue-50 border-blue-300 dark:bg-blue-950 dark:border-blue-700'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => handleSourceToggle(source.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium text-sm ${
                              selectedSources.includes(source.id) 
                                ? 'text-blue-700 dark:text-blue-300' 
                                : ''
                            }`}>
                              {source.name}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {source.successRate}% success
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {source.domain}
                          </div>
                        </div>
                        {selectedSources.includes(source.id) && (
                          <div className="text-blue-600 dark:text-blue-400">
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {availableSources.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      <Settings className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">No enabled sources found</p>
                      <p className="text-xs">Configure sources in the Sources tab</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Selected sources summary */}
            {selectedSources.length > 0 && (
              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="text-sm font-medium mb-1">Selected Sources:</div>
                <div className="text-sm text-muted-foreground">
                  {getSourceNames()}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Total articles: ~{selectedSources.length * articlesPerSource}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isTriggering}
              >
                Cancel
              </Button>
              <Button
                onClick={handleTrigger}
                disabled={selectedSources.length === 0 || isTriggering}
              >
                {isTriggering ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Triggering...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Trigger Job
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 