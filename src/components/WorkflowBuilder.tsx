import React, { useState, useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  BackgroundVariant,
  NodeTypes,
  EdgeTypes,
  ReactFlowProvider,
  ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Save, 
  Download, 
  Upload, 
  Plus, 
  Settings,
  Bot,
  Zap,
  GitBranch,
  Code,
  MousePointer,
  Clock,
  Merge,
  Split,
  Webhook,
  CheckCircle,
  AlertCircle,
  Info,
  Minus,
  Maximize,
  FileText,
  Briefcase,
  Mail,
  Calendar,
  ShoppingCart,
  BarChart3,
  Users,
  DollarSign,
  TrendingUp,
  MessageSquare,
  Shield,
  Target,
  Star,
  Search,
  Database,
  Globe
} from 'lucide-react';

import { 
  Workflow, 
  WorkflowNode, 
  WorkflowEdge, 
  WorkflowNodeType,
  WorkflowExecution 
} from '@/types/nexus';

// Custom Node Components
const AgentActionNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <div className={`px-4 py-2 shadow-md rounded-md bg-chatgpt-card border-2 min-w-[200px] ${
    selected ? 'border-blue-500' : 'border-border'
  }`}>
    <div className="flex items-center gap-2">
      <Bot className="w-4 h-4 text-blue-500" />
      <div className="font-bold text-sm text-foreground">Agent Action</div>
    </div>
    <div className="text-xs text-muted-foreground mt-1">{data.label}</div>
  </div>
);

const APICallNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <div className={`px-4 py-2 shadow-md rounded-md bg-chatgpt-card border-2 min-w-[200px] ${
    selected ? 'border-green-500' : 'border-border'
  }`}>
    <div className="flex items-center gap-2">
      <Zap className="w-4 h-4 text-green-500" />
      <div className="font-bold text-sm text-foreground">API Call</div>
    </div>
    <div className="text-xs text-muted-foreground mt-1">{data.label}</div>
  </div>
);

const ConditionNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <div className={`px-4 py-2 shadow-md rounded-md bg-chatgpt-card border-2 min-w-[200px] ${
    selected ? 'border-yellow-500' : 'border-border'
  }`}>
    <div className="flex items-center gap-2">
      <GitBranch className="w-4 h-4 text-yellow-500" />
      <div className="font-bold text-sm text-foreground">Condition</div>
    </div>
    <div className="text-xs text-muted-foreground mt-1">{data.label}</div>
  </div>
);

const FunctionNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <div className={`px-4 py-2 shadow-md rounded-md bg-chatgpt-card border-2 min-w-[200px] ${
    selected ? 'border-purple-500' : 'border-border'
  }`}>
    <div className="flex items-center gap-2">
      <Code className="w-4 h-4 text-purple-500" />
      <div className="font-bold text-sm text-foreground">Function</div>
    </div>
    <div className="text-xs text-muted-foreground mt-1">{data.label}</div>
  </div>
);

const TriggerNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <div className={`px-4 py-2 shadow-md rounded-md bg-chatgpt-card border-2 min-w-[200px] ${
    selected ? 'border-orange-500' : 'border-border'
  }`}>
    <div className="flex items-center gap-2">
      <Webhook className="w-4 h-4 text-orange-500" />
      <div className="font-bold text-sm text-foreground">Trigger</div>
    </div>
    <div className="text-xs text-muted-foreground mt-1">{data.label}</div>
  </div>
);

const EndNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <div className={`px-4 py-2 shadow-md rounded-md bg-chatgpt-card border-2 min-w-[200px] ${
    selected ? 'border-red-500' : 'border-border'
  }`}>
    <div className="flex items-center gap-2">
      <CheckCircle className="w-4 h-4 text-red-500" />
      <div className="font-bold text-sm text-foreground">End</div>
    </div>
    <div className="text-xs text-muted-foreground mt-1">{data.label}</div>
  </div>
);

const DelayNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <div className={`px-4 py-2 shadow-md rounded-md bg-chatgpt-card border-2 min-w-[200px] ${
    selected ? 'border-indigo-500' : 'border-border'
  }`}>
    <div className="flex items-center gap-2">
      <Clock className="w-4 h-4 text-indigo-500" />
      <div className="font-bold text-sm text-foreground">Delay</div>
    </div>
    <div className="text-xs text-muted-foreground mt-1">{data.label}</div>
  </div>
);

const MergeNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <div className={`px-4 py-2 shadow-md rounded-md bg-chatgpt-card border-2 min-w-[200px] ${
    selected ? 'border-teal-500' : 'border-border'
  }`}>
    <div className="flex items-center gap-2">
      <Merge className="w-4 h-4 text-teal-500" />
      <div className="font-bold text-sm text-foreground">Merge</div>
    </div>
    <div className="text-xs text-muted-foreground mt-1">{data.label}</div>
  </div>
);

