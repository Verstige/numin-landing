import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import DashboardDirectory from "@/components/DashboardDirectory";
import EnhancedProjectMap from "@/components/EnhancedProjectMap";
import ProjectCard from "@/components/ProjectCard";
import ChatInterface from "@/components/ChatInterface";
import ProjectContextPanel from "@/components/ProjectContextPanel";
import QuickSwitcher from "@/components/QuickSwitcher";
import EmptyState from "@/components/EmptyState";
import CRMDashboard from "@/components/CRM/CRMDashboard";
import EmailDashboard from "@/components/Email/EmailDashboard";
import SettingsDashboard from "@/components/Settings/SettingsDashboard";
import ProfileDropdown from "@/components/ProfileDropdown";
import { ProjectCardSkeleton, MindmapSkeleton, SidebarStatsSkeleton } from "@/components/LoadingSkeleton";
import WorkspaceTabs, { type WorkspaceTab } from "@/components/WorkspaceTabs";
import BuiltInNotes from "@/components/BuiltInNotes";
import ViewableTasks from "@/components/ViewableTasks";
import BookingManager from "@/components/BookingManager";
import TeamManagement from "@/components/TeamManagement";
import ProjectManagement from "@/components/ProjectManagement";
import TimeTracker from "@/components/TimeTracker";
import NovaChatInterface from "@/components/NovaChatInterface";
import WorkspaceCalendar from "@/components/WorkspaceCalendar";
import ExpensesDashboard from "@/components/ExpensesDashboard";
import MobileLayout from "@/components/MobileLayout";
import FloatingAppDrawer from "@/components/FloatingAppDrawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import { useNavigate } from "react-router-dom";
import { getUserDisplayName, getUserFirstName } from "@/lib/user-utils";
import { toast } from "@/hooks/use-toast";
import { useAIAgentIntegration } from "@/hooks/useAIAgentIntegration";
import { FirebaseWorkspaceTasksService, type FirebaseWorkspaceTask } from "@/lib/firebase-business-map";
import { FirebaseNotesService, type Note } from "@/lib/firebase-notes";
import { FirebaseContactsService, type Contact } from "@/lib/firebase-contacts";
import { FirebaseCalendarEventsService, type CalendarEvent } from "@/lib/firebase-calendar";
import { FirebaseBookingTemplatesService, FirebaseBookingsService } from "@/lib/firebase-booking";
import type { BookingTemplate, Booking } from "@/types/booking";
import { FirebaseExpensesService, type Expense } from "@/lib/firebase-expenses";
import BusinessSelector from "@/components/BusinessSelector";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Target, Plus, Bot, Map, LayoutDashboard, Settings, Users, Calendar, CheckSquare, Mail, StickyNote, Clock, Sparkles, Building2 } from "lucide-react";

interface Business {
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
  // Business-specific fields
  businessType?: string;
  legalStructure?: string;
  taxId?: string;
  registrationNumber?: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  priority: "low" | "medium" | "high";
  businessId?: string; // Link to parent business (optional for backward compatibility)
  // Project-specific fields
  startDate?: string;
  endDate?: string;
  budget?: string;
  teamSize?: number;
}

// Mock data removed - users start with empty workspace

