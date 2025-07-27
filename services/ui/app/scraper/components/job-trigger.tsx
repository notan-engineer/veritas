"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
// import { useToast } from '@/hooks/use-toast'
import { Play } from 'lucide-react'
import { NewsSource } from '../types'

interface JobTriggerProps {
  onJobStart: (jobId: string) => void
}

export function JobTrigger({ onJobStart }: JobTriggerProps) {
  const [sources, setSources] = useState<NewsSource[]>([])
  const [selectedSources, setSelectedSources] = useState<Set<string>>(new Set())
  const [articlesPerSource, setArticlesPerSource] = useState(10)
  const [showDialog, setShowDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchSources()
  }, [])

  const fetchSources = async () => {
    try {
      const response = await fetch('/api/scraper/sources')
      const data = await response.json()
      const fetchedSources = data.sources || []
      setSources(fetchedSources)
      // Select all sources by default
      setSelectedSources(new Set(fetchedSources.map((s: NewsSource) => s.name)))
    } catch (error) {
      console.error('Failed to fetch sources:', error)
    }
  }

  const handleSourceToggle = (sourceName: string) => {
    setSelectedSources(prev => {
      const next = new Set(prev)
      if (next.has(sourceName)) {
        next.delete(sourceName)
      } else {
        next.add(sourceName)
      }
      return next
    })
  }

  const handleSelectAll = () => {
    setSelectedSources(new Set(sources.map(s => s.name)))
  }

  const handleSelectNone = () => {
    setSelectedSources(new Set())
  }

  const handleTriggerJob = async () => {
    if (selectedSources.size === 0) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/scraper/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sources: Array.from(selectedSources),
          maxArticles: articlesPerSource
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        onJobStart(data.jobId)
        setShowDialog(false)
        // Keep sources selected for next use
      } else {
        console.error('Failed to trigger job:', data.message)
      }
    } catch (error) {
      console.error('Error triggering job:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button onClick={() => setShowDialog(true)} className="gap-2">
        <Play className="h-4 w-4" />
        Trigger Scraping Job
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configure Scraping Job</DialogTitle>
            <DialogDescription>
              Select sources and configure the number of articles to scrape from each.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Source selection */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label className="text-base font-semibold">Select Sources</Label>
                <div className="space-x-2">
                  <Button size="sm" variant="outline" onClick={handleSelectAll}>
                    Select All
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleSelectNone}>
                    Select None
                  </Button>
                </div>
              </div>
              
              <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
                {sources.map(source => (
                  <label key={source.id} className="flex items-center space-x-2 py-1 cursor-pointer">
                    <Checkbox
                      checked={selectedSources.has(source.name)}
                      onCheckedChange={() => handleSourceToggle(source.name)}
                    />
                    <span className="text-sm">{source.name}</span>
                  </label>
                ))}
                {sources.length === 0 && (
                  <div className="text-sm text-muted-foreground">No sources available</div>
                )}
              </div>
            </div>

            {/* Articles per source */}
            <div>
              <Label htmlFor="articles" className="text-base font-semibold">
                Articles per source
              </Label>
              <Input
                id="articles"
                type="number"
                min="1"
                max="1000"
                value={articlesPerSource}
                onChange={(e) => setArticlesPerSource(Number(e.target.value) || 10)}
                className="mt-2"
              />
            </div>

            {/* Summary */}
            <div className="bg-muted p-3 rounded-md">
              <p className="text-sm">
                <strong>Summary:</strong> Scraping {selectedSources.size} sources 
                for {articlesPerSource} articles each 
                (~{selectedSources.size * articlesPerSource} total articles)
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleTriggerJob} 
              disabled={selectedSources.size === 0 || isLoading}
            >
              {isLoading ? 'Starting...' : 'Start Scraping'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 