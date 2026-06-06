import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Target, 
  TrendingUp, 
  Users, 
  Calendar, 
  DollarSign, 
  Globe, 
  Building2, 
  Phone, 
  Mail, 
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  Activity,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
  Edit3,
  Save,
  X,
  Trash2
} from "lucide-react";

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  priority: "low" | "medium" | "high";
  location?: string;
  website?: string;
  industry?: string;
  products?: string;
  targetAudience?: string;
  businessStage?: string;
  revenue?: string;
  employees?: string;
  founded?: string;
  contactEmail?: string;
  phone?: string;
  socialMedia?: string;
  additionalNotes?: string;
}

interface EnhancedProjectOverviewProps {
  selectedProject: Project | null;
  onUpdateProject?: (project: Project) => void;
  onDeleteProject?: (projectId: string) => void;
}

export default function EnhancedProjectOverview({ selectedProject, onUpdateProject, onDeleteProject }: EnhancedProjectOverviewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProject, setEditedProject] = useState<Project | null>(null);

  // Initialize edited project when selected project changes
  useEffect(() => {
    if (selectedProject) {
      setEditedProject(selectedProject);
    }
  }, [selectedProject]);

  if (!selectedProject) {
    return (
      <div className="bg-gradient-to-r from-muted/30 to-muted/20 rounded-2xl p-8 border border-border/50 shadow-glass text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Target className="w-6 h-6 text-muted-foreground" />
          <h2 className="text-xl font-semibold text-muted-foreground">No Project Selected</h2>
        </div>
        <p className="text-muted-foreground mb-4">
          Click on a project in the ProjectMap to view its detailed analysis and insights
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <span>Select a project to see comprehensive business analytics</span>
        </div>
      </div>
    );
  }

  // Generate mock analytics data based on project
  const generateAnalytics = (project: Project) => {
    const baseMetrics = {
      revenue: project.revenue === '1m+' ? 2500000 : 
               project.revenue === '500k-1m' ? 750000 :
               project.revenue === '100k-500k' ? 300000 :
               project.revenue === '50k-100k' ? 75000 :
               project.revenue === '10k-50k' ? 30000 :
               project.revenue === '0-10k' ? 5000 : 0,
      employees: project.employees === '1-10' ? 5 :
                project.employees === '11-50' ? 25 :
                project.employees === '51-200' ? 125 : 2,
      founded: project.founded ? parseInt(project.founded) : 2024,
      tasksCompleted: Math.floor(Math.random() * 15) + 5,
      tasksTotal: Math.floor(Math.random() * 10) + 20,
      teamMembers: Math.floor(Math.random() * 8) + 3,
      weeklyGrowth: Math.floor(Math.random() * 20) - 5, // -5% to +15%
      monthlyRevenue: Math.floor(Math.random() * 30) - 10, // -10% to +20%
      customerSatisfaction: Math.floor(Math.random() * 20) + 80, // 80-100%
      marketShare: Math.floor(Math.random() * 5) + 1, // 1-5%
    };

    const yearsInBusiness = new Date().getFullYear() - baseMetrics.founded;
    const maturityScore = Math.min(yearsInBusiness * 10 + (baseMetrics.employees * 2), 100);
    
    return {
      ...baseMetrics,
      yearsInBusiness,
      maturityScore,
      progress: Math.round((baseMetrics.tasksCompleted / baseMetrics.tasksTotal) * 100),
      statusColor: project.status === 'Active' ? 'text-green-400' : 
                   project.status === 'Planning' ? 'text-blue-400' : 
                   project.status === 'Completed' ? 'text-gray-400' : 'text-yellow-400',
      priorityColor: project.priority === 'high' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                     project.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                     'bg-green-500/20 text-green-400 border-green-500/30',
      industryTrend: project.industry === 'Technology' ? '+12%' : 
                     project.industry === 'Healthcare' ? '+8%' :
                     project.industry === 'Finance' ? '+5%' : '+3%',
      riskLevel: baseMetrics.revenue > 1000000 ? 'Low' :
                 baseMetrics.revenue > 100000 ? 'Medium' : 'High',
      riskColor: baseMetrics.revenue > 1000000 ? 'text-green-400' :
                 baseMetrics.revenue > 100000 ? 'text-yellow-400' : 'text-red-400'
    };
  };

  const analytics = generateAnalytics(selectedProject);

  const handleSaveEdit = () => {
    if (editedProject && onUpdateProject) {
      onUpdateProject(editedProject);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedProject(selectedProject);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <Card className="p-6 bg-chatgpt-card border-border">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-foreground">{selectedProject.name}</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="text-muted-foreground hover:text-foreground"
              >
                {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
              </Button>
              {onDeleteProject && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete "${selectedProject.name}"? This action cannot be undone.`)) {
                      onDeleteProject(selectedProject.id);
                    }
                  }}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {selectedProject.description}
            </p>
            <div className="flex items-center gap-3">
              <Badge className={analytics.priorityColor}>
                {selectedProject.priority}
              </Badge>
              <Badge variant="outline" className={`border-current ${analytics.statusColor}`}>
                {selectedProject.status}
              </Badge>
              {selectedProject.industry && (
                <Badge variant="secondary">
                  {selectedProject.industry}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Quick Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{analytics.revenue.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Annual Revenue</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{analytics.employees}</div>
            <div className="text-xs text-muted-foreground">Team Size</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{analytics.yearsInBusiness}</div>
            <div className="text-xs text-muted-foreground">Years in Business</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{analytics.maturityScore}%</div>
            <div className="text-xs text-muted-foreground">Maturity Score</div>
          </div>
        </div>
      </Card>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-background border border-border">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Business Information */}
            <Card className="p-4 bg-chatgpt-card border-border">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-foreground">Business Information</h3>
              </div>
              <div className="space-y-2 text-sm">
                {selectedProject.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Location:</span>
                    <span className="text-foreground">{selectedProject.location}</span>
                  </div>
                )}
                {selectedProject.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Website:</span>
                    <a href={selectedProject.website} target="_blank" rel="noopener noreferrer" 
                       className="text-primary hover:underline flex items-center gap-1">
                      {selectedProject.website}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
                {selectedProject.businessStage && (
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Stage:</span>
                    <span className="text-foreground capitalize">{selectedProject.businessStage}</span>
                  </div>
                )}
                {selectedProject.founded && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Founded:</span>
                    <span className="text-foreground">{selectedProject.founded}</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Contact Information */}
            <Card className="p-4 bg-chatgpt-card border-border">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-foreground">Contact Information</h3>
              </div>
              <div className="space-y-2 text-sm">
                {selectedProject.contactEmail && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Email:</span>
                    <span className="text-foreground">{selectedProject.contactEmail}</span>
                  </div>
                )}
                {selectedProject.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="text-foreground">{selectedProject.phone}</span>
                  </div>
                )}
                {selectedProject.socialMedia && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Social:</span>
                    <span className="text-foreground">{selectedProject.socialMedia}</span>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Products & Target Audience */}
          {(selectedProject.products || selectedProject.targetAudience) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedProject.products && (
                <Card className="p-4 bg-chatgpt-card border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-foreground">Products & Services</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedProject.products}</p>
                </Card>
              )}
              {selectedProject.targetAudience && (
                <Card className="p-4 bg-chatgpt-card border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-foreground">Target Audience</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedProject.targetAudience}</p>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Revenue Analytics */}
            <Card className="p-4 bg-chatgpt-card border-border">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-4 h-4 text-green-400" />
                <h3 className="font-semibold text-foreground">Revenue Analytics</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Annual Revenue</span>
                  <span className="text-sm font-semibold text-foreground">${analytics.revenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Monthly Growth</span>
                  <div className="flex items-center gap-1">
                    {analytics.monthlyRevenue >= 0 ? (
                      <ArrowUpRight className="w-3 h-3 text-green-400" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 text-red-400" />
                    )}
                    <span className={`text-sm font-semibold ${analytics.monthlyRevenue >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {analytics.monthlyRevenue >= 0 ? '+' : ''}{analytics.monthlyRevenue}%
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Industry Trend</span>
                  <span className="text-sm text-green-400">{analytics.industryTrend}</span>
                </div>
              </div>
            </Card>

            {/* Team Analytics */}
            <Card className="p-4 bg-chatgpt-card border-border">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-blue-400" />
                <h3 className="font-semibold text-foreground">Team Analytics</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Team Size</span>
                  <span className="text-sm font-semibold text-foreground">{analytics.teamMembers} members</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Employee Count</span>
                  <span className="text-sm font-semibold text-foreground">{analytics.employees}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Revenue per Employee</span>
                  <span className="text-sm font-semibold text-foreground">
                    ${Math.round(analytics.revenue / analytics.employees).toLocaleString()}
                  </span>
                </div>
              </div>
            </Card>

            {/* Performance Metrics */}
            <Card className="p-4 bg-chatgpt-card border-border">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4 text-purple-400" />
                <h3 className="font-semibold text-foreground">Performance</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Task Completion</span>
                  <span className="text-sm font-semibold text-foreground">{analytics.progress}%</span>
                </div>
                <Progress value={analytics.progress} className="h-2" />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Customer Satisfaction</span>
                  <span className="text-sm font-semibold text-foreground">{analytics.customerSatisfaction}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Market Share</span>
                  <span className="text-sm font-semibold text-foreground">{analytics.marketShare}%</span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Growth Metrics */}
            <Card className="p-4 bg-chatgpt-card border-border">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <h3 className="font-semibold text-foreground">Growth Metrics</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Weekly Growth</span>
                  <div className="flex items-center gap-1">
                    {analytics.weeklyGrowth >= 0 ? (
                      <ArrowUpRight className="w-3 h-3 text-green-400" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 text-red-400" />
                    )}
                    <span className={`text-sm font-semibold ${analytics.weeklyGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {analytics.weeklyGrowth >= 0 ? '+' : ''}{analytics.weeklyGrowth}%
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Business Maturity</span>
                  <span className="text-sm font-semibold text-foreground">{analytics.maturityScore}%</span>
                </div>
                <Progress value={analytics.maturityScore} className="h-2" />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Years in Business</span>
                  <span className="text-sm font-semibold text-foreground">{analytics.yearsInBusiness}</span>
                </div>
              </div>
            </Card>

            {/* Risk Assessment */}
            <Card className="p-4 bg-chatgpt-card border-border">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                <h3 className="font-semibold text-foreground">Risk Assessment</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Risk Level</span>
                  <span className={`text-sm font-semibold ${analytics.riskColor}`}>{analytics.riskLevel}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Revenue Stability</span>
                  <span className="text-sm font-semibold text-foreground">
                    {analytics.revenue > 1000000 ? 'High' : analytics.revenue > 100000 ? 'Medium' : 'Low'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Market Position</span>
                  <span className="text-sm font-semibold text-foreground">
                    {analytics.marketShare > 3 ? 'Strong' : analytics.marketShare > 1 ? 'Moderate' : 'Emerging'}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* AI Insights */}
            <Card className="p-4 bg-chatgpt-card border-border">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-foreground">AI Business Insights</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    <span className="font-medium text-foreground">Growth Opportunity</span>
                  </div>
                  <p className="text-muted-foreground">
                    Based on your {selectedProject.industry} industry and {selectedProject.businessStage} stage, 
                    consider expanding your {selectedProject.products?.split(',')[0] || 'core offerings'} to capture 
                    {analytics.industryTrend} market growth.
                  </p>
                </div>
                <div className="p-3 bg-yellow-500/5 rounded-lg border border-yellow-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-3 h-3 text-yellow-400" />
                    <span className="font-medium text-foreground">Risk Mitigation</span>
                  </div>
                  <p className="text-muted-foreground">
                    Your {analytics.riskLevel.toLowerCase()} risk profile suggests focusing on customer retention 
                    and diversifying revenue streams to improve stability.
                  </p>
                </div>
                <div className="p-3 bg-blue-500/5 rounded-lg border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-3 h-3 text-blue-400" />
                    <span className="font-medium text-foreground">Strategic Focus</span>
                  </div>
                  <p className="text-muted-foreground">
                    With {analytics.teamMembers} team members and {analytics.yearsInBusiness} years in business, 
                    focus on operational efficiency and team scaling for next-stage growth.
                  </p>
                </div>
              </div>
            </Card>

            {/* Recommendations */}
            <Card className="p-4 bg-chatgpt-card border-border">
              <div className="flex items-center gap-2 mb-3">
                <PieChart className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-foreground">Recommendations</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <span className="font-medium text-foreground">Optimize Team Productivity</span>
                    <p className="text-muted-foreground">Implement project management tools to improve task completion rates.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                  <div>
                    <span className="font-medium text-foreground">Market Expansion</span>
                    <p className="text-muted-foreground">Consider targeting adjacent markets with your existing products.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                  <div>
                    <span className="font-medium text-foreground">Customer Acquisition</span>
                    <p className="text-muted-foreground">Focus on digital marketing to reach your target audience more effectively.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                  <div>
                    <span className="font-medium text-foreground">Financial Planning</span>
                    <p className="text-muted-foreground">Develop a 12-month financial forecast based on current growth trends.</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Form */}
      {isEditing && editedProject && (
        <Card className="p-6 bg-chatgpt-card border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Edit Business Information</h3>
            <div className="flex gap-2">
              <Button onClick={handleSaveEdit} size="sm">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={handleCancelEdit} size="sm">
                Cancel
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Business Name</label>
              <input
                type="text"
                value={editedProject.name}
                onChange={(e) => setEditedProject({ ...editedProject, name: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Industry</label>
              <input
                type="text"
                value={editedProject.industry || ''}
                onChange={(e) => setEditedProject({ ...editedProject, industry: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-1 block">Description</label>
              <textarea
                value={editedProject.description}
                onChange={(e) => setEditedProject({ ...editedProject, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Website</label>
              <input
                type="url"
                value={editedProject.website || ''}
                onChange={(e) => setEditedProject({ ...editedProject, website: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Contact Email</label>
              <input
                type="email"
                value={editedProject.contactEmail || ''}
                onChange={(e) => setEditedProject({ ...editedProject, contactEmail: e.target.value })}
                className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground"
              />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
