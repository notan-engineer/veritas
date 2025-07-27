"use client"

import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Plus,
  Edit,
  Trash2,
  TestTube,
  ArrowUpDown,
  Loader2
} from 'lucide-react'
import { NewsSource } from '../types'

interface SourceFormData {
  name: string;
  domain: string;
  rssUrl: string;
  respectRobotsTxt: boolean;
  delayBetweenRequests: number;
  userAgent: string;
  timeoutMs: number;
}

export function SourcesTab() {
  const [sources, setSources] = useState<NewsSource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [testingSource, setTestingSource] = useState<string | null>(null)
  const [sortField, setSortField] = useState<keyof NewsSource>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [selectedSource, setSelectedSource] = useState<NewsSource | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formData, setFormData] = useState<SourceFormData>({
    name: '',
    domain: '',
    rssUrl: '',
    respectRobotsTxt: true,
    delayBetweenRequests: 1000,
    userAgent: 'Veritas-Scraper/1.0',
    timeoutMs: 30000
  })
  const [formLoading, setFormLoading] = useState(false)

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

  useEffect(() => {
    fetchSources()
  }, [])

  const sortedSources = useMemo(() => {
    return [...sources].sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]
      
      // Handle different data types
      let comparison = 0
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        comparison = aVal.localeCompare(bVal)
      } else if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal
      } else {
        comparison = String(aVal).localeCompare(String(bVal))
      }
      
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [sources, sortField, sortDirection])

  const handleSort = (field: keyof NewsSource) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
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

  const handleCreateSource = () => {
    setSelectedSource(null)
    setFormData({
      name: '',
      domain: '',
      rssUrl: '',
      respectRobotsTxt: true,
      delayBetweenRequests: 1000,
      userAgent: 'Veritas-Scraper/1.0',
      timeoutMs: 30000
    })
    setIsFormOpen(true)
  }

  const handleEditSource = (source: NewsSource) => {
    setSelectedSource(source)
    setFormData({
      name: source.name,
      domain: source.domain,
      rssUrl: source.rssUrl,
      respectRobotsTxt: source.respectRobotsTxt,
      delayBetweenRequests: source.delayBetweenRequests,
      userAgent: source.userAgent,
      timeoutMs: source.timeoutMs
    })
    setIsFormOpen(true)
  }

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Prevent duplicate submissions
    if (formLoading) return
    
    // Basic validation
    if (!formData.name.trim() || !formData.domain.trim() || !formData.rssUrl.trim()) {
      alert('Please fill in all required fields (Name, Domain, RSS URL)')
      return
    }
    
    setFormLoading(true)
    
    try {
      const method = selectedSource ? 'PUT' : 'POST'
      const body = selectedSource 
        ? { ...formData, id: selectedSource.id }
        : formData
      
      console.log('Submitting form:', { method, body }) // Debug log
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
      
      const response = await fetch('/api/scraper/sources', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)

      const result = await response.json()
      console.log('API response:', result) // Debug log
      
      if (result.success) {
        setIsFormOpen(false)
        fetchSources()
        alert(selectedSource ? 'Source updated successfully!' : 'Source created successfully!')
      } else {
        alert('Error: ' + result.error)
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          alert('Request timed out. Please try again.')
        } else {
          alert('Error submitting form: ' + error.message)
        }
      } else {
        alert('Error submitting form: Unknown error')
      }
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteSource = async (sourceId: string) => {
    if (!confirm('Are you sure you want to delete this source?')) return
    
    try {
      const response = await fetch(`/api/scraper/sources?id=${sourceId}`, {
        method: 'DELETE'
      })
      
      const result = await response.json()
      
      if (result.success) {
        setSources(prev => prev.filter(source => source.id !== sourceId))
        alert('Source deleted successfully!')
      } else {
        alert('Error deleting source: ' + result.error)
      }
    } catch (error) {
      console.error('Failed to delete source:', error)
      alert('Error deleting source')
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
        <Button onClick={handleCreateSource}>
          <Plus className="h-4 w-4 mr-2" />
          Add Source
        </Button>
      </div>

      {sources.length === 0 && !isLoading ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              No sources configured. Add a source to start scraping content.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer w-[200px]" onClick={() => handleSort('name')}>
                  <div className="flex items-center space-x-1">
                    <span>Name</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer hidden sm:table-cell" onClick={() => handleSort('rssUrl')}>
                  <div className="flex items-center space-x-1">
                    <span>RSS URL</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer w-[120px]" onClick={() => handleSort('createdAt')}>
                  <div className="flex items-center space-x-1">
                    <span>Created</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="w-[200px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedSources.map((source) => (
                <TableRow key={source.id}>
                  <TableCell className="font-medium">
                    <div className="space-y-1">
                      <div>{source.name}</div>
                      <div className="text-xs text-muted-foreground">{source.domain}</div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell max-w-xs truncate" title={source.rssUrl}>
                    <span className="font-mono text-xs">{source.rssUrl}</span>
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDate(source.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleTestFeed(source.id)}
                        disabled={testingSource === source.id}
                        title="Test Feed"
                      >
                        {testingSource === source.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <TestTube className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditSource(source)}
                        title="Edit Source"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteSource(source.id)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Source Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {selectedSource ? 'Edit Source' : 'Add New Source'}
              </CardTitle>
              <CardDescription>
                {selectedSource ? 'Update source configuration' : 'Configure a new news source for scraping'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitForm} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Name</label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="CNN News"
                    required
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Domain</label>
                  <Input
                    type="text"
                    value={formData.domain}
                    onChange={(e) => setFormData({...formData, domain: e.target.value})}
                    placeholder="cnn.com"
                    required
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">RSS Feed URL</label>
                  <Input
                    type="url"
                    value={formData.rssUrl}
                    onChange={(e) => setFormData({...formData, rssUrl: e.target.value})}
                    placeholder="https://feeds.cnn.com/rss/edition.rss"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">User Agent</label>
                    <Input
                      type="text"
                      value={formData.userAgent}
                      onChange={(e) => setFormData({...formData, userAgent: e.target.value})}
                      placeholder="Veritas-Scraper/1.0"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-1 block">Timeout (ms)</label>
                    <Input
                      type="number"
                      value={formData.timeoutMs.toString()}
                      onChange={(e) => setFormData({...formData, timeoutMs: parseInt(e.target.value) || 30000})}
                      min="1000"
                      max="60000"
                      placeholder="30000"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Delay Between Requests (ms)</label>
                    <Input
                      type="number"
                      value={formData.delayBetweenRequests.toString()}
                      onChange={(e) => setFormData({...formData, delayBetweenRequests: parseInt(e.target.value) || 1000})}
                      min="0"
                      max="10000"
                      placeholder="1000"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="respectRobotsTxt"
                      checked={formData.respectRobotsTxt}
                      onChange={(e) => setFormData({...formData, respectRobotsTxt: e.target.checked})}
                      className="rounded"
                    />
                    <label htmlFor="respectRobotsTxt" className="text-sm">Respect robots.txt</label>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsFormOpen(false)}
                    disabled={formLoading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={formLoading}>
                    {formLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        {selectedSource ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      selectedSource ? 'Update Source' : 'Create Source'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 