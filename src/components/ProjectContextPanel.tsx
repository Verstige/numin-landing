import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, Users, Target, Clock, TrendingUp, UserPlus, X, Loader2, AlertCircle, CheckCircle, Edit3, Save } from "lucide-react";
import { TeamMemberList } from "./TeamMemberAvatar";
import { 
  type TeamMember, 
  type InvitationFormData,
  validateInvitationForm,
  createInvitation,
  simulateEmailInvitation,
  isEmailAlreadyInvited,
  isEmailAlreadyMember
} from "@/lib/collaboration";

interface ProjectContextPanelProps {
  project: {
    id: string;
    name: string;
    description: string;
    status: string;
    priority: "low" | "medium" | "high";
    // Enhanced business details
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
  };
  teamMembers?: TeamMember[];
  allTeamMembers?: TeamMember[];
  invitations?: any[];
  onInviteMember?: (invitation: any) => void;
  onUpdateProject?: (project: any) => void;
}

export default function ProjectContextPanel({ 
  project, 
  teamMembers = [], 
  allTeamMembers = [], 
  invitations = [], 
  onInviteMember,
  onUpdateProject
}: ProjectContextPanelProps) {
  const [isInviting, setIsInviting] = useState(false);
  const [invitationForm, setInvitationForm] = useState<InvitationFormData>({
    name: "",
    email: "",
    role: "member",
    projectId: project.id
  });
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [isSendingInvitation, setIsSendingInvitation] = useState(false);
  const [invitationSuccess, setInvitationSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProject, setEditedProject] = useState(project);

  // Start with empty stats for new users - data will be populated as users create content
  const mockStats = {
    tasksCompleted: 0,
    tasksTotal: 0,
    teamMembers: 0,
    daysUntilDeadline: 0,
    weeklyProgress: 0
  };

  const progressPercentage = mockStats.tasksTotal > 0 ? (mockStats.tasksCompleted / mockStats.tasksTotal) * 100 : 0;

  const priorityColors = {
    low: "bg-muted text-muted-foreground",
    medium: "bg-secondary text-secondary-foreground", 
    high: "gradient-primary text-white"
  };

  const statusColors = {
    "Planning": "text-blue-400",
    "Active": "text-green-400",
    "Completed": "text-gray-400",
    "On Hold": "text-yellow-400"
  };

  const handleInviteToProject = () => {
    setIsInviting(true);
    setFormErrors([]);
    setInvitationSuccess(false);
    setInvitationForm({
      name: "",
      email: "",
      role: "member",
      projectId: project.id
    });
  };

  const handleFormChange = (field: keyof InvitationFormData, value: string) => {
    setInvitationForm(prev => ({ ...prev, [field]: value }));
    setFormErrors([]);
    setInvitationSuccess(false);
  };

  const handleSendProjectInvitation = async () => {
    setFormErrors([]);
    setIsSendingInvitation(true);
    
    // Validate form
    const validation = validateInvitationForm(invitationForm);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      setIsSendingInvitation(false);
      return;
    }
    
    // Check if email is already a member
    if (isEmailAlreadyMember(invitationForm.email, allTeamMembers)) {
      setFormErrors(["This email is already a team member"]);
      setIsSendingInvitation(false);
      return;
    }
    
    // Check if email is already invited
    if (isEmailAlreadyInvited(invitationForm.email, invitations)) {
      setFormErrors(["This email has already been invited"]);
      setIsSendingInvitation(false);
      return;
    }
    
    try {
      // Create invitation
      const newInvitation = createInvitation(
        invitationForm,
        "current-user-id", // In real app, get from auth context
        "Current User" // In real app, get from auth context
      );
      
      // Call parent handler if provided
      if (onInviteMember) {
        onInviteMember(newInvitation);
      }
      
      // Simulate sending email
      await simulateEmailInvitation(newInvitation);
      
      // Show success
      setInvitationSuccess(true);
      setIsInviting(false);
      
    } catch (error) {
      setFormErrors(["Failed to send invitation. Please try again."]);
    } finally {
      setIsSendingInvitation(false);
    }
  };

  const handleSaveEdit = () => {
    if (onUpdateProject) {
      onUpdateProject(editedProject);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedProject(project);
    setIsEditing(false);
  };

  return (
    <div className="space-y-4">
      {/* Project Header */}
      <Card className="p-4 bg-chatgpt-card border-border">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-card-foreground">{project.name}</h3>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="text-muted-foreground hover:text-foreground"
            >
              {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
            </Button>
            <Badge className={priorityColors[project.priority]}>
              {project.priority}
            </Badge>
            <Badge variant="outline" className={`border-current ${statusColors[project.status as keyof typeof statusColors] || "text-muted-foreground"}`}>
              {project.status}
            </Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {project.description}
        </p>
        
        {/* Business Details */}
        {(project.industry || project.location || project.website || project.businessStage) && (
          <div className="mt-4 pt-4 border-t border-border">
            <h4 className="text-sm font-medium text-card-foreground mb-3">Business Information</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {project.industry && (
                <div>
                  <span className="text-muted-foreground">Industry:</span>
                  <span className="ml-2 text-card-foreground">{project.industry}</span>
                </div>
              )}
              {project.location && (
                <div>
                  <span className="text-muted-foreground">Location:</span>
                  <span className="ml-2 text-card-foreground">{project.location}</span>
                </div>
              )}
              {project.website && (
                <div>
                  <span className="text-muted-foreground">Website:</span>
                  <a href={project.website} target="_blank" rel="noopener noreferrer" className="ml-2 text-primary hover:underline">
                    {project.website}
                  </a>
                </div>
              )}
              {project.businessStage && (
                <div>
                  <span className="text-muted-foreground">Stage:</span>
                  <span className="ml-2 text-card-foreground capitalize">{project.businessStage}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Edit Business Form */}
      {isEditing && (
        <Card className="p-4 bg-chatgpt-card border-border">
          <h4 className="text-lg font-semibold text-card-foreground mb-4">Edit Business Information</h4>
          <div className="space-y-4">
            {/* Basic Information */}
            <div className="space-y-3">
              <h5 className="text-sm font-medium text-card-foreground">Basic Information</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="edit-name" className="text-xs">Business Name</Label>
                  <Input
                    id="edit-name"
                    value={editedProject.name}
                    onChange={(e) => setEditedProject({ ...editedProject, name: e.target.value })}
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-industry" className="text-xs">Industry</Label>
                  <Input
                    id="edit-industry"
                    value={editedProject.industry || ''}
                    onChange={(e) => setEditedProject({ ...editedProject, industry: e.target.value })}
                    placeholder="e.g., Technology, Healthcare"
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-description" className="text-xs">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editedProject.description}
                  onChange={(e) => setEditedProject({ ...editedProject, description: e.target.value })}
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                  rows={3}
                />
              </div>
            </div>

            {/* Business Details */}
            <div className="space-y-3">
              <h5 className="text-sm font-medium text-card-foreground">Business Details</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="edit-location" className="text-xs">Location</Label>
                  <Input
                    id="edit-location"
                    value={editedProject.location || ''}
                    onChange={(e) => setEditedProject({ ...editedProject, location: e.target.value })}
                    placeholder="e.g., San Francisco, CA"
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-website" className="text-xs">Website</Label>
                  <Input
                    id="edit-website"
                    value={editedProject.website || ''}
                    onChange={(e) => setEditedProject({ ...editedProject, website: e.target.value })}
                    placeholder="https://yourbusiness.com"
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-business-stage" className="text-xs">Business Stage</Label>
                  <Select
                    value={editedProject.businessStage || ''}
                    onValueChange={(value) => setEditedProject({ ...editedProject, businessStage: value })}
                  >
                    <SelectTrigger className="bg-background border-border text-foreground">
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="idea">Idea Stage</SelectItem>
                      <SelectItem value="startup">Startup</SelectItem>
                      <SelectItem value="growth">Growth Stage</SelectItem>
                      <SelectItem value="established">Established</SelectItem>
                      <SelectItem value="expansion">Expansion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-founded" className="text-xs">Founded Year</Label>
                  <Input
                    id="edit-founded"
                    value={editedProject.founded || ''}
                    onChange={(e) => setEditedProject({ ...editedProject, founded: e.target.value })}
                    placeholder="2024"
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>
            </div>

            {/* Products & Contact */}
            <div className="space-y-3">
              <h5 className="text-sm font-medium text-card-foreground">Additional Information</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="edit-products" className="text-xs">Products/Services</Label>
                  <Textarea
                    id="edit-products"
                    value={editedProject.products || ''}
                    onChange={(e) => setEditedProject({ ...editedProject, products: e.target.value })}
                    placeholder="Describe your products or services"
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-contact-email" className="text-xs">Contact Email</Label>
                  <Input
                    id="edit-contact-email"
                    value={editedProject.contactEmail || ''}
                    onChange={(e) => setEditedProject({ ...editedProject, contactEmail: e.target.value })}
                    placeholder="contact@yourbusiness.com"
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-notes" className="text-xs">Additional Notes</Label>
                <Textarea
                  id="edit-notes"
                  value={editedProject.additionalNotes || ''}
                  onChange={(e) => setEditedProject({ ...editedProject, additionalNotes: e.target.value })}
                  placeholder="Any additional information about your business"
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                  rows={3}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-3">
              <Button
                onClick={handleSaveEdit}
                size="sm"
                className="flex-1"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
              <Button
                variant="outline"
                onClick={handleCancelEdit}
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-3 bg-chatgpt-card border-border">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Progress</span>
          </div>
          <div className="space-y-1">
            <Progress value={progressPercentage} className="h-2" />
            <p className="text-sm font-semibold text-card-foreground">
              {mockStats.tasksTotal > 0 ? `${mockStats.tasksCompleted}/${mockStats.tasksTotal} tasks` : 'No tasks yet'}
            </p>
          </div>
        </Card>

        <Card className="p-3 bg-chatgpt-card border-border">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Team</span>
          </div>
          {teamMembers && teamMembers.length > 0 ? (
            <TeamMemberList 
              members={teamMembers} 
              maxVisible={3}
              size="sm"
              showAddButton={true}
              onAddMember={handleInviteToProject}
            />
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleInviteToProject}
                className="w-6 h-6 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer flex items-center justify-center"
              >
                <span className="text-xs font-medium">+</span>
              </button>
              <span className="text-xs text-muted-foreground">No members</span>
            </div>
          )}
        </Card>

        <Card className="p-3 bg-chatgpt-card border-border">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Deadline</span>
          </div>
          <p className="text-sm font-semibold text-card-foreground">
            {mockStats.daysUntilDeadline > 0 ? `${mockStats.daysUntilDeadline} days` : 'No deadline set'}
          </p>
        </Card>

        <Card className="p-3 bg-chatgpt-card border-border">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Velocity</span>
          </div>
          <p className="text-sm font-semibold text-card-foreground">
            {mockStats.weeklyProgress > 0 ? `${mockStats.weeklyProgress}%` : 'No activity yet'}
          </p>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-4 bg-chatgpt-card border-border">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-card-foreground">Recent Activity</span>
        </div>
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">
            • Task "Design mockups" completed 2 hours ago
          </div>
          <div className="text-xs text-muted-foreground">
            • New team member joined yesterday
          </div>
          <div className="text-xs text-muted-foreground">
            • Project status updated to Active
          </div>
        </div>
      </Card>

      {/* Project Invitation Modal */}
      {isInviting && (
        <Card className="fixed inset-4 z-50 max-w-md mx-auto max-h-[90vh] overflow-auto border-primary scrollbar-none">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Invite to {project.name}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsInviting(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formErrors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {formErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
            
            <div>
              <label className="text-sm font-medium mb-1 block">Full Name *</label>
              <Input 
                placeholder="Enter full name"
                value={invitationForm.name}
                onChange={(e) => handleFormChange("name", e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Email Address *</label>
              <Input 
                placeholder="Enter email address"
                type="email"
                value={invitationForm.email}
                onChange={(e) => handleFormChange("email", e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Role *</label>
              <select 
                className="w-full px-3 py-2 border rounded-md"
                value={invitationForm.role}
                onChange={(e) => handleFormChange("role", e.target.value as "admin" | "member" | "viewer")}
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            
            <div className="flex gap-2">
              <Button 
                className="flex-1"
                onClick={handleSendProjectInvitation}
                disabled={isSendingInvitation}
              >
                {isSendingInvitation ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4 mr-2" />
                )}
                {isSendingInvitation ? "Sending..." : "Send Invite"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsInviting(false)}
                disabled={isSendingInvitation}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Message */}
      {invitationSuccess && (
        <Alert className="fixed top-4 right-4 z-50 max-w-md">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Invitation sent successfully! The recipient will be added to {project.name} upon acceptance.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
