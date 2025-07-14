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
  TestTube,
  ToggleLeft,
  ToggleRight,
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
  url: string;
  rssUrl: string;
  description: string;
  isActive: boolean;
  isEnabled: boolean;
  successRate: number;
  lastScrapedAt?: string;
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
  url: string;
  rssUrl: string;
  description: string;
  isActive: boolean;
  isEnabled: boolean;
}

export function SourceManagement() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<SourceFormData>({
    name: '',
    domain: '',
    url: '',
    rssUrl: '',
    description: '',
    isActive: true,
    isEnabled: true
  });
  const [formLoading, setFormLoading] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, any>>({});

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
      url: '',
      rssUrl: '',
      description: '',
      isActive: true,
      isEnabled: true
    });
    setIsFormOpen(true);
  };

  const handleEditSource = (source: Source) => {
    setSelectedSource(source);
    setFormData({
      name: source.name,
      domain: source.domain,
      url: source.url,
      rssUrl: source.rssUrl,
      description: source.description,
      isActive: source.isActive,
      isEnabled: source.isEnabled
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

  const handleToggleEnabled = async (sourceId: string, enabled: boolean) => {
    try {
      const response = await fetch('/api/scraper/sources', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: enabled ? 'bulk-enable' : 'bulk-disable',
          sourceIds: [sourceId]
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        loadSources();
      } else {
        alert('Error toggling source: ' + result.error);
      }
    } catch (error) {
      console.error('Error toggling source:', error);
      alert('Error toggling source');
    }
  };

  const handleTestSource = async (sourceId: string) => {
    try {
      const response = await fetch('/api/scraper/sources', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'test',
          sourceId
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setTestResults(prev => ({
          ...prev,
          [sourceId]: result.data
        }));
      } else {
        alert('Error testing source: ' + result.error);
      }
    } catch (error) {
      console.error('Error testing source:', error);
      alert('Error testing source');
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

      {/* Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sources.map((source) => (
          <Card key={source.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{source.name}</span>
                    {getHealthBadge(source)}
                  </div>
                  
                  <div className="text-sm text-muted-foreground mb-2">
                    {source.domain}
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={source.isEnabled ? "default" : "secondary"}>
                      {source.isEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {source.successRate.toFixed(1)}% success
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {source.description}
                  </p>
                </div>
                
                <div className="flex items-center gap-1 ml-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleEnabled(source.id, !source.isEnabled)}
                  >
                    {source.isEnabled ? (
                      <ToggleRight className="h-4 w-4 text-green-500" />
                    ) : (
                      <ToggleLeft className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTestSource(source.id)}
                  >
                    <TestTube className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditSource(source)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSource(source.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              {/* Health Metrics */}
              {source.health && (
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div>
                    <div className="text-muted-foreground">Response Time</div>
                    <div className="font-medium">{source.health.averageResponseTime}ms</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Total Scrapes</div>
                    <div className="font-medium">{source.health.totalScrapes}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Error Count</div>
                    <div className="font-medium">{source.health.errorCount}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Last Scraped</div>
                    <div className="font-medium">
                      {source.lastScrapedAt ? formatDate(source.lastScrapedAt) : 'Never'}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Test Results */}
              {testResults[source.id] && (
                <div className="bg-muted/50 p-2 rounded text-xs">
                  <div className="font-medium mb-1">Test Results:</div>
                  <div className="text-muted-foreground">
                    {testResults[source.id].isValid ? (
                      <span className="text-green-600">✓ Valid RSS feed</span>
                    ) : (
                      <span className="text-red-600">✗ Invalid RSS feed</span>
                    )}
                  </div>
                  {testResults[source.id].rssItemCount && (
                    <div className="text-muted-foreground">
                      {testResults[source.id].rssItemCount} items found
                    </div>
                  )}
                </div>
              )}
              
              {/* Links */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={source.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Site
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href={source.rssUrl} target="_blank" rel="noopener noreferrer">
                    <Activity className="h-3 w-3 mr-1" />
                    RSS
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {sources.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <Settings className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No sources configured</h3>
            <p className="text-sm mb-4">Add your first news source to start scraping content</p>
            <Button onClick={handleCreateSource}>
              <Plus className="h-4 w-4 mr-2" />
              Add Source
            </Button>
          </div>
        )}
      </div>

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
                    placeholder="example.com"
                    required
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Website URL</label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({...formData, url: e.target.value})}
                    className="w-full px-3 py-2 border border-border rounded-md text-sm"
                    placeholder="https://example.com"
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
                    placeholder="https://example.com/rss"
                    required
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-border rounded-md text-sm"
                    rows={3}
                    placeholder="Brief description of the news source"
                    required
                  />
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      className="rounded"
                    />
                    <label htmlFor="isActive" className="text-sm">Active</label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isEnabled"
                      checked={formData.isEnabled}
                      onChange={(e) => setFormData({...formData, isEnabled: e.target.checked})}
                      className="rounded"
                    />
                    <label htmlFor="isEnabled" className="text-sm">Enabled</label>
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