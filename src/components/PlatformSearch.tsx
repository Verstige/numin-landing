import React, { useState, useEffect, useRef } from 'react';
import { Search, X, FileText, Mail, Users, Briefcase, Target, MessageSquare, Calendar, Database, Zap, DollarSign, Activity } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { novaDataAccess } from '@/lib/nova-data-access';
import { novaAI } from '@/lib/nova-ai-intelligence';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
  type: 'project' | 'email' | 'task' | 'contact' | 'deal' | 'note' | 'activity';
  id: string;
  title: string;
  description: string;
  metadata?: any;
  relevanceScore?: number;
}

interface PlatformSearchProps {
  onClose?: () => void;
  className?: string;
  onNavigateToTab?: (tab: string) => void;
}

export default function PlatformSearch({ onClose, className = "", onNavigateToTab }: PlatformSearchProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [aiInsights, setAiInsights] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const searchEverything = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setShowResults(false);
      setAiInsights('');
      return;
    }

    setIsSearching(true);
    
    try {
      // Get comprehensive search results from Nova AI data access
      const searchResults = await novaDataAccess.searchAllData(searchQuery);
      
      // Validate search results
      if (!searchResults || typeof searchResults !== 'object') {
        throw new Error('Invalid search results received');
      }
      
      // Format results for display
      const formattedResults: SearchResult[] = [];

      // Add projects
      if (Array.isArray(searchResults.projects)) {
        searchResults.projects.forEach(project => {
          if (project && project.id && project.name) {
            formattedResults.push({
              type: 'project',
              id: project.id,
              title: project.name,
              description: project.description || 'No description available',
              metadata: {
                status: project.status,
                priority: project.priority,
                progress: project.progress
              }
            });
          }
        });
      }

      // Add emails
      if (Array.isArray(searchResults.emails)) {
        searchResults.emails.forEach(email => {
          if (email && email.id && email.subject) {
            formattedResults.push({
              type: 'email',
              id: email.id,
              title: email.subject,
              description: `${email.from || 'Unknown'} → ${email.to || 'Unknown'}`,
              metadata: {
                timestamp: email.timestamp,
                isRead: email.isRead,
                isImportant: email.isImportant,
                sentiment: email.aiAnalysis?.sentiment
              }
            });
          }
        });
      }

      // Add tasks
      if (Array.isArray(searchResults.tasks)) {
        searchResults.tasks.forEach(task => {
          if (task && task.id && task.title) {
            formattedResults.push({
              type: 'task',
              id: task.id,
              title: task.title,
              description: task.description || 'No description available',
              metadata: {
                status: task.status,
                priority: task.priority,
                dueDate: task.dueDate,
                projectId: task.projectId
              }
            });
          }
        });
      }

      // Add contacts
      if (Array.isArray(searchResults.contacts)) {
        searchResults.contacts.forEach(contact => {
          if (contact && contact.id && contact.name) {
            formattedResults.push({
              type: 'contact',
              id: contact.id,
              title: contact.name,
              description: `${contact.company || 'Individual'} • ${contact.email || 'No email'}`,
              metadata: {
                status: contact.status,
                source: contact.source,
                lastContact: contact.lastContact
              }
            });
          }
        });
      }

      // Add deals
      if (Array.isArray(searchResults.deals)) {
        searchResults.deals.forEach(deal => {
          if (deal && deal.id && deal.title) {
            formattedResults.push({
              type: 'deal',
              id: deal.id,
              title: deal.title,
              description: `${deal.contactName || 'Unknown Contact'} • $${(deal.value || 0).toLocaleString()}`,
              metadata: {
                stage: deal.stage,
                probability: deal.probability,
                expectedCloseDate: deal.expectedCloseDate
              }
            });
          }
        });
      }

      // Add notes
      if (Array.isArray(searchResults.notes)) {
        searchResults.notes.forEach(note => {
          if (note && note.id && note.title) {
            const content = note.content || '';
            formattedResults.push({
              type: 'note',
              id: note.id,
              title: note.title,
              description: content.length > 100 ? content.substring(0, 100) + '...' : content || 'No content',
              metadata: {
                type: note.type,
                projectId: note.projectId,
                createdAt: note.createdAt
              }
            });
          }
        });
      }

      // Sort by relevance (projects first, then by title)
      formattedResults.sort((a, b) => {
        const typeOrder = ['project', 'contact', 'deal', 'email', 'task', 'note'];
        const aIndex = typeOrder.indexOf(a.type);
        const bIndex = typeOrder.indexOf(b.type);
        
        if (aIndex !== bIndex) {
          return aIndex - bIndex;
        }
        
        return a.title.localeCompare(b.title);
      });

      setResults(formattedResults);
      setShowResults(true);

      // Get AI insights about the search
      if (formattedResults.length > 0) {
        try {
          const aiResponse = await novaAI.processQuery(`Search results for "${searchQuery}": Found ${formattedResults.length} results. Provide insights about these results.`);
          setAiInsights(aiResponse.response || `Found ${formattedResults.length} relevant results for "${searchQuery}".`);
        } catch (error) {
          console.error('AI insights error:', error);
          setAiInsights(`Found ${formattedResults.length} relevant results for "${searchQuery}".`);
        }
      } else {
        setAiInsights(`No results found for "${searchQuery}". Try different keywords or check if the information exists in your workspace.`);
      }

    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to search platform data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    const timeoutId = setTimeout(() => {
      searchEverything(searchQuery);
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'project': return <Briefcase className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'task': return <Target className="w-4 h-4" />;
      case 'contact': return <Users className="w-4 h-4" />;
      case 'deal': return <DollarSign className="w-4 h-4" />;
      case 'note': return <FileText className="w-4 h-4" />;
      case 'activity': return <Activity className="w-4 h-4" />;
      default: return <Search className="w-4 h-4" />;
    }
  };

  const getResultColor = (type: string) => {
    switch (type) {
      case 'project': return 'text-blue-500';
      case 'email': return 'text-green-500';
      case 'task': return 'text-orange-500';
      case 'contact': return 'text-purple-500';
      case 'deal': return 'text-emerald-500';
      case 'note': return 'text-yellow-500';
      case 'activity': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const handleResultClick = (result: SearchResult) => {
    try {
      // Handle navigation based on result type
      switch (result.type) {
        case 'project':
          // Navigate to business map tab and highlight the project
          onNavigateToTab?.('mindmap');
          toast({
            title: "Project Found",
            description: `Opening project: ${result.title}`,
          });
          break;
        case 'email':
          // Navigate to email tab
          onNavigateToTab?.('email');
          toast({
            title: "Email Found",
            description: `Opening email: ${result.title}`,
          });
          break;
        case 'task':
          // Navigate to tasks tab
          onNavigateToTab?.('tasks');
          toast({
            title: "Task Found",
            description: `Opening task: ${result.title}`,
          });
          break;
        case 'contact':
          // Navigate to connections/CRM tab
          onNavigateToTab?.('crm');
          toast({
            title: "Contact Found",
            description: `Opening contact: ${result.title}`,
          });
          break;
        case 'deal':
          // Navigate to connections/CRM tab
          onNavigateToTab?.('crm');
          toast({
            title: "Deal Found",
            description: `Opening deal: ${result.title}`,
          });
          break;
        case 'note':
          // Navigate to notes tab
          onNavigateToTab?.('notes');
          toast({
            title: "Note Found",
            description: `Opening note: ${result.title}`,
          });
          break;
        case 'activity':
          // Navigate to activity feed (could be in dashboard)
          onNavigateToTab?.('mindmap'); // Default to main view
          toast({
            title: "Activity Found",
            description: `Opening activity: ${result.title}`,
          });
          break;
      }
    } catch (error) {
      console.error('Navigation error:', error);
      toast({
        title: "Navigation Error",
        description: "Failed to navigate to the selected item. Please try again.",
        variant: "destructive",
      });
    }
    
    // Close search results
    setShowResults(false);
    setQuery('');
    onClose?.();
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-400" />
        <Input
          ref={inputRef}
          placeholder="Search everything across the platform..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-9 bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground focus:border-blue-500/50 focus:ring-blue-500/20 backdrop-blur-sm"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery('');
              setResults([]);
              setShowResults(false);
              setAiInsights('');
            }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* Search Results */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto scrollbar-none">
          {/* AI Insights */}
          {aiInsights && (
            <div className="p-3 border-b border-border bg-gradient-to-r from-blue-500/10 to-purple-500/5">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-semibold text-foreground">AI Insights</span>
              </div>
              <p className="text-sm text-muted-foreground">{aiInsights}</p>
            </div>
          )}

          {/* Results Header */}
          <div className="p-3 border-b border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">
                {results.length} result{results.length !== 1 ? 's' : ''} found
              </span>
              <Badge variant="outline" className="text-xs">
                Platform Search
              </Badge>
            </div>
          </div>

          {/* Results List */}
          <div className="max-h-64 overflow-y-auto scrollbar-none">
            {results.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No results found</p>
                <p className="text-xs">Try different keywords</p>
              </div>
            ) : (
              results.map((result, index) => (
                <div
                  key={`${result.type}-${result.id}`}
                  className="p-3 hover:bg-background/50 cursor-pointer border-b border-border/50 last:border-b-0"
                  onClick={() => handleResultClick(result)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 mt-0.5 ${getResultColor(result.type)}`}>
                      {getResultIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-foreground truncate">
                          {result.title}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {result.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {result.description}
                      </p>
                      {result.metadata && (
                        <div className="flex items-center gap-2 mt-1">
                          {result.metadata.status && (
                            <Badge variant="secondary" className="text-xs">
                              {result.metadata.status}
                            </Badge>
                          )}
                          {result.metadata.priority && (
                            <Badge variant="secondary" className="text-xs">
                              {result.metadata.priority}
                            </Badge>
                          )}
                          {result.metadata.stage && (
                            <Badge variant="secondary" className="text-xs">
                              {result.metadata.stage}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-border bg-background/50">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Searches across: Projects, Emails, Tasks, Contacts, Deals, Notes</span>
              <span>Powered by Nova AI</span>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isSearching && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-lg z-50 p-4">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
            <span className="text-sm text-muted-foreground">Searching across platform...</span>
          </div>
        </div>
      )}
    </div>
  );
}
