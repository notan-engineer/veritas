"use client"

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { 
  Play, 
  CheckCircle, 
  FileText, 
  Clock, 
  RefreshCw,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Loader2,
  ArrowUpDown,
  CircleCheck,
  CircleX,
  CircleDot,
  Copy,
  Check
} from 'lucide-react'
import { DashboardMetrics, ScrapingJob, JobLog, PaginatedResponse } from '../types'

interface DashboardTabProps {
  refreshTrigger: number
}

export function DashboardTab({ refreshTrigger }: DashboardTabProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [jobs, setJobs] = useState<ScrapingJob[]>([])
  const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set())
  const [jobLogs, setJobLogs] = useState<Record<string, JobLog[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [sortField, setSortField] = useState<'triggeredAt' | 'sourcesRequested' | 'totalArticlesScraped' | 'duration' | 'status'>('triggeredAt')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [copiedJobId, setCopiedJobId] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [refreshTrigger])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    setIsRefreshing(true)
    try {
      const [metricsRes, jobsRes] = await Promise.all([
        fetch('/api/scraper/metrics'),
        fetch('/api/scraper/jobs')
      ])
      
      if (metricsRes.ok) {
        const metricsData = await metricsRes.json()
        setMetrics(metricsData)
      }
      
      if (jobsRes.ok) {
        const jobsData: PaginatedResponse<ScrapingJob> = await jobsRes.json()
        console.log('Dashboard jobs data:', jobsData.data) // Debug log
        setJobs(jobsData.data)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const fetchJobLogs = async (jobId: string) => {
    try {
      console.log('Fetching logs for job:', jobId); // Debug log
      const response = await fetch(`/api/scraper/jobs/${jobId}/logs`)
      console.log('Logs response status:', response.status); // Debug log
      
      if (response.ok) {
        const data: PaginatedResponse<JobLog> = await response.json()
        console.log('Logs data:', data); // Debug log
        setJobLogs(prev => ({ ...prev, [jobId]: data.data }))
      } else {
        console.error('Logs API returned error:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response:', errorText);
      }
    } catch (error) {
      console.error('Failed to fetch job logs:', error)
    }
  }

  const toggleJobExpanded = async (jobId: string) => {
    const newExpanded = new Set(expandedJobs)
    if (newExpanded.has(jobId)) {
      newExpanded.delete(jobId)
    } else {
      newExpanded.add(jobId)
      if (!jobLogs[jobId]) {
        await fetchJobLogs(jobId)
      }
    }
    setExpandedJobs(newExpanded)
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '-'
    if (seconds < 60) return `${Math.round(seconds)}s`
    const minutes = Math.floor(seconds / 60)
    const secs = Math.round(seconds % 60)
    return `${minutes}m ${secs}s`
  }

  const getStatusIcon = (status: ScrapingJob['status']) => {
    switch (status) {
      case 'successful':
        return <CircleCheck className="h-4 w-4 text-green-500" />
      case 'partial':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'in-progress':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      case 'failed':
        return <CircleX className="h-4 w-4 text-red-500" />
      case 'new':
        return <CircleDot className="h-4 w-4 text-gray-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadgeColor = (status: ScrapingJob['status']) => {
    switch (status) {
      case 'successful':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'partial':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'new':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const calculatePerSourceStats = (job: ScrapingJob) => {
    const sourceStats: Record<string, { scraped: number; requested: number }> = {}
    
    // Initialize all sources with their requested count
    job.sourcesRequested.forEach(source => {
      sourceStats[source] = { 
        scraped: job.sourceArticleCounts?.[source] || 0, 
        requested: job.articlesPerSource 
      }
    })
    
    return sourceStats
  }

  const copyJobLogs = async (jobId: string) => {
    const logs = jobLogs[jobId] || []
    const logText = logs.map(log => {
      const timestamp = new Date(log.timestamp).toISOString()
      const fullLogData = {
        timestamp,
        level: log.logLevel,
        message: log.message,
        sourceName: log.sourceName,
        additionalData: log.additionalData
      }
      return `[${timestamp}] ${JSON.stringify(fullLogData, null, 2)}`
    }).join('\n\n')
    
    try {
      await navigator.clipboard.writeText(logText)
      setCopiedJobId(jobId)
      setTimeout(() => setCopiedJobId(null), 2000)
    } catch (error) {
      console.error('Failed to copy logs:', error)
    }
  }

  const sortedJobs = [...jobs].sort((a, b) => {
    let aVal: any, bVal: any
    
    switch (sortField) {
      case 'triggeredAt':
        aVal = new Date(a.triggeredAt).getTime()
        bVal = new Date(b.triggeredAt).getTime()
        break
      case 'sourcesRequested':
        aVal = Array.isArray(a.sourcesRequested) ? a.sourcesRequested.length : 0
        bVal = Array.isArray(b.sourcesRequested) ? b.sourcesRequested.length : 0
        break
      case 'totalArticlesScraped':
        aVal = a.totalArticlesScraped || 0
        bVal = b.totalArticlesScraped || 0
        break
      case 'duration':
        aVal = a.duration || 0
        bVal = b.duration || 0
        break
      case 'status':
        aVal = a.status
        bVal = b.status
        break
      default:
        aVal = 0
        bVal = 0
    }
    
    if (sortDirection === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jobs Triggered</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.jobsTriggered || 0}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.successRate || 0}%</div>
            <p className="text-xs text-muted-foreground">Completed jobs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Articles Scraped</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.articlesScraped || 0}</div>
            <p className="text-xs text-muted-foreground">Total content</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(metrics?.averageJobDuration)}</div>
            <p className="text-xs text-muted-foreground">Per job</p>
          </CardContent>
        </Card>
      </div>

      {/* Job History Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Jobs</CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchData}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {jobs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No jobs found. Start a new scraping job to see it here.
            </div>
          ) : (
            <TooltipProvider delayDuration={0}>
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('triggeredAt')}
                  >
                    <div className="flex items-center gap-2">
                      Timestamp
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('sourcesRequested')}
                  >
                    <div className="flex items-center gap-2">
                      Sources
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Requested Articles</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('totalArticlesScraped')}
                  >
                    <div className="flex items-center gap-2">
                      Scraped
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('duration')}
                  >
                    <div className="flex items-center gap-2">
                      Duration
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-2">
                      Status
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Expand</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedJobs.map(job => (
                  <React.Fragment key={job.id}>
                    <TableRow>
                      <TableCell className="font-medium">
                        {new Date(job.triggeredAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span 
                              className="cursor-pointer hover:text-blue-600 transition-colors"
                              onMouseEnter={() => {
                                if (!jobLogs[job.id]) {
                                  fetchJobLogs(job.id)
                                }
                              }}
                            >
                              {Array.isArray(job.sourcesRequested) ? job.sourcesRequested.length : 0}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs p-3">
                            {Array.isArray(job.sourcesRequested) && job.sourcesRequested.length > 0 ? (
                              <div className="space-y-1">
                                <div className="font-medium text-sm mb-2">Sources:</div>
                                {(() => {
                                  const sourceStats = calculatePerSourceStats(job)
                                  return job.sourcesRequested.map((source, index) => {
                                    const stats = sourceStats[source]
                                    return (
                                      <div key={index} className="text-xs flex justify-between items-center">
                                        <span>• {source}</span>
                                        <span className="ml-2 text-muted-foreground">
                                          ({stats.scraped}/{stats.requested})
                                        </span>
                                      </div>
                                    )
                                  })
                                })()}
                              </div>
                            ) : (
                              <div className="text-xs">No sources</div>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        {Array.isArray(job.sourcesRequested) ? job.sourcesRequested.length * job.articlesPerSource : 0}
                      </TableCell>
                      <TableCell>
                        {job.totalArticlesScraped || 0}
                      </TableCell>
                      <TableCell>
                        {formatDuration(job.duration)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(job.status)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(job.status)}`}>
                            {job.status}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleJobExpanded(job.id)}
                        >
                          {expandedJobs.has(job.id) ? 
                            <ChevronDown className="h-4 w-4" /> : 
                            <ChevronRight className="h-4 w-4" />
                          }
                        </Button>
                      </TableCell>
                    </TableRow>
                    
                    {expandedJobs.has(job.id) && jobLogs[job.id] && (
                      <TableRow>
                        <TableCell colSpan={7} className="bg-muted/20">
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="text-sm font-medium">Job Logs</div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyJobLogs(job.id)}
                                className="flex items-center gap-2 h-8"
                              >
                                {copiedJobId === job.id ? (
                                  <>
                                    <Check className="h-3 w-3" />
                                    Copied
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3 w-3" />
                                    Copy All
                                  </>
                                )}
                              </Button>
                            </div>
                            <div className="border rounded-lg bg-background">
                              <div className="bg-muted/50 px-3 py-2 border-b text-xs font-mono text-muted-foreground">
                                Job Log Viewer - {(jobLogs[job.id] || []).length} entries
                              </div>
                              <div className="max-h-96 overflow-y-auto font-mono text-xs">
                                {(jobLogs[job.id] || []).map((log, index) => {
                                  const timestamp = new Date(log.timestamp).toISOString()
                                  const fullLogData = {
                                    timestamp,
                                    level: log.logLevel,
                                    message: log.message,
                                    sourceName: log.sourceName,
                                    additionalData: log.additionalData
                                  }
                                  
                                  return (
                                    <div 
                                      key={log.id}
                                      className="flex border-b border-muted/30 hover:bg-muted/20"
                                    >
                                      <div className="flex-shrink-0 w-24 px-3 py-2 bg-muted/30 text-muted-foreground border-r border-muted/30 text-right">
                                        {String(index + 1).padStart(3, '0')}
                                      </div>
                                      <div className="flex-1 px-3 py-2">
                                        <div className="flex items-start gap-2">
                                          <span className="text-muted-foreground">
                                            [{timestamp}]
                                          </span>
                                          <div className="flex-1">
                                            <pre className="whitespace-pre-wrap text-foreground break-words">
                                              {JSON.stringify(fullLogData, null, 2)}
                                            </pre>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
              </Table>
            </TooltipProvider>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 