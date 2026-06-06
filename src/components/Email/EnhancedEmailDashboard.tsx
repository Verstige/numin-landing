import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mail, 
  Search, 
  Plus, 
  Inbox, 
  Send, 
  Trash, 
  Star, 
  Archive, 
  Tag,
  MoreHorizontal,
  Paperclip,
  Reply,
  Forward,
  Download,
  Filter,
  Settings,
  RefreshCw,
  Brain,
  Zap,
  MessageSquare,
  Sparkles,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  Edit3
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AIIntelligencePanel from './AIIntelligencePanel';
import AIDraftSuggestions from './AIDraftSuggestions';
import { 
  aiEmailService, 
  EmailAnalysis, 
  AIEmailDraft, 
  EmailContext 
} from '@/lib/ai-email-service';

// Types
interface Email {
  id: string;
  from: string;
  to: string;
  subject: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  isStarred: boolean;
  isImportant: boolean;
  folder: string;
  attachments?: string[];
  tags: string[];
}

interface Folder {
  id: string;
  name: string;
  count: number;
  icon: React.ReactNode;
}

export default function EnhancedEmailDashboard() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [selectedFolder, setSelectedFolder] = useState('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [activeTab, setActiveTab] = useState<'emails' | 'ai-assistant'>('emails');
  
  // AI Analysis States
  const [emailAnalysis, setEmailAnalysis] = useState<EmailAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiDrafts, setAiDrafts] = useState<AIEmailDraft[]>([]);
  const [isGeneratingDrafts, setIsGeneratingDrafts] = useState(false);

  // Mock data
  const folders: Folder[] = [
    { id: 'inbox', name: 'Inbox', count: 24, icon: <Inbox className="w-4 h-4" /> },
    { id: 'sent', name: 'Sent', count: 12, icon: <Send className="w-4 h-4" /> },
    { id: 'drafts', name: 'Drafts', count: 3, icon: <Edit3 className="w-4 h-4" /> },
    { id: 'starred', name: 'Starred', count: 8, icon: <Star className="w-4 h-4" /> },
    { id: 'archive', name: 'Archive', count: 156, icon: <Archive className="w-4 h-4" /> },
    { id: 'trash', name: 'Trash', count: 7, icon: <Trash className="w-4 h-4" /> }
  ];

  // Mock emails removed - users start with empty inbox

  useEffect(() => {
    // Start with empty emails - no mock data
    setEmails([]);
  }, []);

  const filteredEmails = emails.filter(email => {
    const matchesFolder = email.folder === selectedFolder;
    const matchesSearch = email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         email.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         email.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  const handleEmailSelect = (email: Email) => {
    setSelectedEmail(email);
    if (activeTab === 'ai-assistant') {
      handleAnalyzeEmail(email);
    }
  };

  const handleAnalyzeEmail = async (email: Email) => {
    setIsAnalyzing(true);
    setEmailAnalysis(null);
    
    try {
      const emailContext: EmailContext = {
        sender: email.from,
        recipient: email.to,
        subject: email.subject,
        content: email.content,
        timestamp: email.timestamp,
        isReply: email.subject.toLowerCase().startsWith('re:'),
        relationshipType: 'unknown'
      };

      const analysis = await aiEmailService.analyzeEmail(emailContext);
      setEmailAnalysis(analysis);
    } catch (error) {
      console.error('Error analyzing email:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateDrafts = async () => {
    if (!selectedEmail || !emailAnalysis) return;

    setIsGeneratingDrafts(true);
    setAiDrafts([]);

    try {
      const emailContext: EmailContext = {
        sender: selectedEmail.from,
        recipient: selectedEmail.to,
        subject: selectedEmail.subject,
        content: selectedEmail.content,
        timestamp: selectedEmail.timestamp,
        isReply: selectedEmail.subject.toLowerCase().startsWith('re:'),
        relationshipType: 'unknown'
      };

      const drafts = await aiEmailService.generateDrafts(emailContext, emailAnalysis);
      setAiDrafts(drafts);
    } catch (error) {
      console.error('Error generating drafts:', error);
    } finally {
      setIsGeneratingDrafts(false);
    }
  };

  const handleSendDraft = (draft: AIEmailDraft) => {
    console.log('Sending draft:', draft);
    // Implement send functionality
  };

  const handleCopyDraft = (draft: AIEmailDraft) => {
    navigator.clipboard.writeText(draft.content);
    // Show toast notification
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-chatgpt-card border-r border-border flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Email</h1>
              <p className="text-sm text-muted-foreground">AI-Powered</p>
            </div>
          </div>
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={() => setIsComposing(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Compose
          </Button>
        </div>

        {/* Folders */}
        <div className="flex-1 p-4 space-y-1">
          {folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => setSelectedFolder(folder.id)}
              className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                selectedFolder === folder.id
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'hover:bg-background/50 text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-3">
                {folder.icon}
                <span className="font-medium">{folder.name}</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {folder.count}
              </Badge>
            </button>
          ))}
        </div>

        {/* Account Status */}
        <div className="p-4 border-t border-border">
          <div className="p-2 bg-background/50 rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs font-medium text-foreground">Gmail Connected</span>
            </div>
            <p className="text-xs text-muted-foreground">Last sync: 2 min ago</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-chatgpt-card border-b border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search emails..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-background border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'emails' | 'ai-assistant')}>
            <TabsList className="bg-background border border-border">
              <TabsTrigger value="emails" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                <Mail className="w-4 h-4 mr-2" />
                Emails
              </TabsTrigger>
              <TabsTrigger value="ai-assistant" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                <Brain className="w-4 h-4 mr-2" />
                AI Assistant
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex">
          {/* Email List */}
          <div className="w-1/3 border-r border-border bg-background">
            <div className="h-full overflow-y-auto">
              {filteredEmails.map((email) => (
                <div
                  key={email.id}
                  onClick={() => handleEmailSelect(email)}
                  className={`p-4 border-b border-border cursor-pointer transition-colors ${
                    selectedEmail?.id === email.id
                      ? 'bg-blue-500/10 border-blue-500/30'
                      : 'hover:bg-background/50'
                  } ${!email.isRead ? 'bg-blue-500/5' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      {email.isStarred ? (
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      ) : (
                        <Star className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-foreground truncate">
                          {email.from}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(email.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-foreground mb-1 truncate">
                        {email.subject}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {email.content}
                      </p>
                      {email.tags.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {email.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Email Content / AI Assistant */}
          <div className="flex-1 flex">
            {activeTab === 'emails' ? (
              /* Email Content */
              <div className="flex-1 p-6">
                {selectedEmail ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-foreground">{selectedEmail.subject}</h2>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Reply className="w-4 h-4 mr-2" />
                          Reply
                        </Button>
                        <Button variant="outline" size="sm">
                          <Forward className="w-4 h-4 mr-2" />
                          Forward
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleAnalyzeEmail(selectedEmail)}>
                              <Brain className="w-4 h-4 mr-2" />
                              AI Analysis
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Star className="w-4 h-4 mr-2" />
                              Star
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Archive className="w-4 h-4 mr-2" />
                              Archive
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Trash className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>From: {selectedEmail.from}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(selectedEmail.timestamp).toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="prose max-w-none">
                        <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                          {selectedEmail.content}
                        </div>
                      </div>

                      {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                        <div className="border-t border-border pt-4">
                          <h3 className="text-sm font-medium text-foreground mb-2">Attachments</h3>
                          <div className="space-y-2">
                            {selectedEmail.attachments.map((attachment, index) => (
                              <div key={index} className="flex items-center gap-2 p-2 bg-background/50 rounded border border-border">
                                <Paperclip className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm text-foreground">{attachment}</span>
                                <Button variant="ghost" size="sm">
                                  <Download className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Mail className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">No Email Selected</h3>
                      <p className="text-muted-foreground">Choose an email from the list to view its content.</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* AI Assistant Tab */
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="max-w-4xl mx-auto space-y-6">
                  <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <Brain className="w-8 h-8 text-blue-500" />
                      <h1 className="text-3xl font-bold text-foreground">AI Email Assistant</h1>
                      <Sparkles className="w-8 h-8 text-purple-500" />
                    </div>
                    <p className="text-muted-foreground">
                      Select an email to get AI-powered insights, analysis, and response suggestions.
                    </p>
                  </div>

                  {selectedEmail ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* AI Intelligence Panel */}
                      <div className="lg:col-span-1">
                        <AIIntelligencePanel
                          analysis={emailAnalysis}
                          isLoading={isAnalyzing}
                          onGenerateDrafts={handleGenerateDrafts}
                        />
                      </div>

                      {/* AI Draft Suggestions */}
                      <div className="lg:col-span-1">
                        <AIDraftSuggestions
                          drafts={aiDrafts}
                          isLoading={isGeneratingDrafts}
                          onSendDraft={handleSendDraft}
                          onCopyDraft={handleCopyDraft}
                        />
                      </div>
                    </div>
                  ) : (
                    <Card className="bg-chatgpt-card border-border shadow-sm">
                      <CardContent className="p-12">
                        <div className="text-center">
                          <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-xl font-semibold text-foreground mb-2">Select an Email</h3>
                          <p className="text-muted-foreground mb-6">
                            Choose an email from the list to access AI-powered analysis and response generation.
                          </p>
                          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Zap className="w-4 h-4" />
                              <span>Sentiment Analysis</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Brain className="w-4 h-4" />
                              <span>Intent Detection</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MessageSquare className="w-4 h-4" />
                              <span>Smart Drafts</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