const SplitNode = ({ data, selected }: { data: any; selected: boolean }) => (
  <div className={`px-4 py-2 shadow-md rounded-md bg-chatgpt-card border-2 min-w-[200px] ${
    selected ? 'border-pink-500' : 'border-border'
  }`}>
    <div className="flex items-center gap-2">
      <Split className="w-4 h-4 text-pink-500" />
      <div className="font-bold text-sm text-foreground">Split</div>
    </div>
    <div className="text-xs text-muted-foreground mt-1">{data.label}</div>
  </div>
);

const nodeTypes: NodeTypes = {
  'agent-action': AgentActionNode,
  'api-call': APICallNode,
  'condition': ConditionNode,
  'function': FunctionNode,
  'trigger': TriggerNode,
  'end': EndNode,
  'delay': DelayNode,
  'merge': MergeNode,
  'split': SplitNode,
};

const NODE_TEMPLATES = [
  {
    type: 'trigger' as WorkflowNodeType,
    label: 'Webhook Trigger',
    description: 'Starts workflow on webhook call',
    icon: <Webhook className="w-4 h-4" />,
    color: 'orange'
  },
  {
    type: 'agent-action' as WorkflowNodeType,
    label: 'Agent Action',
    description: 'Execute agent task',
    icon: <Bot className="w-4 h-4" />,
    color: 'blue'
  },
  {
    type: 'api-call' as WorkflowNodeType,
    label: 'API Call',
    description: 'Call external API',
    icon: <Zap className="w-4 h-4" />,
    color: 'green'
  },
  {
    type: 'condition' as WorkflowNodeType,
    label: 'Condition',
    description: 'If/else logic',
    icon: <GitBranch className="w-4 h-4" />,
    color: 'yellow'
  },
  {
    type: 'function' as WorkflowNodeType,
    label: 'Function',
    description: 'Custom JavaScript code',
    icon: <Code className="w-4 h-4" />,
    color: 'purple'
  },
  {
    type: 'delay' as WorkflowNodeType,
    label: 'Delay',
    description: 'Wait for specified time',
    icon: <Clock className="w-4 h-4" />,
    color: 'indigo'
  },
  {
    type: 'merge' as WorkflowNodeType,
    label: 'Merge',
    description: 'Combine multiple inputs',
    icon: <Merge className="w-4 h-4" />,
    color: 'teal'
  },
  {
    type: 'split' as WorkflowNodeType,
    label: 'Split',
    description: 'Split into multiple paths',
    icon: <Split className="w-4 h-4" />,
    color: 'pink'
  },
  {
    type: 'end' as WorkflowNodeType,
    label: 'End',
    description: 'End workflow',
    icon: <CheckCircle className="w-4 h-4" />,
    color: 'red'
  }
];