const mindmapNodes = [
  { 
    id: "n1", 
    x: 300, 
    y: 200, 
    r: 26, 
    title: "VitaTech", 
    projectId: "p1",
    subProjects: [
      {
        id: "sub1",
        name: "Customer Acquisition",
        category: "sales" as const,
        status: "active" as const,
        progress: 75,
        description: "Focus on B2B sales pipeline and lead generation",
        tasks: [
          {
            id: "task1",
            title: "Create sales presentation deck",
            description: "Develop compelling pitch for enterprise clients",
            status: "completed" as const,
            priority: "high" as const
          },
          {
            id: "task2",
            title: "Setup CRM system",
            description: "Implement Salesforce for lead tracking",
            status: "in-progress" as const,
            priority: "high" as const
          },
          {
            id: "task3",
            title: "Identify target prospects",
            description: "Research and compile list of potential clients",
            status: "todo" as const,
            priority: "medium" as const
          }
        ],
        legs: [
          {
            id: "leg1",
            name: "Lead Generation",
            description: "Automated lead generation systems",
            status: "active" as const,
            progress: 60,
            tasks: []
          },
          {
            id: "leg2",
            name: "Sales Pipeline",
            description: "Sales process optimization",
            status: "planning" as const,
            progress: 25,
            tasks: []
          },
          {
            id: "leg3",
            name: "Client Relations",
            description: "Customer relationship management",
            status: "active" as const,
            progress: 80,
            tasks: []
          }
        ]
      },
      {
        id: "sub2",
        name: "Brand Awareness",
        category: "marketing" as const,
        status: "planning" as const,
        progress: 30,
        description: "Multi-channel marketing campaign for product launch",
        tasks: [
          {
            id: "task4",
            title: "Design brand guidelines",
            description: "Create comprehensive brand identity document",
            status: "in-progress" as const,
            priority: "high" as const
          },
          {
            id: "task5",
            title: "Plan launch campaign",
            description: "Strategy for product announcement",
            status: "todo" as const,
            priority: "medium" as const
          }
        ],
        legs: [
          {
            id: "leg4",
            name: "Brand Identity",
            description: "Visual identity and messaging",
            status: "active" as const,
            progress: 70,
            tasks: []
          },
          {
            id: "leg5",
            name: "Campaign Strategy",
            description: "Multi-channel campaign planning",
            status: "planning" as const,
            progress: 30,
            tasks: []
          },
          {
            id: "leg6",
            name: "Content Creation",
            description: "Marketing content development",
            status: "active" as const,
            progress: 45,
            tasks: []
          }
        ]
      },
      {
        id: "sub3",
        name: "Social Media",
        category: "social-media" as const,
        status: "active" as const,
        progress: 60,
        description: "LinkedIn and Twitter engagement strategy",
        tasks: [
          {
            id: "task6",
            title: "Create content calendar",
            description: "Plan weekly social media posts",
            status: "completed" as const,
            priority: "medium" as const
          },
          {
            id: "task7",
            title: "Engage with industry influencers",
            description: "Build relationships with key thought leaders",
            status: "in-progress" as const,
            priority: "high" as const
          }
        ],
        legs: [
          {
            id: "leg7",
            name: "Content Strategy",
            description: "Social media content planning",
            status: "completed" as const,
            progress: 100,
            tasks: []
          },
          {
            id: "leg8",
            name: "Influencer Network",
            description: "Building industry relationships",
            status: "active" as const,
            progress: 65,
            tasks: []
          },
          {
            id: "leg9",
            name: "Engagement Analytics",
            description: "Social media performance tracking",
            status: "planning" as const,
            progress: 20,
            tasks: []
          }
        ]
      }
    ]
  },
  { 
    id: "n2", 
    x: 600, 
    y: 120, 
    r: 22, 
    title: "Velocity", 
    projectId: "p2",
    subProjects: [
      {
        id: "sub4",
        name: "Growth Hacking",
        category: "growth" as const,
        status: "active" as const,
        progress: 45,
        description: "Implement viral growth loops and referral system",
        tasks: [
          {
            id: "task8",
            title: "Implement referral system",
            description: "Build user referral program with rewards",
            status: "in-progress" as const,
            priority: "high" as const
          },
          {
            id: "task9",
            title: "A/B test onboarding flow",
            description: "Optimize user activation process",
            status: "todo" as const,
            priority: "medium" as const
          }
        ]
      },
      {
        id: "sub5",
        name: "Content Marketing",
        category: "marketing" as const,
        status: "completed" as const,
        progress: 100,
        description: "Blog and educational content creation",
        tasks: [
          {
            id: "task10",
            title: "Write technical blog posts",
            description: "Create educational content about SaaS best practices",
            status: "completed" as const,
            priority: "medium" as const
          }
        ]
      }
    ]
  },
  { 
    id: "n3", 
    x: 900, 
    y: 300, 
    r: 24, 
    title: "Verstige", 
    projectId: "p3",
    subProjects: [
      {
        id: "sub6",
        name: "Enterprise Sales",
        category: "sales" as const,
        status: "active" as const,
        progress: 85,
        description: "Target enterprise clients for pilot program",
        tasks: [
          {
            id: "task11",
            title: "Pilot program proposal",
            description: "Create detailed proposal for enterprise clients",
            status: "completed" as const,
            priority: "urgent" as const
          },
          {
            id: "task12",
            title: "Schedule client meetings",
            description: "Book demos with potential enterprise customers",
            status: "in-progress" as const,
            priority: "high" as const
          }
        ]
      },
      {
        id: "sub7",
        name: "Community Building",
        category: "social-media" as const,
        status: "planning" as const,
        progress: 20,
        description: "Build developer community around Web3 identity",
        tasks: [
          {
            id: "task13",
            title: "Setup Discord server",
            description: "Create community platform for developers",
            status: "todo" as const,
            priority: "medium" as const
          }
        ]
      },
      {
        id: "sub8",
        name: "Product-Market Fit",
        category: "growth" as const,
        status: "active" as const,
        progress: 70,
        description: "Validate product-market fit with pilot customers",
        tasks: [
          {
            id: "task14",
            title: "User feedback analysis",
            description: "Analyze feedback from pilot customers",
            status: "in-progress" as const,
            priority: "high" as const
          },
          {
            id: "task15",
            title: "Product iteration plan",
            description: "Plan improvements based on user feedback",
            status: "todo" as const,
            priority: "medium" as const
          }
        ]
      }
    ]
  },
];

const mindmapEdges = [
  { from: "n1", to: "n2" },
  { from: "n2", to: "n3" },
];

