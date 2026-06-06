import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Target,
  Users,
  Building2,
  Calendar,
  DollarSign,
  Tag,
  Lightbulb,
  ArrowRight,
  Zap
} from 'lucide-react';
import { EmailAnalysis } from '@/lib/ai-email-service';

interface AIIntelligencePanelProps {
  analysis: EmailAnalysis | null;
  isLoading: boolean;
  onGenerateDrafts: () => void;
  className?: string;
}

export default function AIIntelligencePanel({ 
  analysis, 
  isLoading, 
  onGenerateDrafts,
  className = "" 
}: AIIntelligencePanelProps) {
  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Card className="bg-chatgpt-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Brain className="w-5 h-5 animate-pulse" />
              AI Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-background/50 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-background/30 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Card className="bg-chatgpt-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Brain className="w-5 h-5" />
              AI Intelligence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Brain className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Analysis Available</h3>
              <p className="text-muted-foreground">Select an email to view AI-powered insights and analysis.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-800 border-green-200';
      case 'negative': return 'bg-red-100 text-red-800 border-red-200';
      case 'urgent': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getIntentColor = (intent: string) => {
    switch (intent) {
      case 'question': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'request': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'complaint': return 'bg-red-100 text-red-800 border-red-200';
      case 'proposal': return 'bg-green-100 text-green-800 border-green-200';
      case 'follow-up': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'business': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'personal': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'marketing': return 'bg-green-100 text-green-800 border-green-200';
      case 'support': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'sales': return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Analysis Card */}
      <Card className="bg-chatgpt-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Email Analysis
            <Badge className={`ml-auto ${getSentimentColor(analysis.sentiment)} border`}>
              {analysis.confidence}% Confidence
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Analysis Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Sentiment</span>
              </div>
              <Badge className={`${getSentimentColor(analysis.sentiment)} border`}>
                {analysis.sentiment}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Priority</span>
              </div>
              <Badge className={`${getPriorityColor(analysis.priority)} border`}>
                {analysis.priority}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Intent</span>
              </div>
              <Badge className={`${getIntentColor(analysis.intent)} border`}>
                {analysis.intent}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Category</span>
              </div>
              <Badge className={`${getCategoryColor(analysis.category)} border`}>
                {analysis.category}
              </Badge>
            </div>
          </div>

          {/* Urgency Score */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Urgency Score</span>
              </div>
              <span className="text-sm text-muted-foreground">{analysis.urgencyScore}/10</span>
            </div>
            <div className="w-full bg-background rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  analysis.urgencyScore >= 8 ? 'bg-red-500' :
                  analysis.urgencyScore >= 6 ? 'bg-orange-500' :
                  analysis.urgencyScore >= 4 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${(analysis.urgencyScore / 10) * 100}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Points */}
      <Card className="bg-chatgpt-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Key Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analysis.keyPoints.map((point, index) => (
              <div key={index} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-foreground">{point}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Entities */}
      <Card className="bg-chatgpt-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Users className="w-5 h-5" />
            Detected Entities
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {analysis.entities.people.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-foreground">People</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {analysis.entities.people.map((person, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {person}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {analysis.entities.companies.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-foreground">Companies</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {analysis.entities.companies.map((company, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {company}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {analysis.entities.dates.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium text-foreground">Dates</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {analysis.entities.dates.map((date, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {date}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {analysis.entities.amounts.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium text-foreground">Amounts</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {analysis.entities.amounts.map((amount, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {amount}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {analysis.entities.topics.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-cyan-500" />
                <span className="text-sm font-medium text-foreground">Topics</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {analysis.entities.topics.map((topic, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Suggested Actions */}
      <Card className="bg-chatgpt-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <ArrowRight className="w-5 h-5" />
            Suggested Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analysis.suggestedActions.map((action, index) => (
              <div key={index} className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-foreground">{action}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Generate Drafts Button */}
      <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20 shadow-sm">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Brain className="w-6 h-6 text-blue-500" />
              <h3 className="text-lg font-semibold text-foreground">Ready to Respond?</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Generate AI-powered response drafts with different tones and confidence levels.
            </p>
            <Button 
              onClick={onGenerateDrafts}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Zap className="w-4 h-4 mr-2" />
              Generate AI Drafts
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