// Pre-built Workflow Templates for Business Operations
const WORKFLOW_TEMPLATES = [
  {
    id: 'lead-qualification',
    name: 'Lead Qualification',
    description: 'Automatically qualify and score incoming leads',
    category: 'Sales',
    icon: <Target className="w-5 h-5" />,
    color: 'blue',
    difficulty: 'Beginner',
    estimatedTime: '5 min',
    nodes: [
      { id: 'trigger-1', type: 'trigger', position: { x: 100, y: 100 }, data: { label: 'New Lead Received' } },
      { id: 'agent-1', type: 'agent-action', position: { x: 300, y: 100 }, data: { label: 'Vega: Analyze Lead Data' } },
      { id: 'condition-1', type: 'condition', position: { x: 500, y: 100 }, data: { label: 'Lead Score > 70?' } },
      { id: 'agent-2', type: 'agent-action', position: { x: 700, y: 50 }, data: { label: 'Vega: Schedule Meeting' } },
      { id: 'agent-3', type: 'agent-action', position: { x: 700, y: 150 }, data: { label: 'Vega: Send Follow-up' } },
      { id: 'api-1', type: 'api-call', position: { x: 900, y: 50 }, data: { label: 'Update CRM' } },
      { id: 'api-2', type: 'api-call', position: { x: 900, y: 150 }, data: { label: 'Send Email' } },
      { id: 'end-1', type: 'end', position: { x: 1100, y: 100 }, data: { label: 'Process Complete' } }
    ],
    edges: [
      { id: 'e1', source: 'trigger-1', target: 'agent-1' },
      { id: 'e2', source: 'agent-1', target: 'condition-1' },
      { id: 'e3', source: 'condition-1', target: 'agent-2', label: 'Yes' },
      { id: 'e4', source: 'condition-1', target: 'agent-3', label: 'No' },
      { id: 'e5', source: 'agent-2', target: 'api-1' },
      { id: 'e6', source: 'agent-3', target: 'api-2' },
      { id: 'e7', source: 'api-1', target: 'end-1' },
      { id: 'e8', source: 'api-2', target: 'end-1' }
    ]
  },
  {
    id: 'customer-support',
    name: 'Customer Support Triage',
    description: 'Route and prioritize customer support tickets',
    category: 'Support',
    icon: <MessageSquare className="w-5 h-5" />,
    color: 'green',
    difficulty: 'Beginner',
    estimatedTime: '3 min',
    nodes: [
      { id: 'trigger-1', type: 'trigger', position: { x: 100, y: 100 }, data: { label: 'Support Ticket Created' } },
      { id: 'agent-1', type: 'agent-action', position: { x: 300, y: 100 }, data: { label: 'Luma: Analyze Ticket' } },
      { id: 'condition-1', type: 'condition', position: { x: 500, y: 100 }, data: { label: 'Priority Level?' } },
      { id: 'agent-2', type: 'agent-action', position: { x: 700, y: 50 }, data: { label: 'Luma: Auto-Response' } },
      { id: 'agent-3', type: 'agent-action', position: { x: 700, y: 100 }, data: { label: 'Luma: Escalate to Human' } },
      { id: 'agent-4', type: 'agent-action', position: { x: 700, y: 150 }, data: { label: 'Luma: Create Knowledge Base' } },
      { id: 'api-1', type: 'api-call', position: { x: 900, y: 50 }, data: { label: 'Send Response' } },
      { id: 'api-2', type: 'api-call', position: { x: 900, y: 100 }, data: { label: 'Notify Team' } },
      { id: 'api-3', type: 'api-call', position: { x: 900, y: 150 }, data: { label: 'Update Knowledge Base' } },
      { id: 'end-1', type: 'end', position: { x: 1100, y: 100 }, data: { label: 'Ticket Processed' } }
    ],
    edges: [
      { id: 'e1', source: 'trigger-1', target: 'agent-1' },
      { id: 'e2', source: 'agent-1', target: 'condition-1' },
      { id: 'e3', source: 'condition-1', target: 'agent-2', label: 'Low' },
      { id: 'e4', source: 'condition-1', target: 'agent-3', label: 'High' },
      { id: 'e5', source: 'condition-1', target: 'agent-4', label: 'Medium' },
      { id: 'e6', source: 'agent-2', target: 'api-1' },
      { id: 'e7', source: 'agent-3', target: 'api-2' },
      { id: 'e8', source: 'agent-4', target: 'api-3' },
      { id: 'e9', source: 'api-1', target: 'end-1' },
      { id: 'e10', source: 'api-2', target: 'end-1' },
      { id: 'e11', source: 'api-3', target: 'end-1' }
    ]
  },
  {
    id: 'marketing-campaign',
    name: 'Marketing Campaign Launch',
    description: 'Automate multi-channel marketing campaign execution',
    category: 'Marketing',
    icon: <TrendingUp className="w-5 h-5" />,
    color: 'purple',
    difficulty: 'Intermediate',
    estimatedTime: '8 min',
    nodes: [
      { id: 'trigger-1', type: 'trigger', position: { x: 100, y: 100 }, data: { label: 'Campaign Trigger' } },
      { id: 'agent-1', type: 'agent-action', position: { x: 300, y: 100 }, data: { label: 'Orion: Create Campaign Content' } },
      { id: 'split-1', type: 'split', position: { x: 500, y: 100 }, data: { label: 'Split Channels' } },
      { id: 'api-1', type: 'api-call', position: { x: 700, y: 50 }, data: { label: 'Email Marketing' } },
      { id: 'api-2', type: 'api-call', position: { x: 700, y: 100 }, data: { label: 'Social Media' } },
      { id: 'api-3', type: 'api-call', position: { x: 700, y: 150 }, data: { label: 'Google Ads' } },
      { id: 'delay-1', type: 'delay', position: { x: 900, y: 50 }, data: { label: 'Wait 1 Hour' } },
      { id: 'agent-2', type: 'agent-action', position: { x: 1100, y: 100 }, data: { label: 'Orion: Analyze Performance' } },
      { id: 'condition-1', type: 'condition', position: { x: 1300, y: 100 }, data: { label: 'Performance > Target?' } },
      { id: 'agent-3', type: 'agent-action', position: { x: 1500, y: 50 }, data: { label: 'Orion: Optimize Campaign' } },
      { id: 'end-1', type: 'end', position: { x: 1700, y: 100 }, data: { label: 'Campaign Complete' } }
    ],
    edges: [
      { id: 'e1', source: 'trigger-1', target: 'agent-1' },
      { id: 'e2', source: 'agent-1', target: 'split-1' },
      { id: 'e3', source: 'split-1', target: 'api-1' },
      { id: 'e4', source: 'split-1', target: 'api-2' },
      { id: 'e5', source: 'split-1', target: 'api-3' },
      { id: 'e6', source: 'api-1', target: 'delay-1' },
      { id: 'e7', source: 'delay-1', target: 'agent-2' },
      { id: 'e8', source: 'api-2', target: 'agent-2' },
      { id: 'e9', source: 'api-3', target: 'agent-2' },
      { id: 'e10', source: 'agent-2', target: 'condition-1' },
      { id: 'e11', source: 'condition-1', target: 'agent-3', label: 'No' },
      { id: 'e12', source: 'condition-1', target: 'end-1', label: 'Yes' },
      { id: 'e13', source: 'agent-3', target: 'end-1' }
    ]
  },
  {
    id: 'order-processing',
    name: 'E-commerce Order Processing',
    description: 'Complete order fulfillment and customer communication',
    category: 'Operations',
    icon: <ShoppingCart className="w-5 h-5" />,
    color: 'orange',
    difficulty: 'Intermediate',
    estimatedTime: '6 min',
    nodes: [
      { id: 'trigger-1', type: 'trigger', position: { x: 100, y: 100 }, data: { label: 'New Order Received' } },
      { id: 'condition-1', type: 'condition', position: { x: 300, y: 100 }, data: { label: 'Payment Valid?' } },
      { id: 'agent-1', type: 'agent-action', position: { x: 500, y: 50 }, data: { label: 'Titan: Process Payment' } },
      { id: 'api-1', type: 'api-call', position: { x: 700, y: 50 }, data: { label: 'Check Inventory' } },
      { id: 'condition-2', type: 'condition', position: { x: 900, y: 50 }, data: { label: 'In Stock?' } },
      { id: 'agent-2', type: 'agent-action', position: { x: 1100, y: 50 }, data: { label: 'Titan: Fulfill Order' } },
      { id: 'api-2', type: 'api-call', position: { x: 1300, y: 50 }, data: { label: 'Send to Warehouse' } },
      { id: 'agent-3', type: 'agent-action', position: { x: 1500, y: 50 }, data: { label: 'Aurora: Send Confirmation' } },
      { id: 'api-3', type: 'api-call', position: { x: 1700, y: 50 }, data: { label: 'Send Email & SMS' } },
      { id: 'agent-4', type: 'agent-action', position: { x: 500, y: 150 }, data: { label: 'Aurora: Payment Failed' } },
      { id: 'api-4', type: 'api-call', position: { x: 700, y: 150 }, data: { label: 'Send Payment Link' } },
      { id: 'end-1', type: 'end', position: { x: 1900, y: 50 }, data: { label: 'Order Complete' } },
      { id: 'end-2', type: 'end', position: { x: 900, y: 150 }, data: { label: 'Payment Required' } }
    ],
    edges: [
      { id: 'e1', source: 'trigger-1', target: 'condition-1' },
      { id: 'e2', source: 'condition-1', target: 'agent-1', label: 'Yes' },
      { id: 'e3', source: 'condition-1', target: 'agent-4', label: 'No' },
      { id: 'e4', source: 'agent-1', target: 'api-1' },
      { id: 'e5', source: 'api-1', target: 'condition-2' },
      { id: 'e6', source: 'condition-2', target: 'agent-2', label: 'Yes' },
      { id: 'e7', source: 'agent-2', target: 'api-2' },
      { id: 'e8', source: 'api-2', target: 'agent-3' },
      { id: 'e9', source: 'agent-3', target: 'api-3' },
      { id: 'e10', source: 'api-3', target: 'end-1' },
      { id: 'e11', source: 'agent-4', target: 'api-4' },
      { id: 'e12', source: 'api-4', target: 'end-2' }
    ]
  },
  {
    id: 'employee-onboarding',
    name: 'Employee Onboarding',
    description: 'Automate new employee setup and orientation',
    category: 'HR',
    icon: <Users className="w-5 h-5" />,
    color: 'teal',
    difficulty: 'Advanced',
    estimatedTime: '12 min',
    nodes: [
      { id: 'trigger-1', type: 'trigger', position: { x: 100, y: 100 }, data: { label: 'New Employee Added' } },
      { id: 'agent-1', type: 'agent-action', position: { x: 300, y: 100 }, data: { label: 'Aurora: Create Onboarding Plan' } },
      { id: 'split-1', type: 'split', position: { x: 500, y: 100 }, data: { label: 'Parallel Tasks' } },
      { id: 'api-1', type: 'api-call', position: { x: 700, y: 50 }, data: { label: 'Setup IT Account' } },
      { id: 'api-2', type: 'api-call', position: { x: 700, y: 100 }, data: { label: 'Add to Payroll' } },
      { id: 'api-3', type: 'api-call', position: { x: 700, y: 150 }, data: { label: 'Schedule Training' } },
      { id: 'delay-1', type: 'delay', position: { x: 900, y: 50 }, data: { label: 'Wait 24 Hours' } },
      { id: 'agent-2', type: 'agent-action', position: { x: 1100, y: 100 }, data: { label: 'Aurora: Send Welcome Package' } },
      { id: 'api-4', type: 'api-call', position: { x: 1300, y: 100 }, data: { label: 'Send Equipment' } },
      { id: 'agent-3', type: 'agent-action', position: { x: 1500, y: 100 }, data: { label: 'Aurora: Schedule 1:1 Meeting' } },
      { id: 'api-5', type: 'api-call', position: { x: 1700, y: 100 }, data: { label: 'Create Calendar Event' } },
      { id: 'merge-1', type: 'merge', position: { x: 1900, y: 100 }, data: { label: 'Merge Tasks' } },
      { id: 'end-1', type: 'end', position: { x: 2100, y: 100 }, data: { label: 'Onboarding Complete' } }
    ],
    edges: [
      { id: 'e1', source: 'trigger-1', target: 'agent-1' },
      { id: 'e2', source: 'agent-1', target: 'split-1' },
      { id: 'e3', source: 'split-1', target: 'api-1' },
      { id: 'e4', source: 'split-1', target: 'api-2' },
      { id: 'e5', source: 'split-1', target: 'api-3' },
      { id: 'e6', source: 'api-1', target: 'delay-1' },
      { id: 'e7', source: 'delay-1', target: 'agent-2' },
      { id: 'e8', source: 'api-2', target: 'agent-2' },
      { id: 'e9', source: 'api-3', target: 'agent-2' },
      { id: 'e10', source: 'agent-2', target: 'api-4' },
      { id: 'e11', source: 'api-4', target: 'agent-3' },
      { id: 'e12', source: 'agent-3', target: 'api-5' },
      { id: 'e13', source: 'api-5', target: 'merge-1' },
      { id: 'e14', source: 'merge-1', target: 'end-1' }
    ]
  },
  {
    id: 'invoice-processing',
    name: 'Invoice Processing & Payment',
    description: 'Automate invoice validation and payment processing',
    category: 'Finance',
    icon: <DollarSign className="w-5 h-5" />,
    color: 'yellow',
    difficulty: 'Intermediate',
    estimatedTime: '7 min',
    nodes: [
      { id: 'trigger-1', type: 'trigger', position: { x: 100, y: 100 }, data: { label: 'Invoice Received' } },
      { id: 'agent-1', type: 'agent-action', position: { x: 300, y: 100 }, data: { label: 'Titan: Extract Invoice Data' } },
      { id: 'condition-1', type: 'condition', position: { x: 500, y: 100 }, data: { label: 'Amount < $10K?' } },
      { id: 'agent-2', type: 'agent-action', position: { x: 700, y: 50 }, data: { label: 'Titan: Auto-Approval' } },
      { id: 'agent-3', type: 'agent-action', position: { x: 700, y: 150 }, data: { label: 'Aurora: Manager Review' } },
      { id: 'condition-2', type: 'condition', position: { x: 900, y: 150 }, data: { label: 'Manager Approved?' } },
      { id: 'api-1', type: 'api-call', position: { x: 1100, y: 50 }, data: { label: 'Process Payment' } },
      { id: 'api-2', type: 'api-call', position: { x: 1100, y: 100 }, data: { label: 'Schedule Payment' } },
      { id: 'agent-4', type: 'agent-action', position: { x: 1100, y: 200 }, data: { label: 'Aurora: Request More Info' } },
      { id: 'api-3', type: 'api-call', position: { x: 1300, y: 100 }, data: { label: 'Update Accounting System' } },
      { id: 'agent-5', type: 'agent-action', position: { x: 1500, y: 100 }, data: { label: 'Aurora: Send Confirmation' } },
      { id: 'end-1', type: 'end', position: { x: 1700, y: 100 }, data: { label: 'Invoice Processed' } },
      { id: 'end-2', type: 'end', position: { x: 1300, y: 200 }, data: { label: 'Pending Information' } }
    ],
    edges: [
      { id: 'e1', source: 'trigger-1', target: 'agent-1' },
      { id: 'e2', source: 'agent-1', target: 'condition-1' },
      { id: 'e3', source: 'condition-1', target: 'agent-2', label: 'Yes' },
      { id: 'e4', source: 'condition-1', target: 'agent-3', label: 'No' },
      { id: 'e5', source: 'agent-2', target: 'api-1' },
      { id: 'e6', source: 'agent-3', target: 'condition-2' },
      { id: 'e7', source: 'condition-2', target: 'api-2', label: 'Yes' },
      { id: 'e8', source: 'condition-2', target: 'agent-4', label: 'No' },
      { id: 'e9', source: 'api-1', target: 'api-3' },
      { id: 'e10', source: 'api-2', target: 'api-3' },
      { id: 'e11', source: 'api-3', target: 'agent-5' },
      { id: 'e12', source: 'agent-5', target: 'end-1' },
      { id: 'e13', source: 'agent-4', target: 'end-2' }
    ]
  },
  {
    id: 'content-approval',
    name: 'Content Approval Workflow',
    description: 'Streamline content review and approval process',
    category: 'Marketing',
    icon: <FileText className="w-5 h-5" />,
    color: 'pink',
    difficulty: 'Beginner',
    estimatedTime: '4 min',
    nodes: [
      { id: 'trigger-1', type: 'trigger', position: { x: 100, y: 100 }, data: { label: 'Content Submitted' } },
      { id: 'agent-1', type: 'agent-action', position: { x: 300, y: 100 }, data: { label: 'Orion: Initial Review' } },
      { id: 'condition-1', type: 'condition', position: { x: 500, y: 100 }, data: { label: 'Quality Check Pass?' } },
      { id: 'agent-2', type: 'agent-action', position: { x: 700, y: 50 }, data: { label: 'Orion: Request Revisions' } },
      { id: 'agent-3', type: 'agent-action', position: { x: 700, y: 150 }, data: { label: 'Aurora: Send for Approval' } },
      { id: 'api-1', type: 'api-call', position: { x: 900, y: 50 }, data: { label: 'Notify Creator' } },
      { id: 'api-2', type: 'api-call', position: { x: 900, y: 150 }, data: { label: 'Notify Stakeholders' } },
      { id: 'delay-1', type: 'delay', position: { x: 1100, y: 150 }, data: { label: 'Wait for Approval' } },
      { id: 'condition-2', type: 'condition', position: { x: 1300, y: 150 }, data: { label: 'Approved?' } },
      { id: 'agent-4', type: 'agent-action', position: { x: 1500, y: 100 }, data: { label: 'Orion: Publish Content' } },
      { id: 'agent-5', type: 'agent-action', position: { x: 1500, y: 200 }, data: { label: 'Aurora: Request Changes' } },
      { id: 'api-3', type: 'api-call', position: { x: 1700, y: 100 }, data: { label: 'Deploy to Platform' } },
      { id: 'end-1', type: 'end', position: { x: 1900, y: 100 }, data: { label: 'Content Published' } },
      { id: 'end-2', type: 'end', position: { x: 1700, y: 200 }, data: { label: 'Revisions Required' } },
      { id: 'end-3', type: 'end', position: { x: 1100, y: 50 }, data: { label: 'Revision Requested' } }
    ],
    edges: [
      { id: 'e1', source: 'trigger-1', target: 'agent-1' },
      { id: 'e2', source: 'agent-1', target: 'condition-1' },
      { id: 'e3', source: 'condition-1', target: 'agent-2', label: 'No' },
      { id: 'e4', source: 'condition-1', target: 'agent-3', label: 'Yes' },
      { id: 'e5', source: 'agent-2', target: 'api-1' },
      { id: 'e6', source: 'agent-3', target: 'api-2' },
      { id: 'e7', source: 'api-1', target: 'end-3' },
      { id: 'e8', source: 'api-2', target: 'delay-1' },
      { id: 'e9', source: 'delay-1', target: 'condition-2' },
      { id: 'e10', source: 'condition-2', target: 'agent-4', label: 'Yes' },
      { id: 'e11', source: 'condition-2', target: 'agent-5', label: 'No' },
      { id: 'e12', source: 'agent-4', target: 'api-3' },
      { id: 'e13', source: 'api-3', target: 'end-1' },
      { id: 'e14', source: 'agent-5', target: 'end-2' }
    ]
  }
];