export default function Index() {
  const { user, logout } = useFirebaseAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Test data persistence for julylan@vitatechhealing.com
  useEffect(() => {
    if (user && user.email === 'julylan@vitatechhealing.com') {
      console.log('🔍 Running data persistence test for julylan@vitatechhealing.com');
      // Test will be handled by Firebase debugging tools
    }
  }, [user]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([]);
  const [activeBusiness, setActiveBusiness] = useState<Business | null>(null);
  const [isBusinessSelectorOpen, setIsBusinessSelectorOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<FirebaseWorkspaceTask[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isQuickSwitcherOpen, setIsQuickSwitcherOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize AI Agent Integration
  const {
    notifyProjectChange,
    notifyTaskChange,
    notifyEmailChange,
    notifyCRMChange,
    getSyncStats
  } = useAIAgentIntegration({ autoSync: false }); // Disabled until Firebase migration
  const [currentTab, setCurrentTab] = useState<WorkspaceTab>("mindmap");
  const [currentUserRole] = useState<"owner" | "admin" | "member" | "viewer">("admin");
  const [dynamicMindmapNodes, setDynamicMindmapNodes] = useState([]);
  const [hasEverCreatedProject, setHasEverCreatedProject] = useState(false);
  
  // Mobile-specific state
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isLayouting, setIsLayouting] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  // Load tasks from Firebase for Nova AI
  useEffect(() => {
    if (!user?.uid) {
      setTasks([]);
      return;
    }

    const teamId = 'default-team';
    console.log('🔄 Loading tasks for Nova AI...');

    const unsubscribe = FirebaseWorkspaceTasksService.subscribeToTasks(
      user.uid,
      teamId,
      (loadedTasks) => {
        console.log('✅ Tasks loaded for Nova AI:', loadedTasks.length);
        setTasks(loadedTasks);
      }
    );

    return () => {
      try {
        unsubscribe();
      } catch (error) {
        console.error('❌ Error unsubscribing from tasks:', error);
      }
    };
  }, [user?.uid]);

  // Load notes from Firebase for Nova AI
  useEffect(() => {
    if (!user?.uid) {
      setNotes([]);
      return;
    }

    const teamId = 'default-team';
    console.log('🔄 Loading notes for Nova AI...');

    const loadNotes = async () => {
      try {
        const loadedNotes = await FirebaseNotesService.getNotes(user.uid, teamId);
        console.log('✅ Notes loaded for Nova AI:', loadedNotes.length);
        setNotes(loadedNotes);
      } catch (error) {
        console.error('❌ Error loading notes:', error);
        setNotes([]);
      }
    };

    loadNotes();
    // Reload every 30 seconds to keep notes updated
    const interval = setInterval(loadNotes, 30 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, [user?.uid]);

  // Load contacts from Firebase for Nova AI
  useEffect(() => {
    if (!user?.uid) {
      setContacts([]);
      return;
    }

    const teamId = 'default-team';
    console.log('🔄 Loading contacts for Nova AI...');

    const loadContacts = async () => {
      try {
        const loadedContacts = await FirebaseContactsService.getContacts(user.uid, teamId);
        console.log('✅ Contacts loaded for Nova AI:', loadedContacts.length);
        setContacts(loadedContacts);
      } catch (error) {
        console.error('❌ Error loading contacts:', error);
        setContacts([]);
      }
    };

    loadContacts();
    // Reload every 30 seconds to keep contacts updated
    const interval = setInterval(loadContacts, 30 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, [user?.uid]);

  // Load calendar events from Firebase for Nova AI
  useEffect(() => {
    if (!user?.uid) {
      setCalendarEvents([]);
      return;
    }

    const teamId = 'default-team';
    console.log('🔄 Loading calendar events for Nova AI...');

    const loadEvents = async () => {
      try {
        const events = await FirebaseCalendarEventsService.getEvents(user.uid, teamId);
        console.log('✅ Calendar events loaded for Nova AI:', events.length);
        setCalendarEvents(events);
      } catch (error) {
        console.error('❌ Error loading calendar events:', error);
        setCalendarEvents([]);
      }
    };

    loadEvents();
    // Reload every 5 minutes to keep calendar events updated
    const interval = setInterval(loadEvents, 5 * 60 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, [user?.uid]);

  // Load bookings from Firebase for Nova AI
  useEffect(() => {
    if (!user?.uid) {
      setBookings([]);
      return;
    }

    const teamId = 'default-team';
    console.log('🔄 Loading bookings for Nova AI...');

    const loadBookings = async () => {
      try {
        const loadedBookings = await FirebaseBookingsService.getBookings(user.uid, teamId);
        console.log('✅ Bookings loaded for Nova AI:', loadedBookings.length);
        setBookings(loadedBookings);
      } catch (error) {
        console.error('❌ Error loading bookings:', error);
        setBookings([]);
      }
    };

    loadBookings();
    // Reload every 2 minutes to keep bookings updated
    const interval = setInterval(loadBookings, 2 * 60 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, [user?.uid]);

  // Load expenses from Firebase for Nova AI
  useEffect(() => {
    if (!user?.uid) {
      setExpenses([]);
      return;
    }

    const teamId = 'default-team';
    console.log('🔄 Loading expenses for Nova AI...');

    const unsubscribe = FirebaseExpensesService.subscribeToExpenses(
      user.uid,
      teamId,
      undefined, // No filters - get all expenses
      (loadedExpenses) => {
        console.log('✅ Expenses loaded for Nova AI:', loadedExpenses.length);
        setExpenses(loadedExpenses);
      }
    );

    return () => {
      try {
        unsubscribe();
      } catch (error) {
        console.error('❌ Error unsubscribing from expenses:', error);
      }
    };
  }, [user?.uid]);

  // Handle new project creation
  const handleAddNewProject = (projectData: { title: string; description: string }) => {
    const newProject: Project = {
      id: `p${Date.now()}`,
      name: projectData.title,
      description: projectData.description,
      status: "Active",
      priority: "medium"
    };

    // Get the rightmost node from current dynamic nodes
    const currentNodes = dynamicMindmapNodes.length > 0 ? dynamicMindmapNodes : [];
    const rightmostNode = currentNodes.length > 0 ? currentNodes.reduce((prev, current) => 
      (prev.x > current.x) ? prev : current
    ) : { x: 100, y: 100 }; // Default position for first node
    
    const newNode = {
      id: `n${Date.now()}`,
      x: Math.min(rightmostNode.x + 300, 1000),
      y: rightmostNode.y + (Math.random() - 0.5) * 200,
      r: 24,
      title: projectData.title,
      projectId: newProject.id,
      subProjects: []
    };

    // Update both projects and mindmap nodes
    const updatedProjects = [...projects, newProject];
    const updatedNodes = [...dynamicMindmapNodes, newNode];
    
    setProjects(updatedProjects);
    setDynamicMindmapNodes(updatedNodes);
    
    // Save to localStorage with user-specific keys
    const userId = user?.uid || 'anonymous';
    localStorage.setItem(`userProjects_${userId}`, JSON.stringify(updatedProjects));
    localStorage.setItem(`userMindmapNodes_${userId}`, JSON.stringify(updatedNodes));
    localStorage.setItem(`hasEverCreatedProject_${userId}`, 'true'); // Mark that user has created a project
    
    // Update state
    setHasEverCreatedProject(true);
    
    console.log("New project added:", newProject);
    console.log("New node created:", newNode);
    console.log("Saved for user:", userId);
  };

  // Handle new sub-project creation
  const handleAddNewSubProject = (parentProjectId: string, subProjectData: any) => {
    const newSubProject = {
      id: `sub_${Date.now()}`,
      name: subProjectData.name,
      category: subProjectData.category,
      status: subProjectData.status,
      progress: subProjectData.progress || 0,
      description: subProjectData.description,
      tasks: []
    };

    // Update the mindmap nodes to include the new sub-project
    const updatedNodes = dynamicMindmapNodes.map(node => {
        if (node.projectId === parentProjectId) {
          return {
            ...node,
            subProjects: [...(node.subProjects || []), newSubProject]
          };
        }
        return node;
    });
    
    setDynamicMindmapNodes(updatedNodes);
    
    // Save to localStorage
    localStorage.setItem('userMindmapNodes', JSON.stringify(updatedNodes));

    console.log("New sub-project added to", parentProjectId, ":", newSubProject);
  };

  // Handle new leg creation
  const handleAddNewLeg = (parentSubProjectId: string, legData: any) => {
    const newLeg = {
      id: `leg_${Date.now()}`,
      name: legData.name,
      description: legData.description,
      status: legData.status,
      progress: legData.progress || 0,
      tasks: []
    };

    // Update the mindmap nodes to include the new leg
    const updatedNodes = dynamicMindmapNodes.map(node => ({
        ...node,
        subProjects: node.subProjects?.map(subProject => 
          subProject.id === parentSubProjectId 
            ? {
                ...subProject,
                legs: [...(subProject.legs || []), newLeg]
              }
            : subProject
        )
    }));
    
    setDynamicMindmapNodes(updatedNodes);
    
    // Save to localStorage
    localStorage.setItem('userMindmapNodes', JSON.stringify(updatedNodes));

    console.log("New leg added to", parentSubProjectId, ":", newLeg);
  };

  // Load initial data
  useEffect(() => {
    let mounted = true;

    const loadInitialData = async () => {
      setIsLoading(true);
      
      try {
        console.log('🔄 Loading initial data...');
        
        // Projects are now loaded directly by EnhancedProjectMap component
        // No need to load from Supabase anymore
        
        if (mounted) {
          setProjects([]); // Initialize empty projects array
          setBusinesses([]); // Initialize empty businesses array
          setFilteredBusinesses([]);
          setDynamicMindmapNodes([]); // Initialize empty nodes array
          setHasEverCreatedProject(false);
        }
      } catch (error) {
        console.error('❌ Error loading initial data:', error);
      } finally {
        if (mounted) {
      setIsLoading(false);
        }
      }
    };

    loadInitialData();

    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (mounted) {
        console.log('Index loading timeout - setting loading to false');
        setIsLoading(false);
      }
    }, 5000); // 5 second timeout

    return () => {
      mounted = false;
      clearTimeout(timeout);
    };
  }, [user?.uid]); // Add user.id as dependency

  // Load active project from localStorage on mount
  useEffect(() => {
    if (projects.length > 0 && user?.uid) {
      const userId = user.uid;
      const savedActiveProjectId = localStorage.getItem(`activeProjectId_${userId}`);
      if (savedActiveProjectId) {
        const savedProject = projects.find(p => p.id === savedActiveProjectId);
        if (savedProject) {
          setActiveProject(savedProject);
        }
      }
    }
  }, [projects, user?.uid]);

  // Save active project to localStorage when it changes
  useEffect(() => {
    if (activeProject && user?.uid) {
      const userId = user.uid;
      localStorage.setItem(`activeProjectId_${userId}`, activeProject.id);
    } else if (!activeProject && user?.uid) {
      const userId = user.uid;
      localStorage.removeItem(`activeProjectId_${userId}`);
    }
  }, [activeProject, user?.uid]);

  // Tasks are now loaded from Firebase in the useEffect above
  // Removed localStorage loading as tasks are now managed by Firebase

  // Nova AI Action Handler
  const handleNovaAction = async (action: {
    type: string;
    data: any;
  }) => {
    if (!user?.uid) {
      toast({
        title: "Error",
        description: "You must be logged in to perform actions.",
        variant: "destructive"
      });
      return;
    }

    const teamId = 'default-team';
    const currentUser = getUserDisplayName(user);

    try {
      switch (action.type) {
        case 'create_task':
          await FirebaseWorkspaceTasksService.createTask(
            {
              title: action.data.title,
              description: action.data.description || '',
              status: action.data.status || 'todo',
              priority: action.data.priority || 'medium',
              assignee: action.data.assignee || currentUser,
              assigneeAvatar: null,
              tags: action.data.tags || [],
              visibility: 'team',
              subtasks: []
            },
            user.uid,
            teamId
          );
          toast({
            title: "Task Created",
            description: `Task "${action.data.title}" has been created.`,
          });
          break;

        case 'delete_task':
          if (!action.data.id) {
            throw new Error('Task ID is required');
          }
          await FirebaseWorkspaceTasksService.deleteTask(action.data.id, user.uid, teamId);
          toast({
            title: "Task Deleted",
            description: "The task has been deleted.",
          });
          break;

        case 'create_note':
          await FirebaseNotesService.createNote(user.uid, teamId, {
            title: action.data.title,
            content: action.data.content || '',
            tags: action.data.tags || [],
            visibility: action.data.visibility || 'private'
          });
          toast({
            title: "Note Created",
            description: `Note "${action.data.title}" has been created.`,
          });
          break;

        case 'delete_note':
          if (!action.data.id) {
            throw new Error('Note ID is required');
          }
          await FirebaseNotesService.deleteNote(user.uid, teamId, action.data.id);
          toast({
            title: "Note Deleted",
            description: "The note has been deleted.",
          });
          break;

        case 'create_contact':
          await FirebaseContactsService.createContact(user.uid, teamId, {
            name: action.data.name,
            email: action.data.email || '',
            phone: action.data.phone || '',
            company: action.data.company || '',
            status: (action.data.status || 'lead') as 'lead' | 'prospect' | 'customer' | 'inactive',
            source: action.data.source || 'manual',
            tags: action.data.tags || []
          });
          toast({
            title: "Contact Created",
            description: `Contact "${action.data.name}" has been added.`,
          });
          break;

        case 'delete_contact':
          if (!action.data.id) {
            throw new Error('Contact ID is required');
          }
          await FirebaseContactsService.deleteContact(user.uid, teamId, action.data.id);
          toast({
            title: "Contact Deleted",
            description: "The contact has been deleted.",
          });
          break;

        case 'create_calendar_event':
          await FirebaseCalendarEventsService.createEvent(user.uid, teamId, {
            title: action.data.title,
            description: action.data.description || '',
            eventDate: action.data.eventDate ? new Date(action.data.eventDate) : new Date(),
            startTime: action.data.startTime || '',
            endTime: action.data.endTime || '',
            location: action.data.location || ''
          });
          toast({
            title: "Event Created",
            description: `Event "${action.data.title}" has been added to your calendar.`,
          });
          break;

        case 'delete_calendar_event':
          if (!action.data.id) {
            throw new Error('Event ID is required');
          }
          await FirebaseCalendarEventsService.deleteEvent(user.uid, teamId, action.data.id);
          toast({
            title: "Event Deleted",
            description: "The event has been deleted.",
          });
          break;

        case 'create_expense':
          await FirebaseExpensesService.createExpense(user.uid, teamId, {
            type: action.data.type || 'business',
            category: action.data.category || 'other-business',
            amount: parseFloat(action.data.amount),
            currency: action.data.currency || 'USD',
            description: action.data.description,
            date: action.data.date ? new Date(action.data.date) : new Date(),
            vendor: action.data.vendor || '',
            tags: action.data.tags || [],
            status: 'pending'
          });
          toast({
            title: "Expense Created",
            description: `Expense "${action.data.description}" has been added.`,
          });
          break;

        case 'delete_expense':
          if (!action.data.id) {
            throw new Error('Expense ID is required');
          }
          await FirebaseExpensesService.deleteExpense(user.uid, teamId, action.data.id);
          toast({
            title: "Expense Deleted",
            description: "The expense has been deleted.",
          });
          break;

        default:
          console.warn('Unknown action type:', action.type);
          toast({
            title: "Unknown Action",
            description: `Action type "${action.type}" is not supported.`,
            variant: "destructive"
          });
      }
    } catch (error: any) {
      console.error('Error performing action:', error);
      toast({
        title: "Error",
        description: `Failed to ${action.type.replace(/_/g, ' ')}. ${error.message || 'Please try again.'}`,
        variant: "destructive"
      });
      throw error; // Re-throw so Nova can handle it
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K for quick switcher
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsQuickSwitcherOpen(true);
      }
      // Esc to close active project or modals
      if (e.key === 'Escape') {
        if (isQuickSwitcherOpen) {
          setIsQuickSwitcherOpen(false);
        } else if (activeProject) {
          setActiveProject(null);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeProject, isQuickSwitcherOpen]);

  const handleOpenProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setActiveProject(project);
    }
  };

  // Function to refresh businesses from database
  const refreshBusinesses = async () => {
    try {
      console.log('🔄 Refreshing businesses from database...');
      const userBusinesses = []; // This will be loaded by EnhancedProjectMap
      setBusinesses(userBusinesses);
      setFilteredBusinesses(userBusinesses);
      console.log('✅ Businesses refreshed:', userBusinesses.length);
      return userBusinesses;
    } catch (error) {
      console.error('❌ Error refreshing businesses:', error);
      return [];
    }
  };

  const handleBusinessMapSelect = async (businessId: string) => {
    console.log('🎯 Business selected from map:', businessId);
    
    // 🔥 Refresh businesses first to get the latest data
    const refreshedBusinesses = await refreshBusinesses();
    console.log('📊 Available businesses after refresh:', refreshedBusinesses.length);
    
    const business = refreshedBusinesses.find(b => b.id === businessId);
    if (business) {
      console.log('✅ Business found:', business.name);
      setActiveBusiness(business);
      // Load projects for this business
      const businessProjects = projects.filter(p => p.businessId === businessId);
      setProjects(businessProjects);
    } else {
      console.log('❌ Business not found with ID:', businessId);
    }
  };


  const handleCloseProject = () => {
    setActiveProject(null);
  };

  const handleSearch = (query: string) => {
    if (query.trim() === '') {
      setFilteredBusinesses(businesses);
    } else {
      const filtered = businesses.filter(business =>
        business.name.toLowerCase().includes(query.toLowerCase()) ||
        business.description.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredBusinesses(filtered);
    }
  };

  // Mobile menu handlers
  const onDashboard = () => setShowDashboard(true);
  const onCalendar = () => setCurrentTab('calendar');
  const onConnections = () => setCurrentTab('crm');
  const onTasks = () => setCurrentTab('tasks');
  const onEmail = () => setCurrentTab('email');
  const onNotes = () => setCurrentTab('notes');
  const onTimer = () => setCurrentTab('timer');
  const onTeam = () => setCurrentTab('team');
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Mobile-specific handlers
  const handleMobileElementCreate = (element: any) => {
    console.log('Creating mobile element:', element);
    // TODO: Implement mobile element creation
    // This would integrate with the existing project creation logic
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev / 1.2, 0.1));
  };

  const handleReset = () => {
    setZoomLevel(1);
  };

  const handleLayout = async () => {
    setIsLayouting(true);
    // TODO: Implement layout logic
    setTimeout(() => setIsLayouting(false), 2000);
  };

  const handleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  };

  // Business selector handlers
  const handleSelectBusiness = (business: Business) => {
    setActiveBusiness(business);
    setIsBusinessSelectorOpen(false);
    // Load projects for this business
    const businessProjects = projects.filter(p => p.businessId === business.id);
    setProjects(businessProjects);
  };

  const handleCreateBusiness = async (businessData: Omit<Business, 'id'>) => {
    try {
      // Create new business (handled by EnhancedProjectMap)
      console.log('🔄 Creating new business:', businessData);
      // Business creation is now handled by EnhancedProjectMap component
      const createdBusiness = { ...businessData, id: `temp_${Date.now()}` };
      
      console.log('✅ Business created locally:', createdBusiness);
      setBusinesses(prev => {
        const updated = [...prev, createdBusiness];
        console.log('📊 Updated businesses list:', updated);
        return updated;
      });
      setActiveBusiness(createdBusiness);
      setIsBusinessSelectorOpen(false); // Close the business selector modal
      console.log('✅ Business created and added to state:', createdBusiness.name);
    } catch (error) {
      console.error('❌ Error creating business:', error);
    }
  };




  const handleQuickSwitcherSelect = (projectId: string) => {
    handleOpenProject(projectId);
    setIsQuickSwitcherOpen(false);
  };

  const handleUpdateBusiness = async (updatedBusiness: Business) => {
    try {
      console.log('📝 Updating business locally:', updatedBusiness.id);
      
      // Business updates are now handled by EnhancedProjectMap component
      console.log('✅ Business updated locally');
      
      const updatedBusinesses = businesses.map(b => 
        b.id === updatedBusiness.id ? updatedBusiness : b
      );
      setBusinesses(updatedBusinesses);
      setFilteredBusinesses(updatedBusinesses);
      setActiveBusiness(updatedBusiness);
      
      // Also save to localStorage as backup
      const userId = user?.uid || 'anonymous';
      localStorage.setItem(`userBusinesses_${userId}`, JSON.stringify(updatedBusinesses));
    } catch (error) {
      console.error('❌ Error updating business:', error);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      console.log('🗑️ Deleting project locally:', projectId);
      
      const projectToDelete = projects.find(p => p.id === projectId);
      
      // Project deletion is now handled by EnhancedProjectMap component
      
      console.log('✅ Project deleted locally');
      
      const updatedProjects = projects.filter(p => p.id !== projectId);
      setProjects(updatedProjects);
      setFilteredBusinesses(updatedProjects);
      
      // Clear active project if it was deleted
      if (activeProject?.id === projectId) {
        setActiveProject(null);
      }
      
      // Notify AI agents of deleted project
      if (projectToDelete) {
        notifyProjectChange('deleted', projectToDelete);
      }
      
      // Also save to localStorage as backup
      const userId = user?.uid || 'anonymous';
      localStorage.setItem(`userProjects_${userId}`, JSON.stringify(updatedProjects));
    } catch (error) {
      console.error('❌ Error deleting project:', error);
      // TODO: Show error toast to user
    }
  };

  // New handler functions for sidebar buttons
  const handleProjectMap = () => {
    setCurrentTab('mindmap');
  };

  const handleNotes = () => {
    setCurrentTab('notes');
  };

  const handleTasks = () => {
    setCurrentTab('tasks');
  };

  const handleTeam = () => {
    setCurrentTab('team');
  };

  const handleTimer = () => {
    setCurrentTab('timer');
  };

  // Listen for external tab navigation requests
  useEffect(() => {
    const handleNavigateToTab = (event: CustomEvent) => {
      const tab = event.detail;
      setCurrentTab(tab as WorkspaceTab);
    };

    window.addEventListener('navigateToTab', handleNavigateToTab as EventListener);
    
    return () => {
      window.removeEventListener('navigateToTab', handleNavigateToTab as EventListener);
    };
  }, []);

  // Debug function to clear localStorage (can be called from console)
  const clearUserData = () => {
    const userId = user?.uid || 'anonymous';
    localStorage.removeItem(`userProjects_${userId}`);
    localStorage.removeItem(`userMindmapNodes_${userId}`);
    localStorage.removeItem(`activeProjectId_${userId}`);
    localStorage.removeItem(`hasEverCreatedProject_${userId}`);
    setProjects([]);
    setFilteredBusinesses([]);
    setDynamicMindmapNodes([]);
    setActiveProject(null);
    setHasEverCreatedProject(false);
    console.log('User data cleared');
  };

  const debugLoadingState = () => {
    console.log('=== Loading State Debug ===');
    console.log('isLoading:', isLoading);
    console.log('projects.length:', projects.length);
    console.log('filteredBusinesses.length:', filteredBusinesses.length);
    console.log('dynamicMindmapNodes.length:', dynamicMindmapNodes.length);
    console.log('activeProject:', activeProject);
    const userId = user?.uid || 'anonymous';
    console.log('localStorage userProjects:', localStorage.getItem(`userProjects_${userId}`) ? 'exists' : 'missing');
    console.log('localStorage userMindmapNodes:', localStorage.getItem(`userMindmapNodes_${userId}`) ? 'exists' : 'missing');
    console.log('localStorage activeProjectId:', localStorage.getItem(`activeProjectId_${userId}`));
  };


  // Make debug functions available globally for troubleshooting
  (window as any).clearUserData = clearUserData;
  (window as any).debugLoadingState = debugLoadingState;

  return (
    <MobileLayout
      currentTab={currentTab}
      onTabChange={setCurrentTab}
      onElementCreate={handleMobileElementCreate}
      onZoomIn={handleZoomIn}
      onZoomOut={handleZoomOut}
      onReset={handleReset}
      onLayout={handleLayout}
      onSearch={() => setIsQuickSwitcherOpen(true)}
      onFullscreen={handleFullscreen}
      zoomLevel={zoomLevel}
      isLayouting={isLayouting}
    >
    <div className="flex h-screen bg-gradient-subtle overflow-hidden">
      {/* Sidebar */}
        <div className="hidden xl:block">
      <Sidebar 
          onDashboard={() => setShowDashboard(true)}
          onConnections={() => {
            setCurrentTab('crm');
          }}
          onEmail={() => {
            setCurrentTab('email');
          }}
          onProjectMap={handleProjectMap}
          onCalendar={() => {
            setCurrentTab('calendar');
          }}
          onProjects={() => {
            setCurrentTab('projects');
          }}
          onNotes={handleNotes}
          onTasks={handleTasks}
          onTeam={handleTeam}
          onTimer={handleTimer}
          onBookings={() => {
            setCurrentTab('bookings');
          }}
          onExpenses={() => {
            setCurrentTab('expenses');
          }}
          onNavigateToTab={(tab) => setCurrentTab(tab as WorkspaceTab)}
        projects={projects}
        isLoading={isLoading}
          hasEverCreatedProject={hasEverCreatedProject}
      />
          </div>

      {/* Main Content */}
        <div className="flex-1 overflow-auto bg-gradient-subtle scrollbar-none">
        {/* Main Dashboard Content */}
        <>
            {/* Mobile Header */}
            <div className="xl:hidden bg-background/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
          <div className="flex items-center justify-between p-3 sm:p-4">
            <div className="flex items-center space-x-2">
              <img 
                src="/nexus-logo.png"
                alt="Nexus AI Logo"
                className="w-7 h-7 sm:w-8 sm:h-8 object-contain logo-img"
                loading="eager"
                decoding="sync"
                width={32}
                height={32}
              />
              <span className="font-semibold text-foreground text-sm sm:text-base">Nexus</span>
          </div>
                <div className="flex items-center gap-2">
                  <ProfileDropdown />
                </div>
                </div>

              </div>

        
        <div className="p-3 sm:p-4 md:p-6 lg:p-8">
          {/* Main workspace content */}
          <>
          {/* Header */}
              <div className="mb-4 sm:mb-6 md:mb-8 animate-fade-in">
                <div className="flex items-start justify-between">
                  <div>
                    {/* Profile dropdown removed */}
          </div>
        </div>
      </div>

          {/* Nova AI Chat Interface */}
          <div className="mb-6 sm:mb-8 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <NovaChatInterface 
              userName={getUserDisplayName(user)}
              workspaceContext={{
                projects: filteredBusinesses.map(p => ({
              id: p.id,
              name: p.name,
                  description: p.description || '',
              status: p.status,
              priority: p.priority,
                  // Enhanced business details for Nova AI
                  location: p.location,
                  website: p.website,
                  industry: p.industry,
                  products: p.products,
                  targetAudience: p.targetAudience,
                  businessStage: p.businessStage,
                  revenue: p.revenue,
                  employees: p.employees,
                  founded: p.founded,
                  contactEmail: p.contactEmail,
                  phone: p.phone,
                  socialMedia: p.socialMedia,
                  additionalNotes: p.additionalNotes
                })),
                tasks: tasks.map(task => ({
                  id: task.id,
                  title: task.title,
                  description: task.description || '',
                  status: task.status,
                  assignee: task.assignee,
                  projectId: task.projectId || ''
                })),
                teamMembers: [],
                notes: notes.map(note => ({
                  id: note.id,
                  title: note.title,
                  content: note.content || '',
                  projectId: '' // Notes don't have projectId in the current schema
                })),
                currentUser: {
                  name: getUserDisplayName(user),
                  email: user?.email || ''
                },
                businessStage: 'startup', // TODO: Add business stage selection
                industry: 'technology', // TODO: Add industry selection
                // Additional context for Nova AI
                contacts: contacts.map(contact => ({
                  id: contact.id,
                  name: contact.name,
                  email: contact.email || '',
                  phone: contact.phone || '',
                  company: contact.company || '',
                  status: contact.status || 'active'
                })),
                calendarEvents: calendarEvents.map(event => ({
                  id: event.id,
                  title: event.title,
                  description: event.description || '',
                  eventDate: event.eventDate instanceof Date ? event.eventDate : (event.eventDate ? new Date(event.eventDate) : new Date()),
                  startTime: event.startTime || '',
                  endTime: event.endTime || '',
                  location: event.location || ''
                })),
                bookings: bookings.map(booking => ({
                  id: booking.id,
                  customerName: booking.customerName,
                  customerEmail: booking.customerEmail,
                  templateId: booking.templateId,
                  scheduledDate: booking.startTime instanceof Date ? booking.startTime : (booking.startTime ? new Date(booking.startTime) : new Date()),
                  status: booking.status
                })),
                expenses: expenses.map(expense => ({
                  id: expense.id,
                  type: expense.type,
                  amount: expense.amount,
                  currency: expense.currency,
                  description: expense.description,
                  date: expense.date instanceof Date ? expense.date : (expense.date ? new Date(expense.date) : new Date()),
                  status: expense.status,
                  category: expense.category
                }))
              }}
              onSendMessage={(message) => console.log("Nova AI Message:", message)}
              onAction={handleNovaAction}
              onAppLibrary={() => setCurrentTab('mindmap')}
              onNavigateToTab={(tab) => setCurrentTab(tab as any)}
            />
      </div>


          {/* Workspace Tabs */}
          <WorkspaceTabs
            activeTab={currentTab}
            onTabChange={setCurrentTab}
            userRole={currentUserRole}
            mindmapContent={
              isLoading ? (
                <MindmapSkeleton />
              ) : (
                <EnhancedProjectMap
                  onProjectSelect={handleBusinessMapSelect}
                  selectedProjectId={activeBusiness?.id}
                  projects={businesses}
                  onProjectCreated={refreshBusinesses}
                  onMobileElementCreate={handleMobileElementCreate}
                />
              )
            }
            notesContent={<BuiltInNotes />}
            tasksContent={
              <ViewableTasks 
                projectId={activeProject?.id}
                currentUser={user?.displayName || user?.email || "Current User"}
                teamId="default-team"
              />
            }
            teamContent={<TeamManagement />}
            timerContent={
              <TimeTracker 
                userId={user?.uid || "current-user"} 
                teamId="default-team"
              />
            }
            crmContent={<CRMDashboard />}
            emailContent={<EmailDashboard />}
            calendarContent={
              <WorkspaceCalendar 
                tasks={tasks.map(task => ({
                  id: task.id,
                  title: task.title,
                  dueDate: task.dueDate,
                  status: task.status,
                  priority: task.priority
                }))}
              />
            }
            bookingsContent={<BookingManager />}
            projectsContent={<ProjectManagement />}
            expensesContent={<ExpensesDashboard />}
            taskNotifications={0}
            teamNotifications={0}
            timerNotifications={0}
            crmNotifications={0}
            emailNotifications={0}
            calendarNotifications={0}
            bookingsNotifications={0}
          />


            </>
            </div>






      {/* Quick Switcher */}
      <QuickSwitcher
        isOpen={isQuickSwitcherOpen}
        onClose={() => setIsQuickSwitcherOpen(false)}
        projects={projects}
        onSelectProject={handleQuickSwitcherSelect}
      />

          {/* Dashboard Directory */}
          {showDashboard && (
            <DashboardDirectory
              onSelectTab={(tab) => {
                setCurrentTab(tab as WorkspaceTab);
                setShowDashboard(false);
              }}
              onClose={() => setShowDashboard(false)}
            />
          )}
        </>
    </div>

        {/* Business Selector */}
        <BusinessSelector
          isOpen={isBusinessSelectorOpen}
          onClose={() => setIsBusinessSelectorOpen(false)}
          onSelectBusiness={handleSelectBusiness}
          onCreateBusiness={handleCreateBusiness}
          businesses={businesses}
          selectedBusiness={activeBusiness}
        />

        {/* Floating App Drawer */}
        <FloatingAppDrawer
          onNavigateToTab={(tab) => setCurrentTab(tab as WorkspaceTab)}
          onAppLibrary={() => setCurrentTab('mindmap')}
        />
      </div>
    </MobileLayout>
  );
}


