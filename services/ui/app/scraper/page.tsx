"use client"

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { JobTrigger } from './components/job-trigger'
import { DashboardTab } from './components/dashboard-tab'
import { ContentTab } from './components/content-tab'
import { SourcesTab } from './components/sources-tab'
import { BarChart3, FileText, Database } from 'lucide-react'

export default function ScraperPage() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleJobStart = (jobId: string) => {
    // Trigger refresh of dashboard when a new job starts
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Scraper Management</h1>
        <JobTrigger onJobStart={handleJobStart} />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Content
          </TabsTrigger>
          <TabsTrigger value="sources" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Sources
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <DashboardTab refreshTrigger={refreshTrigger} />
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <ContentTab />
        </TabsContent>

        <TabsContent value="sources" className="space-y-4">
          <SourcesTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}