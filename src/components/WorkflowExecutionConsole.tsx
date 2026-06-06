import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Play, 
  Square, 
  Trash2, 
  Activity, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Bot, 
  Zap, 
  GitBranch, 
  Code, 
  Webhook, 
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';

interface ExecutionLog {
  id: string;
  timestamp: Date;
  type: 'info' | 'success' | 'error' | 'warning';
  message: string;
  nodeId?: string;
  nodeType?: string;
  agentName?: string;
  details?: any;
}

interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflowName: string;
  status: 'running' | 'completed' | 'failed' | 'paused';
  startTime: Date;
  endTime?: Date;
  currentNode?: string;
  results: Record<string, any>;
  errors: string[];
  logs: ExecutionLog[];
}

interface WorkflowExecutionConsoleProps {
  executions: Map<string, WorkflowExecution>;
  onClearExecutions: () => void;
  onClearLogs: (executionId: string) => void;
  onStopExecution: (executionId: string) => void;
}

export default function WorkflowExecutionConsole({
  executions,
  onClearExecutions,
  onClearLogs,
  onStopExecution
}: WorkflowExecutionConsoleProps) {
  const [selectedExecution, setSelectedExecution] = useState<string | null>(null);
  const [showLogs, setShowLogs] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);

  const executionList = Array.from(executions.values()).sort(
    (a, b) => b.startTime.getTime() - a.startTime.getTime()
  );

  const selectedExecutionData = selectedExecution ? executions.get(selectedExecution) : null;

  // Auto-scroll to bottom when new logs are added
  useEffect(() => {
    if (autoScroll && selectedExecutionData?.logs) {
      const scrollContainer = document.getElementById('execution-logs');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [selectedExecutionData?.logs, autoScroll]);

  // Auto-select the most recent execution if none is selected
  useEffect(() => {
    if (!selectedExecution && executionList.length > 0) {
      setSelectedExecution(executionList[0].id);
    }
  }, [executionList, selectedExecution]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'paused':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      running: 'default',
      completed: 'secondary',
      failed: 'destructive',
      paused: 'outline'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Activity className="w-4 h-4 text-blue-500" />;
    }
  };

  const getNodeIcon = (nodeType: string) => {
    switch (nodeType) {
      case 'trigger':
        return <Webhook className="w-3 h-3" />;
      case 'agent-action':
        return <Bot className="w-3 h-3" />;
      case 'api-call':
        return <Zap className="w-3 h-3" />;
      case 'condition':
        return <GitBranch className="w-3 h-3" />;
      case 'function':
        return <Code className="w-3 h-3" />;
      default:
        return <Activity className="w-3 h-3" />;
    }
  };

  const formatDuration = (startTime: Date, endTime?: Date) => {
    const end = endTime || new Date();
    const duration = end.getTime() - startTime.getTime();
    const seconds = Math.floor(duration / 1000);
    const milliseconds = duration % 1000;
    
    if (seconds > 0) {
      return `${seconds}.${milliseconds.toString().padStart(3, '0')}s`;
    }
    return `${milliseconds}ms`;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Workflow Execution Console
          </h3>
          <p className="text-sm text-muted-foreground">
            Monitor and debug workflow executions in real-time
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLogs(!showLogs)}
          >
            {showLogs ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showLogs ? 'Hide Logs' : 'Show Logs'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onClearExecutions}
            disabled={executionList.length === 0}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      {executionList.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="text-lg font-medium mb-2">No Executions Yet</h4>
            <p className="text-muted-foreground">
              Start a workflow execution to see live monitoring here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Execution List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Active Executions</CardTitle>
                <CardDescription>
                  {executionList.length} execution{executionList.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-96">
                  <div className="space-y-2 p-4">
                    {executionList.map((execution) => (
                      <div
                        key={execution.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedExecution === execution.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setSelectedExecution(execution.id)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(execution.status)}
                            <span className="font-medium text-sm truncate">
                              {execution.workflowName}
                            </span>
                          </div>
                          {getStatusBadge(execution.status)}
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div>Started: {execution.startTime.toLocaleTimeString()}</div>
                          <div>Duration: {formatDuration(execution.startTime, execution.endTime)}</div>
                          {execution.currentNode && (
                            <div className="text-blue-600">
                              Current: {execution.currentNode}
                            </div>
                          )}
                          <div>Logs: {execution.logs.length}</div>
                        </div>
                        {execution.status === 'running' && (
                          <Button
                            size="sm"
                            variant="destructive"
                            className="w-full mt-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              onStopExecution(execution.id);
                            }}
                          >
                            <Square className="w-3 h-3 mr-1" />
                            Stop
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Execution Details */}
          <div className="lg:col-span-2">
            {selectedExecutionData ? (
              <div className="space-y-4">
                {/* Execution Summary */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(selectedExecutionData.status)}
                        <CardTitle className="text-base">
                          {selectedExecutionData.workflowName}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(selectedExecutionData.status)}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onClearLogs(selectedExecutionData.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Clear Logs
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Start Time</div>
                        <div className="font-medium">
                          {selectedExecutionData.startTime.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Duration</div>
                        <div className="font-medium">
                          {formatDuration(selectedExecutionData.startTime, selectedExecutionData.endTime)}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Logs</div>
                        <div className="font-medium">{selectedExecutionData.logs.length}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Errors</div>
                        <div className="font-medium text-red-500">{selectedExecutionData.errors.length}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Execution Logs */}
                {showLogs && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Execution Logs</CardTitle>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setAutoScroll(!autoScroll)}
                          >
                            {autoScroll ? 'Auto-scroll ON' : 'Auto-scroll OFF'}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <ScrollArea className="h-80" id="execution-logs">
                        <div className="p-4 space-y-2">
                          {selectedExecutionData.logs.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                              No logs yet. Execution will start soon...
                            </div>
                          ) : (
                            selectedExecutionData.logs.map((log) => (
                              <div
                                key={log.id}
                                className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:border-border transition-colors"
                              >
                                <div className="flex-shrink-0 mt-0.5">
                                  {getLogIcon(log.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs text-muted-foreground">
                                      {log.timestamp.toLocaleTimeString()}
                                    </span>
                                    {log.nodeType && (
                                      <div className="flex items-center gap-1">
                                        {getNodeIcon(log.nodeType)}
                                        <span className="text-xs text-muted-foreground">
                                          {log.nodeType}
                                        </span>
                                      </div>
                                    )}
                                    {log.agentName && (
                                      <Badge variant="outline" className="text-xs">
                                        {log.agentName}
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="text-sm">{log.message}</div>
                                  {log.details && (
                                    <details className="mt-2">
                                      <summary className="text-xs text-muted-foreground cursor-pointer">
                                        View Details
                                      </summary>
                                      <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">
                                        {JSON.stringify(log.details, null, 2)}
                                      </pre>
                                    </details>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}

                {/* Execution Results */}
                {Object.keys(selectedExecutionData.results).length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Node Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(selectedExecutionData.results).map(([nodeId, result]) => (
                          <div key={nodeId} className="p-3 border border-border rounded-lg">
                            <div className="font-medium text-sm mb-2">{nodeId}</div>
                            <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                              {JSON.stringify(result, null, 2)}
                            </pre>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Execution Errors */}
                {selectedExecutionData.errors.length > 0 && (
                  <Card className="border-red-200">
                    <CardHeader>
                      <CardTitle className="text-base text-red-600 flex items-center gap-2">
                        <XCircle className="w-4 h-4" />
                        Errors
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {selectedExecutionData.errors.map((error, index) => (
                          <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="text-sm text-red-800">{error}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h4 className="text-lg font-medium mb-2">Select an Execution</h4>
                  <p className="text-muted-foreground">
                    Choose an execution from the list to view detailed logs and results
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
