"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import { Badge } from '@/components/ui/badge'
import { 
  Plus,
  Edit,
  Trash2,
  TestTube,
  Globe,
  Clock,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react'
import { NewsSource } from '../types'

export function SourcesTab() {
  const [sources, setSources] = useState<NewsSource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [testingSource, setTestingSource] = useState<string | null>(null)

  useEffect(() => {
    fetchSources()
  }, [])

  const fetchSources = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/scraper/sources')
      const data = await response.json()
      setSources(data.sources || [])
    } catch (error) {
      console.error('Failed to fetch sources:', error)
    } finally {
      setIsLoading(false)
    }
  }



  const handleTestFeed = async (sourceId: string) => {
    setTestingSource(sourceId)
    try {
      const response = await fetch(`/api/scraper/sources/${sourceId}/test`, {
        method: 'POST'
      })
      
      const result = await response.json()
      
      // Show result to user (could use a toast notification here)
      if (result.valid) {
        alert('RSS feed is valid and accessible!')
      } else {
        alert(`RSS feed test failed: ${result.error}`)
      }
    } catch (error) {
      alert('Failed to test RSS feed')
    } finally {
      setTestingSource(null)
    }
  }

  const handleDeleteSource = async (sourceId: string) => {
    if (!confirm('Are you sure you want to delete this source?')) return
    
    try {
      const response = await fetch(`/api/scraper/sources/${sourceId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setSources(prev => prev.filter(source => source.id !== sourceId))
      }
    } catch (error) {
      console.error('Failed to delete source:', error)
    }
  }

  const formatDate = (date?: string) => {
    if (!date) return 'Never'
    return new Date(date).toLocaleDateString()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">News Sources</h2>
        <Button disabled>
          <Plus className="h-4 w-4 mr-2" />
          Add Source
        </Button>
      </div>

      <div className="grid gap-4">
        {sources.map(source => (
          <Card key={source.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{source.name}</CardTitle>
                  <CardDescription>{source.domain}</CardDescription>
                </div>
                <Badge variant="default">Active</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Globe className="h-3 w-3" />
                    <span className="font-mono text-xs">{source.rssUrl}</span>
                  </div>
                  
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Delay: {source.delayBetweenRequests}ms</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Created: {formatDate(source.createdAt)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestFeed(source.id)}
                    disabled={testingSource === source.id}
                  >
                    {testingSource === source.id ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <TestTube className="h-4 w-4 mr-2" />
                    )}
                    Test Feed
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteSource(source.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {sources.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">
                No sources configured. Add a source to start scraping content.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 