interface WorkflowBuilderProps {
  workflow?: Workflow;
  onSave?: (workflow: Workflow) => void;
  onExecute?: (workflowId: string) => void;
}

function WorkflowBuilderContent({ workflow, onSave, onExecute }: WorkflowBuilderProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(
    workflow?.nodes?.map(node => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: node.data,
    })) || []
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    workflow?.edges?.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: edge.type || 'default',
    })) || []
  );
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isNodeConfigOpen, setIsNodeConfigOpen] = useState(false);
  const [workflowName, setWorkflowName] = useState(workflow?.name || 'Untitled Workflow');
  const [workflowDescription, setWorkflowDescription] = useState(workflow?.description || '');
  const [activeTab, setActiveTab] = useState<'templates' | 'builder'>('templates');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addNode = useCallback(
    (nodeType: WorkflowNodeType) => {
      const newNode: Node = {
        id: `node_${Date.now()}`,
        type: nodeType,
        position: { x: Math.random() * 400, y: Math.random() * 400 },
        data: {
          label: NODE_TEMPLATES.find(t => t.type === nodeType)?.label || 'Node',
          ...NODE_TEMPLATES.find(t => t.type === nodeType)
        },
      };
      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setIsNodeConfigOpen(true);
  }, []);

  const saveWorkflow = useCallback(() => {
    if (!workflowName.trim()) {
      alert('Please enter a workflow name');
      return;
    }

    if (nodes.length === 0) {
      alert('Please add at least one node to the workflow');
      return;
    }

    const newWorkflow: Workflow = {
      id: workflow?.id || `workflow_${Date.now()}`,
      name: workflowName,
      description: workflowDescription,
      nodes: nodes.map(node => ({
        id: node.id,
        type: node.type as WorkflowNodeType,
        position: node.position,
        data: node.data,
        config: node.data.config || {}
      })),
      edges: edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: edge.type as any,
      })),
      triggers: [],
      status: 'draft',
      createdAt: workflow?.createdAt || new Date(),
      updatedAt: new Date(),
      createdBy: 'current-user', // TODO: Get from auth context
      executions: []
    };

    console.log('Saving workflow:', newWorkflow);
    onSave?.(newWorkflow);
    
    // Show success message
    alert('Workflow saved successfully!');
  }, [workflowName, workflowDescription, nodes, edges, workflow, onSave]);

  const executeWorkflow = useCallback(() => {
    if (nodes.length === 0) {
      alert('Please add at least one node to the workflow before executing');
      return;
    }

    // Check if we have a trigger node
    const hasTrigger = nodes.some(node => node.type === 'trigger');
    if (!hasTrigger) {
      alert('Please add a trigger node to start the workflow');
      return;
    }

    // Create a temporary workflow for execution if we don't have one
    const workflowToExecute = workflow || {
      id: `temp_workflow_${Date.now()}`,
      name: workflowName || 'Untitled Workflow',
      description: workflowDescription || '',
      nodes: nodes.map(node => ({
        id: node.id,
        type: node.type as WorkflowNodeType,
        position: node.position,
        data: node.data,
        config: node.data.config || {}
      })),
      edges: edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: edge.type as any,
      })),
      triggers: [],
      status: 'draft' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'current-user',
      executions: []
    };

    console.log('Executing workflow:', workflowToExecute);
    
    // Save the workflow first if it's new
    if (!workflow) {
      onSave?.(workflowToExecute);
    }
    
    // Execute the workflow
    onExecute?.(workflowToExecute.id);
    
    alert('Workflow execution started! Check the console for progress.');
  }, [workflow, nodes, edges, workflowName, workflowDescription, onSave, onExecute]);

  const loadTemplate = useCallback((template: any) => {
    // Convert template nodes to ReactFlow format
    const templateNodes = template.nodes.map((node: any) => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: {
        label: node.data.label,
        ...node.data
      },
    }));

    // Convert template edges to ReactFlow format
    const templateEdges = template.edges.map((edge: any) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: 'default',
      label: edge.label || '',
    }));

    setNodes(templateNodes);
    setEdges(templateEdges);
    setWorkflowName(template.name);
    setWorkflowDescription(template.description);
    setActiveTab('builder');
    
    // Fit view to show the loaded template
    setTimeout(() => {
      reactFlowInstance?.fitView();
    }, 100);
  }, [setNodes, setEdges, reactFlowInstance]);

  const getFilteredTemplates = useCallback(() => {
    if (selectedCategory === 'all') {
      return WORKFLOW_TEMPLATES;
    }
    return WORKFLOW_TEMPLATES.filter(template => 
      template.category.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [selectedCategory]);

  const getCategories = useCallback(() => {
    const categories = ['all', ...new Set(WORKFLOW_TEMPLATES.map(t => t.category))];
    return categories;
  }, []);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-80 bg-chatgpt-card border-r border-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Workflow Builder</h2>
            <div className="flex gap-1">
              <Button
                variant={activeTab === 'templates' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('templates')}
                className="text-xs"
              >
                <FileText className="w-3 h-3 mr-1" />
                Templates
              </Button>
              <Button
                variant={activeTab === 'builder' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('builder')}
                className="text-xs"
              >
                <Settings className="w-3 h-3 mr-1" />
                Builder
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Input
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              placeholder="Workflow name"
              className="bg-background border-border text-foreground placeholder:text-muted-foreground"
            />
            <Textarea
              value={workflowDescription}
              onChange={(e) => setWorkflowDescription(e.target.value)}
              placeholder="Description"
              rows={2}
              className="bg-background border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
          
          {activeTab === 'builder' && (
            <div className="flex gap-2 mt-3">
              <Button onClick={saveWorkflow} size="sm">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button onClick={executeWorkflow} size="sm" variant="outline">
                <Play className="w-4 h-4 mr-2" />
                Execute
              </Button>
            </div>
          )}
        </div>

        {/* Content based on active tab */}
        {activeTab === 'templates' ? (
          <div className="flex-1 p-4 overflow-y-auto scrollbar-hide">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Business Templates</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Choose from pre-built workflows for common business operations
                </p>
                
                {/* Category Filter */}
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full mb-4">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    {getCategories().map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Template Grid */}
              <div className="space-y-3">
                {getFilteredTemplates().map((template) => (
                  <Card 
                    key={template.id} 
                    className="cursor-pointer hover:shadow-md transition-all duration-200 border-border/50 hover:border-border"
                    onClick={() => loadTemplate(template)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-${template.color}-500/20 flex items-center justify-center flex-shrink-0`}>
                          {template.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-sm text-foreground truncate">
                              {template.name}
                            </h4>
                            <Badge variant="secondary" className="text-xs">
                              {template.difficulty}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                            {template.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">
                              {template.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {template.estimatedTime}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Node Templates */}
            <div className="flex-1 p-4 overflow-y-auto scrollbar-hide">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Add Nodes</h3>
              <div className="space-y-2">
                {NODE_TEMPLATES.map((template) => (
                  <div
                    key={template.type}
                    className="p-3 border border-border rounded-lg cursor-pointer hover:bg-background/50 transition-colors"
                    onClick={() => addNode(template.type)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg bg-${template.color}-500/20 flex items-center justify-center`}>
                        {template.icon}
                      </div>
                      <div>
                        <div className="font-medium text-sm text-foreground">{template.label}</div>
                        <div className="text-xs text-muted-foreground">{template.description}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Node Configuration */}
            {selectedNode && (
              <div className="p-4 border-t border-border">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Configure Node</h3>
                <div className="space-y-2">
                  <Input
                    value={selectedNode.data.label}
                    onChange={(e) => {
                      setSelectedNode({
                        ...selectedNode,
                        data: { ...selectedNode.data, label: e.target.value }
                      });
                      setNodes(nds => nds.map(n => 
                        n.id === selectedNode.id 
                          ? { ...n, data: { ...n.data, label: e.target.value } }
                          : n
                      ));
                    }}
                    placeholder="Node label"
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                  />
                  <Textarea
                    value={selectedNode.data.description || ''}
                    onChange={(e) => {
                      setSelectedNode({
                        ...selectedNode,
                        data: { ...selectedNode.data, description: e.target.value }
                      });
                      setNodes(nds => nds.map(n => 
                        n.id === selectedNode.id 
                          ? { ...n, data: { ...n.data, description: e.target.value } }
                          : n
                      ));
                    }}
                    placeholder="Node description"
                    rows={2}
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Main Canvas */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          style={{ background: 'transparent' }}
        >
          <Background 
            variant={BackgroundVariant.Dots} 
            gap={12} 
            size={1} 
            color="rgba(255, 255, 255, 0.1)"
          />
        </ReactFlow>

        {/* Custom Zoom Controls - Top Left */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <div className="bg-background/90 backdrop-blur-sm rounded-lg shadow-lg border border-border p-1 flex flex-col gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => reactFlowInstance?.zoomIn()}
              className="h-8 w-8 p-0 hover:bg-background/50"
              title="Zoom In"
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => reactFlowInstance?.zoomOut()}
              className="h-8 w-8 p-0 hover:bg-background/50"
              title="Zoom Out"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => reactFlowInstance?.fitView()}
              className="h-8 w-8 p-0 hover:bg-background/50"
              title="Fit View"
            >
              <Maximize className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WorkflowBuilder(props: WorkflowBuilderProps) {
  return (
    <ReactFlowProvider>
      <WorkflowBuilderContent {...props} />
    </ReactFlowProvider>
  );
}
