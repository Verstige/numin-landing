import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import NovaShowcase from "./NovaShowcase";
import { 
  ArrowRight, 
  Sparkles, 
  Zap, 
  Target, 
  Users, 
  TrendingUp,
  Brain,
  Network,
  Play,
  CheckCircle,
  Star,
  Globe,
  Shield,
  Clock,
  ArrowDown,
  ChevronRight,
  Rocket,
  Lightbulb,
  BarChart3,
  Layers,
  MapPin,
  GitBranch,
  Timer,
  FileText,
  CheckSquare,
  MessageSquare,
  Activity,
  ArrowUpRight,
  Bot,
  Workflow,
  Code,
  Webhook,
  Merge,
  Split,
  Users2,
  Calendar,
  DollarSign,
  Building2,
  Phone,
  Mail,
  PieChart,
  Gauge,
  Crown,
  Maximize,
  Minus
} from "lucide-react";

const LandingPage = () => {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [typingText, setTypingText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const feature = features[currentFeature];
    const text = feature.title;
    let currentIndex = 0;
    
    const typingInterval = setInterval(() => {
      if (currentIndex < text.length) {
        setTypingText(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
        
        // Wait a bit, then start erasing
        setTimeout(() => {
          setIsTyping(false);
          const erasingInterval = setInterval(() => {
            if (currentIndex > 0) {
              setTypingText(text.slice(0, currentIndex - 1));
              currentIndex--;
            } else {
              clearInterval(erasingInterval);
              setIsTyping(true);
              setCurrentFeature((prev) => (prev + 1) % features.length);
            }
          }, 50);
        }, 1500);
      }
    }, 100);

    return () => clearInterval(typingInterval);
  }, [currentFeature]);

  const features = [
    {
      icon: Network,
      title: "ProjectMaps",
      description: "Visualize your entire project ecosystem with dynamic, zoomable ProjectMaps",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: CheckSquare,
      title: "Tasks",
      description: "Built-in task tracking with status updates, priorities, and progress monitoring",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: FileText,
      title: "Notes",
      description: "Project-specific notes, documentation, and knowledge management",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Timer,
      title: "Timer",
      description: "Clockify-style time tracking with detailed analytics and reporting",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Users,
      title: "Team",
      description: "Team management, activity feeds, and real-time collaboration tools",
      color: "from-blue-500 to-blue-600"
    },
            {
              icon: MessageSquare,
              title: "Nova AI",
              description: "Your intelligent project companion with voice input and smart suggestions",
              color: "from-blue-500 to-blue-600"
            }
  ];

  const stats = [
    { number: "10x", label: "Faster Project Planning" },
    { number: "95%", label: "Better Organization" },
    { number: "360°", label: "Project Visibility" },
    { number: "∞", label: "Scalability" }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Project Manager",
      company: "TechCorp",
      content: "Nexus transformed how we manage complex projects. The ProjectMap visualization is incredible!",
      avatar: "👩‍💼"
    },
    {
      name: "Marcus Johnson",
      role: "CEO",
      company: "StartupXYZ",
      content: "Finally, a platform that scales with our growth. The 3-level hierarchy is perfect for our needs.",
      avatar: "👨‍💻"
    },
    {
      name: "Elena Rodriguez",
      role: "Marketing Director",
      company: "BrandStudio",
      content: "The ProjectMap visualization is game-changing. Our team collaboration has never been better.",
      avatar: "👩‍🎨"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Simple Black Background */}
      <div className="absolute inset-0 bg-black"></div>

      {/* Enhanced Navigation */}
      <nav className="relative z-10 px-4 sm:px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src="/nexus-logo.png"
              alt="Nexus AI Logo"
              className="w-20 h-20 sm:w-24 sm:h-24 object-contain logo-img"
              loading="eager"
              decoding="sync"
              width={96}
              height={96}
            />
            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              Nexus AI
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105 font-medium">Features</a>
            <a href="#testimonials" className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105 font-medium">Testimonials</a>
            <a href="#stats" className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105 font-medium">Stats</a>
          </div>
          <Button 
            onClick={() => window.location.href = '/workspace'}
            className="bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 hover:from-blue-600 hover:via-purple-600 hover:to-blue-700 text-white border-0 text-sm sm:text-base px-4 sm:px-6 py-2.5 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105"
          >
            <span className="hidden sm:inline">Sign In</span>
            <span className="sm:hidden">Sign In</span>
            <ArrowRight className="w-4 h-4 ml-1 sm:ml-2" />
          </Button>
        </div>
      </nav>

      {/* Enhanced Hero Section */}
      <section className="relative z-10 px-4 sm:px-6 py-16 sm:py-24">
        
        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <Badge className="mb-6 sm:mb-8 bg-black/20 backdrop-blur-md text-gray-300 border-gray-700/40 text-sm sm:text-base px-4 py-2 shadow-lg shadow-black/20">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Mapping Things Together
            </Badge>
            
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-black mb-6 sm:mb-8 leading-tight tracking-tight">
              <span className="block text-white mb-2">Your Business</span>
              <span className="block bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                {typingText}
                <span className={`inline-block w-0.5 h-16 sm:h-20 md:h-24 bg-blue-400 ml-2 ${isTyping ? 'animate-pulse' : ''}`}></span>
              </span>
            </h1>
            
            <p className="text-lg sm:text-2xl md:text-3xl text-gray-200 mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed px-4 font-light">
              Transform your business operations with intelligent 
              <span className="text-blue-400 font-semibold"> AI agents</span>, 
              <span className="text-blue-500 font-semibold"> workflow automation</span>, and 
              <span className="text-blue-600 font-semibold"> visual business mapping</span>.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-12 sm:mb-16 px-4">
              <Button 
                size="lg"
                onClick={() => window.location.href = '/workspace'}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 px-8 sm:px-12 py-4 sm:py-5 text-lg sm:text-xl font-semibold w-full sm:w-auto shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105"
              >
                <Rocket className="w-5 h-5 sm:w-6 sm:h-6 mr-3" />
                Start Mapping
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => window.location.href = '/demo'}
                className="border-2 border-blue-400/50 text-blue-300 hover:bg-blue-400/10 hover:border-blue-400 px-8 sm:px-12 py-4 sm:py-5 text-lg sm:text-xl font-semibold w-full sm:w-auto backdrop-blur-sm transition-all duration-300 hover:scale-105 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20"
              >
                <Play className="w-5 h-5 sm:w-6 sm:h-6 mr-3" />
                Check out Demo
              </Button>
            </div>
          </div>

          {/* Enhanced Feature Icons - Tab Style */}
          <div className={`transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="max-w-5xl mx-auto px-4">
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-1 bg-black/30 backdrop-blur-md p-2 rounded-2xl border border-gray-700/40 shadow-2xl overflow-x-auto scrollbar-hide">
                  {features.slice(0, 6).map((feature, index) => {
                    const FeatureIcon = feature.icon;
                    const isActive = index === currentFeature;
                    
                    return (
                      <button
                        key={index}
                        onClick={() => setCurrentFeature(index)}
                        className={`relative flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-3 sm:py-4 rounded-xl transition-all duration-300 hover:bg-gray-800/60 focus:outline-none focus:ring-2 focus:ring-blue-500/30 min-w-[100px] sm:min-w-[140px] justify-center group flex-shrink-0 ${
                          isActive 
                            ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 shadow-lg border border-blue-500/40 text-white scale-105 backdrop-blur-sm" 
                            : "text-gray-400 hover:text-white hover:scale-105 hover:bg-gray-800/40"
                        }`}
                      >
                        <div className="flex items-center gap-1 sm:gap-2">
                          <FeatureIcon className={`w-3 h-3 sm:w-4 sm:h-4 transition-colors ${
                            isActive ? "text-blue-400" : "group-hover:text-blue-400"
                          }`} />
                          <span className="font-medium text-xs sm:text-sm hidden sm:inline">{feature.title}</span>
                          <span className="font-medium text-xs sm:hidden">{feature.title.slice(0, 3)}</span>
                        </div>
                        {isActive && (
                          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 sm:w-8 h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {/* Enhanced Feature Description */}
              <div className="text-center mt-6 sm:mt-8 px-4">
                <div className="inline-flex items-center gap-3 px-6 sm:px-8 py-4 bg-black/20 backdrop-blur-md rounded-2xl border border-gray-700/40 shadow-lg shadow-black/20">
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-pulse shadow-lg shadow-blue-400/50" />
                  <p className="text-sm sm:text-base font-medium text-gray-200 leading-relaxed">
                    {features[currentFeature].description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nova AI Showcase */}
      <NovaShowcase />

      {/* Enhanced Business Map Section */}
      <section className="relative z-10 px-4 sm:px-6 py-12 sm:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-16">
            <Badge className="mb-4 bg-blue-500/20 text-blue-300 border-blue-500/30">
              <Target className="w-4 h-4 mr-2" />
              Enhanced Project Management
            </Badge>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
              Drag & Drop
              <span className="block bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                Business Mapping
              </span>
            </h2>
            <p className="text-base sm:text-xl text-gray-300 max-w-3xl mx-auto px-4">
              Visualize your entire business ecosystem with our enhanced drag-and-drop ProjectMap. 
              Connect projects, tasks, milestones, resources, and teams in real-time.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Target className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2 text-white">Smart Node Types</h3>
                  <p className="text-gray-300">Projects, Tasks, Milestones, Resources, and Teams with intelligent connections and status synchronization.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2 text-white">Real-time Updates</h3>
                  <p className="text-gray-300">Automatic status synchronization between connected elements. Complete a task, milestone updates automatically.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2 text-white">Business Analytics</h3>
                  <p className="text-gray-300">Live ecosystem overview with progress tracking, completion ratios, and milestone achievements.</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl p-6 border border-blue-500/20">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-chatgpt-card rounded-lg p-4 border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-blue-400" />
                      <span className="text-sm font-medium text-foreground">Project</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Website Redesign</div>
                    <div className="w-full bg-border rounded-full h-1 mt-2">
                      <div className="bg-blue-500 h-1 rounded-full w-3/4"></div>
                    </div>
                  </div>
                  
                  <div className="bg-chatgpt-card rounded-lg p-4 border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckSquare className="w-4 h-4 text-green-400" />
                      <span className="text-sm font-medium text-foreground">Task</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Design Mockups</div>
                    <Badge variant="secondary" className="text-xs mt-1">Completed</Badge>
                  </div>
                  
                  <div className="bg-chatgpt-card rounded-lg p-4 border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm font-medium text-foreground">Milestone</span>
                    </div>
                    <div className="text-xs text-muted-foreground">MVP Launch</div>
                    <Badge variant="secondary" className="text-xs mt-1">75%</Badge>
                  </div>
                  
                  <div className="bg-chatgpt-card rounded-lg p-4 border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Users2 className="w-4 h-4 text-purple-400" />
                      <span className="text-sm font-medium text-foreground">Team</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Design Team</div>
                    <Badge variant="secondary" className="text-xs mt-1">5 members</Badge>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-primary">Business Ecosystem</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div>Projects: 3</div>
                    <div>Tasks: 12</div>
                    <div>Milestones: 5</div>
                    <div>Teams: 2</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Business Suite Section */}
      <section className="relative z-10 px-4 sm:px-6 py-12 sm:py-20 bg-gradient-to-r from-purple-500/5 to-blue-500/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-16">
            <Badge className="mb-4 bg-purple-500/20 text-purple-300 border-purple-500/30">
              <Crown className="w-4 h-4 mr-2" />
              Enterprise AI Platform
            </Badge>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
              Nexus AI Business Suite
              <span className="block bg-gradient-to-r from-purple-400 to-blue-600 bg-clip-text text-transparent">
                Meet Your AI Team
              </span>
            </h2>
            <p className="text-base sm:text-xl text-gray-300 max-w-3xl mx-auto px-4">
              Deploy intelligent AI agents that work 24/7 to grow your business. 
              Each agent specializes in specific business functions and learns from your data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Aurora */}
            <Card className="bg-gradient-to-br from-purple-50/50 to-purple-100/30 dark:from-purple-900/20 dark:to-purple-800/10 border-purple-500/20 hover:border-purple-400/40 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center shadow-lg">
                  <div className="w-12 h-12 bg-white rounded-full relative flex items-center justify-center">
                    <div className="absolute top-2 left-2 w-1.5 h-1.5 bg-black rounded-full"></div>
                    <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-black rounded-full"></div>
                    <div className="absolute top-4 w-3 h-0.5 bg-black rounded-full"></div>
                    <div className="absolute -top-1 w-5 h-3 bg-purple-500 rounded-full flex items-center justify-center">
                      <div className="w-1 h-1 bg-purple-600 rounded-full"></div>
                    </div>
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-2 text-purple-600 dark:text-purple-400">Aurora</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">AI Executive Assistant</p>
                <div className="grid grid-cols-2 gap-1">
                  <Badge variant="secondary" className="text-xs">Schedule</Badge>
                  <Badge variant="secondary" className="text-xs">Prioritize</Badge>
                  <Badge variant="secondary" className="text-xs">Reply</Badge>
                  <Badge variant="secondary" className="text-xs">Notes</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Vega */}
            <Card className="bg-gradient-to-br from-blue-50/50 to-blue-100/30 dark:from-blue-900/20 dark:to-blue-800/10 border-blue-500/20 hover:border-blue-400/40 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center shadow-lg">
                  <div className="w-12 h-12 bg-white rounded-full relative flex items-center justify-center">
                    <div className="absolute top-2 left-2 w-1.5 h-1.5 bg-black rounded-full"></div>
                    <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-black rounded-full"></div>
                    <div className="absolute top-4 w-3 h-0.5 bg-black rounded-full"></div>
                    <div className="absolute top-1 w-8 h-6 bg-blue-100 rounded-lg"></div>
                    <div className="absolute top-3 w-1.5 h-4 bg-orange-400 rounded-full"></div>
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-2 text-blue-600 dark:text-blue-400">Vega</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">AI Sales Representative</p>
                <div className="grid grid-cols-2 gap-1">
                  <Badge variant="secondary" className="text-xs">CRM</Badge>
                  <Badge variant="secondary" className="text-xs">Leads</Badge>
                  <Badge variant="secondary" className="text-xs">Outreach</Badge>
                  <Badge variant="secondary" className="text-xs">Pipeline</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Luma */}
            <Card className="bg-gradient-to-br from-green-50/50 to-green-100/30 dark:from-green-900/20 dark:to-green-800/10 border-green-500/20 hover:border-green-400/40 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center shadow-lg">
                  <div className="w-12 h-12 bg-white rounded-full relative flex items-center justify-center">
                    <div className="absolute top-2 left-2 w-1.5 h-1.5 bg-black rounded-full"></div>
                    <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-black rounded-full"></div>
                    <div className="absolute top-4 w-3 h-0.5 bg-black rounded-full"></div>
                    <div className="absolute -top-1 w-16 h-4 bg-black rounded-full flex items-center justify-center">
                      <div className="w-3 h-1.5 bg-gray-600 rounded-full"></div>
                    </div>
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-2 text-green-600 dark:text-green-400">Luma</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">AI Customer Support</p>
                <div className="grid grid-cols-2 gap-1">
                  <Badge variant="secondary" className="text-xs">Tickets</Badge>
                  <Badge variant="secondary" className="text-xs">Escalate</Badge>
                  <Badge variant="secondary" className="text-xs">Actions</Badge>
                  <Badge variant="secondary" className="text-xs">Solutions</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Orion */}
            <Card className="bg-gradient-to-br from-orange-50/50 to-orange-100/30 dark:from-orange-900/20 dark:to-orange-800/10 border-orange-500/20 hover:border-orange-400/40 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center shadow-lg">
                  <div className="w-12 h-12 bg-white rounded-full relative flex items-center justify-center">
                    <div className="absolute top-2 left-2 w-1.5 h-1.5 bg-black rounded-full"></div>
                    <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-black rounded-full"></div>
                    <div className="absolute top-4 w-3 h-0.5 bg-black rounded-full"></div>
                    <div className="absolute -top-1 w-12 h-3 bg-yellow-300 rounded-full"></div>
                    <div className="absolute bottom-1 w-10 h-3 bg-orange-100 rounded-lg"></div>
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-2 text-orange-600 dark:text-orange-400">Orion</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">AI Marketing Strategist</p>
                <div className="grid grid-cols-2 gap-1">
                  <Badge variant="secondary" className="text-xs">Content</Badge>
                  <Badge variant="secondary" className="text-xs">SEO</Badge>
                  <Badge variant="secondary" className="text-xs">Social</Badge>
                  <Badge variant="secondary" className="text-xs">Brand</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Workflow Builder Section */}
      <section className="relative z-10 px-4 sm:px-6 py-12 sm:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-16">
            <Badge className="mb-4 bg-green-500/20 text-green-300 border-green-500/30">
              <Workflow className="w-4 h-4 mr-2" />
              Visual Automation
            </Badge>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
              Drag & Drop
              <span className="block bg-gradient-to-r from-green-400 to-blue-600 bg-clip-text text-transparent">
                Workflow Builder
              </span>
            </h2>
            <p className="text-base sm:text-xl text-gray-300 max-w-3xl mx-auto px-4">
              Create complex business automations with our visual workflow builder. 
              Connect AI agents, APIs, conditions, and functions in a powerful drag-and-drop interface.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="relative">
              <div className="bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-2xl p-6 border border-green-500/20">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-chatgpt-card rounded-lg p-4 border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Webhook className="w-4 h-4 text-orange-400" />
                      <span className="text-sm font-medium text-foreground">Trigger</span>
                    </div>
                    <div className="text-xs text-muted-foreground">New Lead</div>
                  </div>
                  
                  <div className="bg-chatgpt-card rounded-lg p-4 border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Bot className="w-4 h-4 text-blue-400" />
                      <span className="text-sm font-medium text-foreground">Agent</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Vega Sales</div>
                  </div>
                  
                  <div className="bg-chatgpt-card rounded-lg p-4 border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <GitBranch className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm font-medium text-foreground">Condition</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Lead Score &gt; 80</div>
                  </div>
                  
                  <div className="bg-chatgpt-card rounded-lg p-4 border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-green-400" />
                      <span className="text-sm font-medium text-foreground">API Call</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Send Email</div>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center justify-center">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Workflow: Lead Qualification</span>
                    <Badge variant="secondary" className="text-xs">Active</Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2 text-white">AI Agent Integration</h3>
                  <p className="text-gray-300">Connect your AI agents (Aurora, Vega, Luma, Orion) directly into workflows for intelligent automation.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Code className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2 text-white">Custom Functions</h3>
                  <p className="text-gray-300">Write custom JavaScript/Python code within workflows for complex business logic and calculations.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <GitBranch className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2 text-white">Conditional Logic</h3>
                  <p className="text-gray-300">Build complex if/else conditions, loops, and branching logic for sophisticated automation flows.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Business Intelligence Section */}
      <section className="relative z-10 px-4 sm:px-6 py-12 sm:py-20 bg-gradient-to-r from-blue-500/5 to-purple-500/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-16">
            <Badge className="mb-4 bg-blue-500/20 text-blue-300 border-blue-500/30">
              <BarChart3 className="w-4 h-4 mr-2" />
              Advanced Analytics
            </Badge>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
              Business Intelligence
              <span className="block bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                & Analytics
              </span>
            </h2>
            <p className="text-base sm:text-xl text-gray-300 max-w-3xl mx-auto px-4">
              Get deep insights into your business performance with comprehensive analytics, 
              revenue tracking, team metrics, and AI-powered recommendations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gray-900/50 backdrop-blur-md border-gray-700/50 hover:bg-gray-800/50 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-white">Revenue Analytics</h3>
                <p className="text-sm text-gray-300 mb-4">Track revenue growth, monthly trends, and industry benchmarks</p>
                <div className="text-2xl font-bold text-green-400">+24%</div>
                <div className="text-xs text-gray-400">vs last month</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 backdrop-blur-md border-gray-700/50 hover:bg-gray-800/50 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Users2 className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-white">Team Analytics</h3>
                <p className="text-sm text-gray-300 mb-4">Monitor team productivity, employee metrics, and resource allocation</p>
                <div className="text-2xl font-bold text-blue-400">$45K</div>
                <div className="text-xs text-gray-400">revenue per employee</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 backdrop-blur-md border-gray-700/50 hover:bg-gray-800/50 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Gauge className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-white">Performance Tracking</h3>
                <p className="text-sm text-gray-300 mb-4">Task completion rates, customer satisfaction, and market share</p>
                <div className="text-2xl font-bold text-purple-400">94%</div>
                <div className="text-xs text-gray-400">success rate</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 backdrop-blur-md border-gray-700/50 hover:bg-gray-800/50 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <Lightbulb className="w-6 h-6 text-orange-400" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-white">AI Insights</h3>
                <p className="text-sm text-gray-300 mb-4">Smart recommendations, risk assessment, and growth opportunities</p>
                <div className="text-2xl font-bold text-orange-400">12</div>
                <div className="text-xs text-gray-400">recommendations</div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-4 p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl border border-blue-500/20">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-blue-300">Live Dashboard</span>
              </div>
              <div className="text-sm text-gray-300">
                Real-time business metrics • Automated reporting • Smart alerts
              </div>
              <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                <ArrowRight className="w-4 h-4 mr-2" />
                View Dashboard
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-4 sm:px-6 py-12 sm:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
              Everything Connected in
              <span className="block bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                Nexus AI
              </span>
            </h2>
            <p className="text-base sm:text-xl text-gray-300 max-w-3xl mx-auto px-4">
              From ProjectMaps to time tracking, task management to Nova AI - all your tools work together seamlessly.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index}
                className="bg-gray-900/50 backdrop-blur-md border-gray-700/50 hover:bg-gray-800/50 transition-all duration-300 hover:scale-105 hover:border-blue-500/30"
              >
                <CardContent className="p-4 sm:p-6 text-center">
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-gradient-to-r ${feature.color} flex items-center justify-center shadow-lg`}>
                    <feature.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-white">{feature.title}</h3>
                  <p className="text-sm sm:text-base text-gray-300">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="relative z-10 px-4 sm:px-6 py-12 sm:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-1 sm:mb-2">
                  {stat.number}
                </div>
                <div className="text-xs sm:text-sm text-gray-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="relative z-10 px-4 sm:px-6 py-12 sm:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
              Loved by Teams
              <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Worldwide
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {testimonials.map((testimonial, index) => (
              <Card 
                key={index}
                className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center mb-3 sm:mb-4">
                    <div className="text-2xl sm:text-4xl mr-3 sm:mr-4">{testimonial.avatar}</div>
                    <div>
                      <h4 className="font-bold text-sm sm:text-base">{testimonial.name}</h4>
                      <p className="text-gray-400 text-xs sm:text-sm">{testimonial.role}, {testimonial.company}</p>
                    </div>
                  </div>
                  <p className="text-gray-300 italic text-sm sm:text-base">"{testimonial.content}"</p>
                  <div className="flex mt-3 sm:mt-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-4 sm:px-6 py-12 sm:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 backdrop-blur-md border-blue-500/30">
            <CardContent className="p-6 sm:p-12">
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
                Ready to Connect
                <span className="block bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                  Everything?
                </span>
              </h2>
              <p className="text-base sm:text-xl text-gray-300 mb-6 sm:mb-8 px-4">
                Join teams already using Nexus AI to connect, visualize, and scale their project ecosystems.
              </p>
              <Button 
                size="lg"
                onClick={() => window.location.href = '/workspace'}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 px-8 sm:px-12 py-3 sm:py-4 text-lg sm:text-xl w-full sm:w-auto"
              >
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                Start Mapping Now
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 ml-2 sm:ml-3" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-4 sm:px-6 py-8 sm:py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-3 sm:mb-4">
            <img 
              src="/nexus-logo.png"
              alt="Nexus AI Logo"
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain logo-img"
              loading="eager"
              decoding="sync"
              width={80}
              height={80}
            />
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              Nexus AI
            </span>
          </div>
          <p className="text-gray-400 mb-3 sm:mb-4 text-sm sm:text-base">
            Where Everything Connects
          </p>
          <div className="flex justify-center space-x-4 sm:space-x-6 text-gray-400 text-sm sm:text-base">
            <a href="#" className="hover:text-blue-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Terms</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
