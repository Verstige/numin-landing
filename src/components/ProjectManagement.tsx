// Project Management Component
// Apple-inspired design with Trello/PipeDrive functionality

import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  useDroppable,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Filter,
  Search,
  LayoutGrid,
  List,
  Calendar,
  User,
  Flag,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  ArrowUpDown,
} from 'lucide-react';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { cn } from '@/lib/utils';
import { FirebaseProjectManagementService, ProjectManagementTask } from '@/lib/firebase-project-management';
import { toast } from '@/hooks/use-toast';
import { ChevronDown, ChevronUp } from 'lucide-react';

// Types - using ProjectManagementTask from Firebase service
type ProjectTask = ProjectManagementTask;

interface Column {
  id: string;
  title: string;
  status: ProjectTask['status'];
  tasks: ProjectTask[];
}

// Initial columns (Kanban view)
const initialColumns: Column[] = [
  { id: 'todo', title: 'To Do', status: 'todo', tasks: [] },
  { id: 'in-progress', title: 'In Progress', status: 'in-progress', tasks: [] },
  { id: 'review', title: 'Review', status: 'review', tasks: [] },
  { id: 'done', title: 'Done', status: 'done', tasks: [] },
];

// Sortable Task Card Component (Kanban)
function SortableTaskCard({ 
  task, 
  onEdit, 
  onDelete, 
  expandedTaskId, 
  onToggleExpand 
}: { 
  task: ProjectTask;
  onEdit: (task: ProjectTask) => void;
  onDelete: (taskId: string) => void;
  expandedTaskId: string | null;
  onToggleExpand: (taskId: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isExpanded = expandedTaskId === task.id;

  const getPriorityColor = (priority: ProjectTask['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-900/30 text-red-400 border-red-800';
      case 'high':
        return 'bg-orange-900/30 text-orange-400 border-orange-800';
      case 'medium':
        return 'bg-yellow-900/30 text-yellow-400 border-yellow-800';
      case 'low':
        return 'bg-blue-900/30 text-blue-400 border-blue-800';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative bg-gray-800 rounded-xl border border-gray-700 mb-3 transition-all duration-200 hover:shadow-lg hover:border-gray-600 hover:bg-gray-700",
        isDragging && "shadow-2xl scale-105 z-50 bg-gray-700"
      )}
    >
      {/* Priority indicator */}
      <div className="absolute top-0 left-0 w-1 h-full rounded-l-xl bg-gradient-to-b from-blue-500 to-purple-500" />
      
      <div className="p-4 pl-5">
        {/* Header - draggable */}
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-white text-sm leading-tight flex-1">
              {task.title}
            </h3>
            <div className="flex items-center gap-1 ml-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleExpand(task.id);
                }}
                className="h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
              >
                {isExpanded ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </Button>
            </div>
          </div>
          
          {!isExpanded && task.description && (
            <p className="text-xs text-gray-400 mb-3 line-clamp-2">
              {task.description}
            </p>
          )}
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="mb-3 pb-3 border-b border-gray-700 space-y-3">
            {task.description && (
              <div>
                <p className="text-xs font-medium text-gray-300 mb-1">Description</p>
                <p className="text-xs text-gray-400">{task.description}</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-gray-300 mb-1">Created</p>
                <p className="text-gray-400">{formatDate(task.createdAt)}</p>
              </div>
              {task.dueDate && (
                <div>
                  <p className="text-gray-300 mb-1">Due Date</p>
                  <p className="text-gray-400">{formatDate(task.dueDate)}</p>
                </div>
              )}
            </div>

            {task.tags.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-300 mb-2">Tags</p>
                <div className="flex flex-wrap gap-1">
                  {task.tags.map((tag, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="text-xs px-2 py-0.5 bg-gray-700 text-gray-300 border-gray-600"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between flex-wrap gap-2">
          {/* Tags (collapsed view) */}
          {!isExpanded && task.tags.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {task.tags.slice(0, 2).map((tag, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="text-xs px-2 py-0.5 bg-gray-700 text-gray-300 border-gray-600"
                >
                  {tag}
                </Badge>
              ))}
              {task.tags.length > 2 && (
                <Badge
                  variant="secondary"
                  className="text-xs px-2 py-0.5 bg-gray-700 text-gray-300 border-gray-600"
                >
                  +{task.tags.length - 2}
                </Badge>
              )}
            </div>
          )}

          {/* Priority */}
          <Badge className={cn("text-xs border", getPriorityColor(task.priority))}>
            {task.priority}
          </Badge>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700">
          <div className="flex items-center gap-2">
            {task.assigneeAvatar ? (
              <img
                src={task.assigneeAvatar}
                alt={task.assignee}
                className="w-6 h-6 rounded-full"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                {task.assignee?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
            <span className="text-xs text-gray-400">
              {task.assignee || 'Unassigned'}
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            {task.dueDate && !isExpanded && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                {formatDate(task.dueDate)}
              </div>
            )}
            <div className="flex items-center gap-1 ml-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(task);
                }}
                className="h-6 w-6 p-0 text-gray-400 hover:text-blue-400 hover:bg-gray-700"
              >
                <Edit className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(task.id);
                }}
                className="h-6 w-6 p-0 text-gray-400 hover:text-red-400 hover:bg-gray-700"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Column Component (Kanban)
function Column({ 
  column, 
  onEdit, 
  onDelete, 
  expandedTaskId, 
  onToggleExpand 
}: { 
  column: Column;
  onEdit: (task: ProjectTask) => void;
  onDelete: (taskId: string) => void;
  expandedTaskId: string | null;
  onToggleExpand: (taskId: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const getStatusIcon = (status: Column['status']) => {
    switch (status) {
      case 'todo':
        return <Clock className="w-4 h-4 text-gray-500" />;
      case 'in-progress':
        return <ArrowUpDown className="w-4 h-4 text-blue-500" />;
      case 'review':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'done':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    }
  };

  return (
    <div 
      ref={setNodeRef}
      data-column-id={column.id}
      className={cn(
        "flex-shrink-0 w-80 bg-gray-900 rounded-2xl border p-5 shadow-sm hover:shadow-md transition-all",
        isOver 
          ? "border-blue-500 bg-blue-950/30" 
          : "border-gray-800"
      )}
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          {getStatusIcon(column.status)}
          <h2 className="font-semibold text-white text-sm">
            {column.title}
          </h2>
          <Badge variant="secondary" className="text-xs bg-gray-800 text-gray-300 border-gray-700">
            {column.tasks.length}
          </Badge>
        </div>
      </div>

      <SortableContext
        items={column.tasks.map((task) => task.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3 min-h-[200px]">
          {column.tasks.map((task) => (
            <SortableTaskCard 
              key={task.id} 
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
              expandedTaskId={expandedTaskId}
              onToggleExpand={onToggleExpand}
            />
          ))}
          {column.tasks.length === 0 && (
            <div className={cn(
              "text-center py-12 text-sm border-2 border-dashed rounded-xl transition-colors",
              isOver
                ? "border-blue-500 text-blue-400 bg-blue-950/20"
                : "border-gray-700 text-gray-500"
            )}>
              {isOver ? "Drop here" : "Drop tasks here"}
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export default function ProjectManagement() {
  const { user } = useFirebaseAuth();
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load tasks from Firebase and set up real-time listener
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const userId = user.uid;
    const teamId = 'default-team';

    console.log('🔄 Setting up Firebase real-time listener for project management tasks');
    
    // Set up real-time listener
    const unsubscribe = FirebaseProjectManagementService.subscribeToTasks(
      userId,
      teamId,
      (tasks) => {
        console.log('✅ Received tasks from Firebase:', tasks.length);
        setTasks(tasks);
        setIsLoading(false);
        
        // Update columns with tasks
        const organizedColumns = initialColumns.map((col) => ({
          ...col,
          tasks: tasks.filter((task) => task.status === col.status),
        }));
        setColumns(organizedColumns);
      }
    );

    return () => {
      console.log('🔄 Cleaning up Firebase listener');
      unsubscribe();
    };
  }, [user]);

  // Drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the columns
    const activeColumn = columns.find((col) =>
      col.tasks.some((task) => task.id === activeId)
    );
    const overColumn = columns.find((col) =>
      col.tasks.some((task) => task.id === overId) || col.id === overId
    );

    if (!activeColumn || !overColumn) return;
    if (activeColumn.id === overColumn.id) return;

    setColumns((prevColumns) => {
      const activeColumnIndex = prevColumns.findIndex(
        (col) => col.id === activeColumn.id
      );
      const overColumnIndex = prevColumns.findIndex(
        (col) => col.id === overColumn.id
      );

      const activeTask = activeColumn.tasks.find(
        (task) => task.id === activeId
      );
      if (!activeTask) return prevColumns;

      const newColumns = [...prevColumns];
      newColumns[activeColumnIndex] = {
        ...newColumns[activeColumnIndex],
        tasks: newColumns[activeColumnIndex].tasks.filter(
          (task) => task.id !== activeId
        ),
      };

      newColumns[overColumnIndex] = {
        ...newColumns[overColumnIndex],
        tasks: [...newColumns[overColumnIndex].tasks, activeTask],
      };

      return newColumns;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) {
      // Reset columns if drag cancelled
      setColumns((prevColumns) => {
        return prevColumns.map((col) => ({
          ...col,
          tasks: tasks.filter((task) => task.status === col.status),
        }));
      });
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    // Check if dropped on a column (by checking if overId matches a column id)
    const overColumn = columns.find((col) => col.id === overId);
    if (overColumn) {
      const activeColumn = columns.find((col) =>
        col.tasks.some((task) => task.id === activeId)
      );

      if (activeColumn && activeColumn.id !== overColumn.id) {
        // Move task between columns
        setColumns((prevColumns) => {
          const newColumns = prevColumns.map((col) => {
            if (col.id === activeColumn.id) {
              return {
                ...col,
                tasks: col.tasks.filter((task) => task.id !== activeId),
              };
            }
            if (col.id === overColumn.id) {
              const task = tasks.find((t) => t.id === activeId);
              if (task) {
                return {
                  ...col,
                  tasks: [...col.tasks, { ...task, status: col.status, updatedAt: new Date() }],
                };
              }
            }
            return col;
          });
          return newColumns;
        });

        // Update task status in Firebase
        if (user) {
          const task = tasks.find((t) => t.id === activeId);
          if (task) {
            FirebaseProjectManagementService.updateTask(
              user.uid,
              'default-team',
              activeId,
              { status: overColumn.status }
            ).catch((error) => {
              console.error('❌ Error updating task status:', error);
              toast({
                title: "Error",
                description: "Failed to update task status. Please try again.",
                variant: "destructive",
              });
            });
          }
        }
      }
      return;
    }

    // Handle reordering within the same column or between columns
    const activeColumn = columns.find((col) =>
      col.tasks.some((task) => task.id === activeId)
    );
    const overColumn2 = columns.find((col) =>
      col.tasks.some((task) => task.id === overId)
    );

    if (!activeColumn || !overColumn2) return;

    // If moving between different columns
    if (activeColumn.id !== overColumn2.id) {
      setColumns((prevColumns) => {
        const newColumns = prevColumns.map((col) => {
          if (col.id === activeColumn.id) {
            return {
              ...col,
              tasks: col.tasks.filter((task) => task.id !== activeId),
            };
          }
          if (col.id === overColumn2.id) {
            const task = tasks.find((t) => t.id === activeId);
            if (task) {
              const overTaskIndex = col.tasks.findIndex((t) => t.id === overId);
              const newTasks = [...col.tasks];
              newTasks.splice(overTaskIndex, 0, { ...task, status: col.status, updatedAt: new Date() });
              return {
                ...col,
                tasks: newTasks,
              };
            }
          }
          return col;
        });
        return newColumns;
      });

      // Update task status in Firebase
      if (user) {
        const task = tasks.find((t) => t.id === activeId);
        if (task) {
          FirebaseProjectManagementService.updateTask(
            user.uid,
            'default-team',
            activeId,
            { status: overColumn2.status }
          ).catch((error) => {
            console.error('❌ Error updating task status:', error);
            toast({
              title: "Error",
              description: "Failed to update task status. Please try again.",
              variant: "destructive",
            });
          });
        }
      }
      return;
    }

    // Reordering within the same column
    const activeIndex = activeColumn.tasks.findIndex(
      (task) => task.id === activeId
    );
    const overIndex = overColumn2.tasks.findIndex((task) => task.id === overId);

    if (activeIndex !== overIndex) {
      setColumns((prevColumns) => {
        const columnIndex = prevColumns.findIndex(
          (col) => col.id === activeColumn.id
        );
        const newColumns = [...prevColumns];
        newColumns[columnIndex] = {
          ...newColumns[columnIndex],
          tasks: arrayMove(
            newColumns[columnIndex].tasks,
            activeIndex,
            overIndex
          ),
        };
        return newColumns;
      });
    }
  };

  // Task management
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'todo' as ProjectTask['status'],
    priority: 'medium' as ProjectTask['priority'],
    assignee: '',
    dueDate: '',
    tags: '',
  });

  const handleAddTask = async () => {
    if (!newTask.title.trim()) {
      toast({
        title: "Error",
        description: "Task title cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Error",
        description: "Please log in to create tasks.",
        variant: "destructive",
      });
      return;
    }

    try {
      const taskData = {
        title: newTask.title,
        description: newTask.description || undefined,
        status: newTask.status,
        priority: newTask.priority,
        assignee: newTask.assignee || undefined,
        tags: newTask.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        dueDate: newTask.dueDate ? new Date(newTask.dueDate) : undefined,
      };

      await FirebaseProjectManagementService.createTask(
        user.uid,
        'default-team',
        taskData
      );

      toast({
        title: "Success",
        description: "Task created successfully!",
      });

      setNewTask({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        assignee: '',
        dueDate: '',
        tags: '',
      });
      setIsAddTaskOpen(false);
    } catch (error: any) {
      console.error('❌ Error creating task:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditTask = async () => {
    if (!selectedTask || !newTask.title.trim()) {
      toast({
        title: "Error",
        description: "Task title cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Error",
        description: "Please log in to edit tasks.",
        variant: "destructive",
      });
      return;
    }

    try {
      const updates = {
        title: newTask.title,
        description: newTask.description || undefined,
        status: newTask.status,
        priority: newTask.priority,
        assignee: newTask.assignee || undefined,
        tags: newTask.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        dueDate: newTask.dueDate ? new Date(newTask.dueDate) : undefined,
      };

      await FirebaseProjectManagementService.updateTask(
        user.uid,
        'default-team',
        selectedTask.id,
        updates
      );

      toast({
        title: "Success",
        description: "Task updated successfully!",
      });

      setSelectedTask(null);
      setNewTask({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        assignee: '',
        dueDate: '',
        tags: '',
      });
      setIsEditTaskOpen(false);
    } catch (error: any) {
      console.error('❌ Error updating task:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please log in to delete tasks.",
        variant: "destructive",
      });
      return;
    }

    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await FirebaseProjectManagementService.deleteTask(
        user.uid,
        'default-team',
        taskId
      );

      toast({
        title: "Success",
        description: "Task deleted successfully!",
      });
    } catch (error: any) {
      console.error('❌ Error deleting task:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (task: ProjectTask) => {
    setSelectedTask(task);
    setNewTask({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      assignee: task.assignee || '',
      dueDate: task.dueDate ? task.dueDate.toISOString().split('T')[0] : '',
      tags: task.tags.join(', '),
    });
    setIsEditTaskOpen(true);
  };

  // Filter tasks for table view
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority =
      filterPriority === 'all' || task.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getPriorityIcon = (priority: ProjectTask['priority']) => {
    switch (priority) {
      case 'urgent':
        return <Flag className="w-4 h-4 text-red-500" />;
      case 'high':
        return <Flag className="w-4 h-4 text-orange-500" />;
      case 'medium':
        return <Flag className="w-4 h-4 text-yellow-500" />;
      case 'low':
        return <Flag className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: ProjectTask['status']) => {
    switch (status) {
      case 'todo':
        return (
          <Badge className="bg-gray-800 text-gray-300 border-gray-700">
            To Do
          </Badge>
        );
      case 'in-progress':
        return (
          <Badge className="bg-blue-900/30 text-blue-400 border-blue-800">
            In Progress
          </Badge>
        );
      case 'review':
        return (
          <Badge className="bg-yellow-900/30 text-yellow-400 border-yellow-800">
            Review
          </Badge>
        );
      case 'done':
        return (
          <Badge className="bg-green-900/30 text-green-400 border-green-800">
            Done
          </Badge>
        );
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
            <div>
            <h1 className="text-2xl font-bold text-white">
              Project Management
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Organize and track your projects with style
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'kanban' ? 'table' : 'kanban')}
              className="gap-2 bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
            >
              {viewMode === 'kanban' ? (
                <>
                  <List className="w-4 h-4" />
                  Table View
                </>
              ) : (
                <>
                  <LayoutGrid className="w-4 h-4" />
                  Kanban View
                </>
              )}
            </Button>
            <Button onClick={() => setIsAddTaskOpen(true)} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4" />
              New Task
            </Button>
          </div>
        </div>

        {/* Filters (Table View) */}
        {viewMode === 'table' && (
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40 bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="all" className="text-white">All Status</SelectItem>
                <SelectItem value="todo" className="text-white">To Do</SelectItem>
                <SelectItem value="in-progress" className="text-white">In Progress</SelectItem>
                <SelectItem value="review" className="text-white">Review</SelectItem>
                <SelectItem value="done" className="text-white">Done</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-40 bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="all" className="text-white">All Priority</SelectItem>
                <SelectItem value="urgent" className="text-white">Urgent</SelectItem>
                <SelectItem value="high" className="text-white">High</SelectItem>
                <SelectItem value="medium" className="text-white">Medium</SelectItem>
                <SelectItem value="low" className="text-white">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {viewMode === 'kanban' ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-6 overflow-x-auto pb-4">
              {columns.map((column) => (
                <Column 
                  key={column.id} 
                  column={column}
                  onEdit={openEditDialog}
                  onDelete={handleDeleteTask}
                  expandedTaskId={expandedTaskId}
                  onToggleExpand={setExpandedTaskId}
                />
              ))}
            </div>
            <DragOverlay>
              {activeId ? (
                <div className="bg-gray-800 rounded-xl border-2 border-blue-500 p-4 shadow-2xl w-80">
                  <h3 className="font-semibold text-white">
                    {tasks.find((t) => t.id === activeId)?.title}
                  </h3>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        ) : (
          <Card className="bg-gray-900 border-gray-800">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-gray-800 border-gray-800">
                  <TableHead className="w-12 text-gray-400"></TableHead>
                  <TableHead className="text-gray-400">Task</TableHead>
                  <TableHead className="text-gray-400">Status</TableHead>
                  <TableHead className="text-gray-400">Priority</TableHead>
                  <TableHead className="text-gray-400">Assignee</TableHead>
                  <TableHead className="text-gray-400">Due Date</TableHead>
                  <TableHead className="text-gray-400">Tags</TableHead>
                  <TableHead className="w-12 text-gray-400"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task) => (
                  <React.Fragment key={task.id}>
                    <TableRow
                      className="hover:bg-gray-800 cursor-pointer border-gray-800"
                    >
                      <TableCell>
                        <div className="w-2 h-2 rounded-full bg-gradient-to-br from-blue-500 to-purple-500"></div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-semibold text-white">
                            {task.title}
                          </div>
                          {task.description && expandedTaskId !== task.id && (
                            <div className="text-sm text-gray-400 mt-1 line-clamp-1">
                              {task.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                    <TableCell>{getStatusBadge(task.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getPriorityIcon(task.priority)}
                        <span className="text-sm capitalize text-white">{task.priority}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {task.assigneeAvatar ? (
                          <img
                            src={task.assigneeAvatar}
                            alt={task.assignee}
                            className="w-6 h-6 rounded-full"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                            {task.assignee?.[0]?.toUpperCase() || 'U'}
                          </div>
                        )}
                        <span className="text-sm text-gray-300">{task.assignee || 'Unassigned'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {task.dueDate ? (
                        <div className="text-sm text-gray-400">
                          {new Intl.DateTimeFormat('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          }).format(task.dueDate)}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {task.tags.slice(0, 2).map((tag, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="text-xs bg-gray-800 text-gray-300 border-gray-700"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {task.tags.length > 2 && (
                          <Badge variant="secondary" className="text-xs bg-gray-800 text-gray-300 border-gray-700">
                            +{task.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setExpandedTaskId(expandedTaskId === task.id ? null : task.id);
                          }}
                          className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-800"
                        >
                          {expandedTaskId === task.id ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(task)}
                          className="h-8 w-8 p-0 text-gray-400 hover:text-blue-400 hover:bg-gray-800"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTask(task.id)}
                          className="h-8 w-8 p-0 text-gray-400 hover:text-red-400 hover:bg-gray-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  {expandedTaskId === task.id && (
                    <TableRow className="bg-gray-800/50 border-gray-800">
                      <TableCell colSpan={8} className="py-4">
                        <div className="space-y-3 pl-6">
                          {task.description && (
                            <div>
                              <p className="text-xs font-medium text-gray-300 mb-1">Description</p>
                              <p className="text-sm text-gray-400">{task.description}</p>
                            </div>
                          )}
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-300 mb-1">Created</p>
                              <p className="text-gray-400">
                                {new Intl.DateTimeFormat('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                }).format(task.createdAt)}
                              </p>
                            </div>
                            {task.dueDate && (
                              <div>
                                <p className="text-gray-300 mb-1">Due Date</p>
                                <p className="text-gray-400">
                                  {new Intl.DateTimeFormat('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  }).format(task.dueDate)}
                                </p>
                              </div>
                            )}
                          </div>
                          {task.tags.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-gray-300 mb-2">Tags</p>
                              <div className="flex flex-wrap gap-1">
                                {task.tags.map((tag, idx) => (
                                  <Badge
                                    key={idx}
                                    variant="secondary"
                                    className="text-xs bg-gray-700 text-gray-300 border-gray-600"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
                ))}
                {filteredTasks.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <div className="text-gray-400">
                        No tasks found. Create your first task!
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>

      {/* Add Task Dialog */}
      <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
        <DialogContent className="max-w-2xl bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">Create New Task</DialogTitle>
            <DialogDescription className="text-gray-400">
              Add a new task to your project management board
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="title" className="text-gray-300">Title *</Label>
              <Input
                id="title"
                value={newTask.title}
                onChange={(e) =>
                  setNewTask({ ...newTask, title: e.target.value })
                }
                placeholder="Enter task title"
                className="mt-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>
            <div>
              <Label htmlFor="description" className="text-gray-300">Description</Label>
              <Textarea
                id="description"
                value={newTask.description}
                onChange={(e) =>
                  setNewTask({ ...newTask, description: e.target.value })
                }
                placeholder="Enter task description"
                className="mt-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status" className="text-gray-300">Status</Label>
                <Select
                  value={newTask.status}
                  onValueChange={(value) =>
                    setNewTask({ ...newTask, status: value as ProjectTask['status'] })
                  }
                >
                  <SelectTrigger className="mt-1 bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="todo" className="text-white">To Do</SelectItem>
                    <SelectItem value="in-progress" className="text-white">In Progress</SelectItem>
                    <SelectItem value="review" className="text-white">Review</SelectItem>
                    <SelectItem value="done" className="text-white">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority" className="text-gray-300">Priority</Label>
                <Select
                  value={newTask.priority}
                  onValueChange={(value) =>
                    setNewTask({ ...newTask, priority: value as ProjectTask['priority'] })
                  }
                >
                  <SelectTrigger className="mt-1 bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="low" className="text-white">Low</SelectItem>
                    <SelectItem value="medium" className="text-white">Medium</SelectItem>
                    <SelectItem value="high" className="text-white">High</SelectItem>
                    <SelectItem value="urgent" className="text-white">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="assignee" className="text-gray-300">Assignee</Label>
                <Input
                  id="assignee"
                  value={newTask.assignee}
                  onChange={(e) =>
                    setNewTask({ ...newTask, assignee: e.target.value })
                  }
                  placeholder="Assignee name"
                  className="mt-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                />
              </div>
              <div>
                <Label htmlFor="dueDate" className="text-gray-300">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) =>
                    setNewTask({ ...newTask, dueDate: e.target.value })
                  }
                  className="mt-1 bg-gray-800 border-gray-700 text-white"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="tags" className="text-gray-300">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={newTask.tags}
                onChange={(e) =>
                  setNewTask({ ...newTask, tags: e.target.value })
                }
                placeholder="design, frontend, urgent"
                className="mt-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsAddTaskOpen(false)}
              className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button onClick={handleAddTask} className="bg-blue-600 hover:bg-blue-700 text-white">Create Task</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={isEditTaskOpen} onOpenChange={setIsEditTaskOpen}>
        <DialogContent className="max-w-2xl bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">Edit Task</DialogTitle>
            <DialogDescription className="text-gray-400">
              Update task details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="title" className="text-gray-300">Title *</Label>
              <Input
                id="title"
                value={newTask.title}
                onChange={(e) =>
                  setNewTask({ ...newTask, title: e.target.value })
                }
                placeholder="Enter task title"
                className="mt-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>
            <div>
              <Label htmlFor="description" className="text-gray-300">Description</Label>
              <Textarea
                id="description"
                value={newTask.description}
                onChange={(e) =>
                  setNewTask({ ...newTask, description: e.target.value })
                }
                placeholder="Enter task description"
                className="mt-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status" className="text-gray-300">Status</Label>
                <Select
                  value={newTask.status}
                  onValueChange={(value) =>
                    setNewTask({ ...newTask, status: value as ProjectTask['status'] })
                  }
                >
                  <SelectTrigger className="mt-1 bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="todo" className="text-white">To Do</SelectItem>
                    <SelectItem value="in-progress" className="text-white">In Progress</SelectItem>
                    <SelectItem value="review" className="text-white">Review</SelectItem>
                    <SelectItem value="done" className="text-white">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority" className="text-gray-300">Priority</Label>
                <Select
                  value={newTask.priority}
                  onValueChange={(value) =>
                    setNewTask({ ...newTask, priority: value as ProjectTask['priority'] })
                  }
                >
                  <SelectTrigger className="mt-1 bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="low" className="text-white">Low</SelectItem>
                    <SelectItem value="medium" className="text-white">Medium</SelectItem>
                    <SelectItem value="high" className="text-white">High</SelectItem>
                    <SelectItem value="urgent" className="text-white">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="assignee" className="text-gray-300">Assignee</Label>
                <Input
                  id="assignee"
                  value={newTask.assignee}
                  onChange={(e) =>
                    setNewTask({ ...newTask, assignee: e.target.value })
                  }
                  placeholder="Assignee name"
                  className="mt-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                />
              </div>
              <div>
                <Label htmlFor="dueDate" className="text-gray-300">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) =>
                    setNewTask({ ...newTask, dueDate: e.target.value })
                  }
                  className="mt-1 bg-gray-800 border-gray-700 text-white"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="tags" className="text-gray-300">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={newTask.tags}
                onChange={(e) =>
                  setNewTask({ ...newTask, tags: e.target.value })
                }
                placeholder="design, frontend, urgent"
                className="mt-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditTaskOpen(false);
                setSelectedTask(null);
              }}
              className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button onClick={handleEditTask} className="bg-blue-600 hover:bg-blue-700 text-white">Update Task</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
