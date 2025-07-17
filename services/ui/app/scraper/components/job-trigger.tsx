"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
// import { useToast } from '@/hooks/use-toast'
import { Play, ChevronDown } from 'lucide-react'
import { NewsSource } from '../types'

interface JobTriggerProps {
  onJobStart: (jobId: string) => void
}

export function JobTrigger({ onJobStart }: JobTriggerProps) {
  const [sources, setSources] = useState<NewsSource[]>([])
  const [selectedSources, setSelectedSources] = useState<string[]>([])
  const [articlesPerSource, setArticlesPerSource] = useState(5)
  const [showDialog, setShowDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchSources()
  }, [])

  const fetchSources = async () => {
    try {
      const response = await fetch('/api/scraper/sources')
      const data = await response.json()
      setSources(data.sources || [])
    } catch (error) {
      console.error('Failed to fetch sources:', error)
    }
  }

  const handleSourceToggle = (sourceName: string) => {
    setSelectedSources(prev =>
      prev.includes(sourceName)
        ? prev.filter(s => s !== sourceName)
        : [...prev, sourceName]
    )
  }

  const handleTriggerJob = async () => {
    if (selectedSources.length === 0) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/scraper/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sources: selectedSources,
          maxArticles: articlesPerSource
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        onJobStart(data.jobId)
        setShowDialog(false)
        setSelectedSources([])
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="gap-2">
            <Play className="h-4 w-4" />
            Start Scraping
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Select Sources</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {sources.map(source => (
            <DropdownMenuCheckboxItem
              key={source.id}
              checked={selectedSources.includes(source.name)}
              onCheckedChange={() => handleSourceToggle(source.name)}
            >
              {source.name}
            </DropdownMenuCheckboxItem>
          ))}
          {sources.length === 0 && (
            <DropdownMenuItem disabled>No sources available</DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={() => setShowDialog(true)}
            disabled={selectedSources.length === 0}
          >
            Configure & Start ({selectedSources.length} selected)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure Scraping Job</DialogTitle>
            <DialogDescription>
              Set the number of articles to scrape from each selected source.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Selected Sources</Label>
              <div className="text-sm text-muted-foreground">
                {selectedSources.join(', ') || 'No sources selected'}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="articles">Articles per source</Label>
              <Input
                id="articles"
                type="number"
                min="1"
                max="100"
                value={articlesPerSource}
                onChange={(e) => setArticlesPerSource(parseInt(e.target.value) || 5)}
              />
              <p className="text-sm text-muted-foreground">
                Total articles to scrape: {selectedSources.length * articlesPerSource}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleTriggerJob} disabled={isLoading}>
              {isLoading ? 'Starting...' : 'Start Scraping'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 