"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Globe, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Loader2,
  Settings,
  ExternalLink,
  Calendar,
  TrendingUp,
  TrendingDown,
  Activity
} from "lucide-react";

interface Source {
  id: string;
  name: string;
  domain: string;
  rssUrl: string;
  respectRobotsTxt: boolean;
  delayBetweenRequests: number;
  userAgent: string;
  timeoutMs: number;
  createdAt: string;
  health?: {
    isHealthy: boolean;
    averageResponseTime: number;
    errorCount: number;
    totalScrapes: number;
  };
}

interface SourceFormData {
  name: string;
  domain: string;
  rssUrl: string;
  respectRobotsTxt: boolean;
  delayBetweenRequests: number;
  userAgent: string;
  timeoutMs: number;
}

export function SourceManagement() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<SourceFormData>({
    name: '',
    domain: '',
    rssUrl: '',
    respectRobotsTxt: true,
    delayBetweenRequests: 1000,
    userAgent: 'Veritas-Scraper/1.0',
    timeoutMs: 30000
  });
  const [formLoading, setFormLoading] = useState(false);

  // Load sources
  useEffect(() => {
    loadSources();
  }, []);

  const loadSources = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/scraper/sources?includeHealth=true');
      const result = await response.json();
      
      if (result.success) {
        setSources(result.data.sources);
      } else {
        console.error('Failed to load sources:', result.error);
      }
    } catch (error) {
      console.error('Error loading sources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSource = () => {
    setSelectedSource(null);
    setFormData({
      name: '',
      domain: '',
      rssUrl: '',
      respectRobotsTxt: true,
      delayBetweenRequests: 1000,
      userAgent: 'Veritas-Scraper/1.0',
      timeoutMs: 30000
    });
    setIsFormOpen(true);
  };

  const handleEditSource = (source: Source) => {
    setSelectedSource(source);
    setFormData({
      name: source.name,
      domain: source.domain,
      rssUrl: source.rssUrl,
      respectRobotsTxt: source.respectRobotsTxt,
      delayBetweenRequests: source.delayBetweenRequests,
      userAgent: source.userAgent,
      timeoutMs: source.timeoutMs
    });
    setIsFormOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    
    try {
      const method = selectedSource ? 'PUT' : 'POST';
      const body = selectedSource 
        ? { ...formData, id: selectedSource.id }
        : formData;
      
      const response = await fetch('/api/scraper/sources', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();
      
      if (result.success) {
        setIsFormOpen(false);
        loadSources();
        alert(selectedSource ? 'Source updated successfully!' : 'Source created successfully!');
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting form');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteSource = async (sourceId: string) => {
    if (!confirm('Are you sure you want to delete this source?')) {
      return;
    }

    try {
      const response = await fetch(`/api/scraper/sources?id=${sourceId}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (result.success) {
        loadSources();
        alert('Source deleted successfully!');
      } else {
        alert('Error deleting source: ' + result.error);
      }
    } catch (error) {
      console.error('Error deleting source:', error);
      alert('Error deleting source');
    }
  };



  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getHealthBadge = (source: Source) => {
    if (!source.health) return null;
    
    return source.health.isHealthy ? (
      <Badge variant="default" className="text-xs">
        <CheckCircle className="h-3 w-3 mr-1" />
        Healthy
      </Badge>
    ) : (
      <Badge variant="destructive" className="text-xs">
        <XCircle className="h-3 w-3 mr-1" />
        Unhealthy
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading sources...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Source Management</h3>
          <p className="text-sm text-muted-foreground">
            Manage news sources for content scraping
          </p>
        </div>
        <Button onClick={handleCreateSource} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Source
        </Button>
      </div>

      {/* Sources Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sources ({sources.length})</CardTitle>
          <CardDescription>
            Active news sources with health metrics and status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sources.length === 0 ? (
            <div className="text-center py-8">
              <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No sources available</h3>
              <p className="text-muted-foreground mb-4">
                Add your first news source to start scraping content
              </p>
              <Button onClick={handleCreateSource}>
                <Plus className="h-4 w-4 mr-2" />
                Add Source
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 font-medium text-sm">Source</th>
                    <th className="text-left py-3 px-2 font-medium text-sm">Domain</th>
                    <th className="text-left py-3 px-2 font-medium text-sm">Status</th>
                    <th className="text-left py-3 px-2 font-medium text-sm">Health</th>
                    <th className="text-left py-3 px-2 font-medium text-sm">Success Rate</th>
                    <th className="text-left py-3 px-2 font-medium text-sm">Response Time</th>
                    <th className="text-left py-3 px-2 font-medium text-sm">Last Scraped</th>
                    <th className="text-right py-3 px-2 font-medium text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sources.map((source) => (
                    <tr key={source.id} className="hover:bg-muted/50">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium text-sm">{source.name}</div>
                            <div className="text-xs text-muted-foreground line-clamp-1">
                              RSS Feed Source
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="text-sm">{source.domain}</div>
                        <div className="text-xs text-muted-foreground">
                          <a 
                            href={source.rssUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:underline inline-flex items-center gap-1"
                          >
                            RSS Feed <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <Badge variant="default" className="text-xs">
                          Active
                        </Badge>
                      </td>
                      <td className="py-3 px-2">
                        {getHealthBadge(source)}
                      </td>
                      <td className="py-3 px-2">
                        <div className="text-sm font-medium">
                          N/A
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="text-sm">
                          {source.health ? `${source.health.averageResponseTime}ms` : 'N/A'}
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Never</span>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditSource(source)}
                            title="Edit source"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSource(source.id)}
                            title="Delete source"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional source metrics card if needed */}
      {sources.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Source Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-2xl font-bold">{sources.length}</div>
                <div className="text-sm text-muted-foreground">Total Sources</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {sources.length}
                </div>
                <div className="text-sm text-muted-foreground">Active</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {sources.filter(s => s.health?.isHealthy).length}
                </div>
                <div className="text-sm text-muted-foreground">Healthy</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  N/A
                </div>
                <div className="text-sm text-muted-foreground">Avg Success Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
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
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-border rounded-md text-sm"
                    placeholder="CNN News"
                    required
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Domain</label>
                  <input
                    type="text"
                    value={formData.domain}
                    onChange={(e) => setFormData({...formData, domain: e.target.value})}
                    className="w-full px-3 py-2 border border-border rounded-md text-sm"
                    placeholder="cnn.com"
                    required
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">RSS Feed URL</label>
                  <input
                    type="url"
                    value={formData.rssUrl}
                    onChange={(e) => setFormData({...formData, rssUrl: e.target.value})}
                    className="w-full px-3 py-2 border border-border rounded-md text-sm"
                    placeholder="https://feeds.cnn.com/rss/edition.rss"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">User Agent</label>
                    <input
                      type="text"
                      value={formData.userAgent}
                      onChange={(e) => setFormData({...formData, userAgent: e.target.value})}
                      className="w-full px-3 py-2 border border-border rounded-md text-sm"
                      placeholder="Veritas-Scraper/1.0"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-1 block">Timeout (ms)</label>
                    <input
                      type="number"
                      value={formData.timeoutMs}
                      onChange={(e) => setFormData({...formData, timeoutMs: parseInt(e.target.value) || 30000})}
                      className="w-full px-3 py-2 border border-border rounded-md text-sm"
                      min="1000"
                      max="60000"
                      placeholder="30000"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Delay Between Requests (ms)</label>
                    <input
                      type="number"
                      value={formData.delayBetweenRequests}
                      onChange={(e) => setFormData({...formData, delayBetweenRequests: parseInt(e.target.value) || 1000})}
                      className="w-full px-3 py-2 border border-border rounded-md text-sm"
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
  );
} 