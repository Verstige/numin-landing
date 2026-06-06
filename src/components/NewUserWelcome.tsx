import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Sparkles, 
  ArrowRight, 
  Play, 
  Map, 
  Target,
  Zap,
  Brain,
  Rocket,
  Globe,
  Layers
} from 'lucide-react';

interface NewUserWelcomeProps {
  onCreateProject: () => void;
  onViewDemo: () => void;
  isNewUser?: boolean;
  userName?: string;
}

// Mini Business Mapping Animation Component
const MiniProjectMapAnimation = ({ isAnimating }: { isAnimating: boolean }) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  useEffect(() => {
    if (!isAnimating) return;
    
    const steps = [0, 1, 2, 3, 4];
    let stepIndex = 0;
    
    const interval = setInterval(() => {
      setCurrentStep(steps[stepIndex]);
      stepIndex = (stepIndex + 1) % steps.length;
    }, 800);
    
    return () => clearInterval(interval);
  }, [isAnimating]);
  
  const nodes = [
    { id: 1, x: 50, y: 50, label: "Brand", color: "bg-blue-500", delay: 0 },
    { id: 2, x: 200, y: 80, label: "Marketing", color: "bg-purple-500", delay: 1 },
    { id: 3, x: 350, y: 120, label: "Sales", color: "bg-green-500", delay: 2 },
    { id: 4, x: 150, y: 200, label: "Support", color: "bg-orange-500", delay: 3 },
    { id: 5, x: 300, y: 250, label: "Analytics", color: "bg-pink-500", delay: 4 }
  ];
  
  const connections = [
    { from: 1, to: 2, delay: 1 },
    { from: 2, to: 3, delay: 2 },
    { from: 1, to: 4, delay: 3 },
    { from: 3, to: 5, delay: 4 },
    { from: 4, to: 5, delay: 4 }
  ];
  
  return (
    <div className="relative w-full h-64 bg-gradient-to-br from-background to-muted/20 rounded-xl border border-border/50 overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full" style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }} />
      </div>
      
      {/* Connection lines */}
      {connections.map((connection, index) => {
        const fromNode = nodes.find(n => n.id === connection.from);
        const toNode = nodes.find(n => n.id === connection.to);
        if (!fromNode || !toNode) return null;
        
        const isVisible = currentStep >= connection.delay;
        
        return (
          <div
            key={index}
            className={`absolute transition-all duration-500 ${
              isVisible ? 'opacity-60' : 'opacity-0'
            }`}
            style={{
              left: `${fromNode.x}px`,
              top: `${fromNode.y + 12}px`,
              width: `${Math.sqrt(Math.pow(toNode.x - fromNode.x, 2) + Math.pow(toNode.y - fromNode.y, 2))}px`,
              height: '2px',
              background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
              transformOrigin: 'left center',
              transform: `rotate(${Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x) * 180 / Math.PI}deg)`
            }}
          />
        );
      })}
      
      {/* Project nodes */}
      {nodes.map((node) => {
        const isVisible = currentStep >= node.delay;
        const scale = isVisible ? 1 : 0;
        const opacity = isVisible ? 1 : 0;
        
        return (
          <div
            key={node.id}
            className="absolute transition-all duration-500 transform"
            style={{
              left: `${node.x}px`,
              top: `${node.y}px`,
              transform: `scale(${scale})`,
              opacity
            }}
          >
            <div className={`w-6 h-6 ${node.color} rounded-full flex items-center justify-center shadow-lg animate-pulse`}>
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-xs font-medium text-foreground whitespace-nowrap">
              {node.label}
            </div>
          </div>
        );
      })}
      
      {/* Floating particles */}
      {isAnimating && (
        <>
          <div className="absolute top-10 left-20 w-1 h-1 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
          <div className="absolute top-32 right-16 w-1 h-1 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-20 left-32 w-1 h-1 bg-green-400 rounded-full animate-ping" style={{ animationDelay: '3s' }} />
        </>
      )}
    </div>
  );
};

export default function NewUserWelcome({ 
  onCreateProject, 
  onViewDemo, 
  isNewUser = true, 
  userName = "User" 
}: NewUserWelcomeProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  
  const handleLaunchWorkspace = () => {
    setIsAnimating(true);
    setShowAnimation(true);
    
    // Start the animation sequence
    setTimeout(() => {
      // After animation completes, navigate to workspace
      onCreateProject();
    }, 3000);
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-4xl w-full space-y-8">
        {/* Main Welcome Section */}
        <div className="text-center space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                {isNewUser ? 'Welcome to Nexus' : `Welcome back, ${userName}!`}
              </h1>
            </div>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {isNewUser 
                ? "Your AI-powered business ecosystem is ready to launch. Create, manage, and scale your projects with intelligent automation."
                : "Ready to continue building your business ecosystem? Launch your workspace and explore new possibilities with AI-powered automation."
              }
            </p>
          </div>
        </div>
        
        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold">AI-Powered Insights</h3>
              <p className="text-sm text-muted-foreground">
                Get intelligent recommendations and automated project management
              </p>
            </CardContent>
          </Card>
          
          <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold">Business Mapping</h3>
              <p className="text-sm text-muted-foreground">
                Visualize your business ecosystem with interactive project maps
              </p>
            </CardContent>
          </Card>
          
          <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold">Real-time Collaboration</h3>
              <p className="text-sm text-muted-foreground">
                Work seamlessly with your team and AI agents in real-time
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Mini Business Map Preview */}
        {showAnimation && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2 flex items-center justify-center gap-2">
                <Map className="w-5 h-5 text-primary" />
                Your Project Ecosystem
              </h3>
              <p className="text-sm text-muted-foreground">
                Watch your business ecosystem come to life
              </p>
            </div>
            <MiniProjectMapAnimation isAnimating={isAnimating} />
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            onClick={handleLaunchWorkspace}
            size="lg"
            className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg group min-w-[200px]"
          >
            <Rocket className="w-5 h-5 mr-2 group-hover:animate-bounce" />
            {isNewUser ? 'Launch Workspace' : 'Continue Building'}
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <Button
            onClick={onViewDemo}
            variant="outline"
            size="lg"
            className="min-w-[200px]"
          >
            <Play className="w-5 h-5 mr-2" />
            View Demo
          </Button>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="space-y-2">
            <div className="text-2xl font-bold text-primary">24/7</div>
            <div className="text-sm text-muted-foreground">AI Monitoring</div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-primary">∞</div>
            <div className="text-sm text-muted-foreground">Projects</div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-primary">5</div>
            <div className="text-sm text-muted-foreground">AI Agents</div>
          </div>
          <div className="space-y-2">
            <div className="text-2xl font-bold text-primary">100%</div>
            <div className="text-sm text-muted-foreground">Automated</div>
          </div>
        </div>
      </div>
    </div>
  );
}
