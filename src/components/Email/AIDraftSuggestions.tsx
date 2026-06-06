import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Brain, 
  Copy, 
  Send, 
  Edit3, 
  CheckCircle, 
  Clock,
  Target,
  Lightbulb,
  TrendingUp,
  MessageSquare,
  Sparkles,
  Zap
} from 'lucide-react';
import { AIEmailDraft } from '@/lib/ai-email-service';

interface AIDraftSuggestionsProps {
  drafts: AIEmailDraft[];
  isLoading: boolean;
  onSendDraft: (draft: AIEmailDraft) => void;
  onCopyDraft: (draft: AIEmailDraft) => void;
  className?: string;
}

export default function AIDraftSuggestions({ 
  drafts, 
  isLoading, 
  onSendDraft,
  onCopyDraft,
  className = "" 
}: AIDraftSuggestionsProps) {
  const [editingDraft, setEditingDraft] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<string>('');

  const getToneColor = (tone: string) => {
    switch (tone) {
      case 'professional': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'friendly': return 'bg-green-100 text-green-800 border-green-200';
      case 'formal': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-500';
    if (confidence >= 80) return 'text-blue-500';
    if (confidence >= 70) return 'text-orange-500';
    return 'text-red-500';
  };

  const handleEdit = (draft: AIEmailDraft) => {
    setEditingDraft(draft.id);
    setEditedContent(draft.content);
  };

  const handleSaveEdit = (draftId: string) => {
    const draft = drafts.find(d => d.id === draftId);
    if (draft) {
      draft.content = editedContent;
    }
    setEditingDraft(null);
    setEditedContent('');
  };

  const handleCancelEdit = () => {
    setEditingDraft(null);
    setEditedContent('');
  };

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Card className="bg-chatgpt-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Brain className="w-5 h-5 animate-pulse" />
              AI Draft Generation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-6 bg-background/50 rounded w-1/4 mb-2"></div>
                  <div className="h-4 bg-background/30 rounded w-full mb-1"></div>
                  <div className="h-4 bg-background/30 rounded w-3/4 mb-1"></div>
                  <div className="h-4 bg-background/30 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (drafts.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Card className="bg-chatgpt-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Brain className="w-5 h-5" />
              AI Draft Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Drafts Generated</h3>
              <p className="text-muted-foreground">Generate AI-powered response drafts to see suggestions here.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20 shadow-sm">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            AI-Powered Draft Suggestions
            <Badge className="ml-auto bg-blue-500/20 text-blue-400 border-blue-500/30">
              {drafts.length} Drafts
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Choose from AI-generated responses with different tones. Each draft includes confidence scoring and reasoning.
          </p>
        </CardContent>
      </Card>

      {drafts.map((draft, index) => (
        <Card key={draft.id} className="bg-chatgpt-card border-border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold text-foreground">Draft {index + 1}</span>
                </div>
                <Badge className={`${getToneColor(draft.tone)} border`}>
                  {draft.tone}
                </Badge>
                <div className="flex items-center gap-1">
                  <TrendingUp className={`w-4 h-4 ${getConfidenceColor(draft.confidence)}`} />
                  <span className={`text-sm font-medium ${getConfidenceColor(draft.confidence)}`}>
                    {draft.confidence}%
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(draft)}
                  className="h-8 w-8 p-0 hover:bg-background/50"
                >
                  <Edit3 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onCopyDraft(draft)}
                  className="h-8 w-8 p-0 hover:bg-background/50"
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onSendDraft(draft)}
                  className="h-8 bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Subject Line */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Subject</span>
              </div>
              <div className="p-3 bg-background/50 rounded-lg border border-border">
                <span className="text-sm text-foreground">{draft.subject}</span>
              </div>
            </div>

            {/* Email Content */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Content</span>
              </div>
              {editingDraft === draft.id ? (
                <div className="space-y-2">
                  <Textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                    rows={6}
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleSaveEdit(draft.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelEdit}
                      className="border-border text-foreground hover:bg-background/50"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-background/50 rounded-lg border border-border">
                  <div className="whitespace-pre-wrap text-sm text-foreground">
                    {draft.content}
                  </div>
                </div>
              )}
            </div>

            {/* AI Reasoning */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">AI Reasoning</span>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <p className="text-sm text-foreground">{draft.reasoning}</p>
              </div>
            </div>

            {/* Key Points */}
            {draft.keyPoints.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Key Points Covered</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {draft.keyPoints.map((point, pointIndex) => (
                    <Badge key={pointIndex} variant="outline" className="text-xs">
                      {point}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Next Steps */}
            {draft.suggestedNextSteps.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Suggested Next Steps</span>
                </div>
                <div className="space-y-1">
                  {draft.suggestedNextSteps.map((step, stepIndex) => (
                    <div key={stepIndex} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-muted-foreground">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Usage Tips */}
      <Card className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/20 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-green-500 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-foreground">Pro Tips</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Edit drafts before sending to personalize your response</li>
                <li>• Higher confidence scores indicate better AI recommendations</li>
                <li>• Use different tones for different relationship contexts</li>
                <li>• Follow suggested next steps for better communication flow</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
