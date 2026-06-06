import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  DollarSign, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Building2, 
  Target, 
  User,
  Filter,
  Search,
  Download,
  Upload,
  Receipt,
  CheckCircle,
  XCircle,
  Clock,
  MoreVertical,
  Edit,
  Trash2,
  Package,
  Code,
  Megaphone,
  Plane,
  Zap,
  Briefcase,
  Monitor,
  MoreHorizontal,
  Box,
  Users,
  UserCheck,
  ShoppingCart,
  Utensils,
  Car,
  Film,
  ShoppingBag,
  Heart,
  GraduationCap,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  BarChart3,
  Wallet
} from 'lucide-react';
import { FirebaseExpensesService, type Expense, type ExpenseCategory } from '@/lib/firebase-expenses';
import { BusinessMapNodesService, type BusinessMapNode } from '@/lib/firebase-business-map';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

const iconMap: Record<string, React.ComponentType<any>> = {
  Package, Code, Megaphone, Plane, Zap, Briefcase, Monitor, MoreHorizontal,
  Box, Users: Users, UserCheck, ShoppingCart, Utensils, Car, Film, ShoppingBag,
  Receipt, Heart, GraduationCap, FileText
};

export default function ExpensesDashboard() {
  const { user } = useFirebaseAuth();
  const userId = user?.uid || '';
  const teamId = 'default-team';

  // Safety check
  if (!user) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-12">
            <Receipt className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Authentication Required</h3>
            <p className="text-muted-foreground text-center">
              Please log in to access the Expenses & Billing system.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // State
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [businesses, setBusinesses] = useState<BusinessMapNode[]>([]);
  const [projects, setProjects] = useState<BusinessMapNode[]>([]);
  const [selectedType, setSelectedType] = useState<'business' | 'project' | 'personal'>('business');
  const [selectedBusiness, setSelectedBusiness] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'year'>('all');

  // Form state
  const [formData, setFormData] = useState({
    type: 'business' as 'business' | 'project' | 'personal',
    businessId: '',
    projectId: '',
    category: '',
    amount: '',
    currency: 'USD',
    description: '',
    date: new Date(),
    vendor: '',
    tags: [] as string[],
    status: 'pending' as 'pending' | 'approved' | 'rejected' | 'paid'
  });

  // Load businesses and projects from mindmap
  useEffect(() => {
    if (!userId) {
      console.log('⚠️ ExpensesDashboard: No userId, skipping business/project load');
      return;
    }

    try {
      const unsubscribe = BusinessMapNodesService.subscribeToNodes(
        userId,
        teamId,
        (nodes) => {
          try {
            const businessNodes = nodes.filter(n => n.nodeType === 'business');
            const projectNodes = nodes.filter(n => n.nodeType === 'subproject');
            setBusinesses(businessNodes);
            setProjects(projectNodes);
          } catch (error) {
            console.error('❌ Error processing business map nodes:', error);
          }
        }
      );

      return () => {
        try {
          unsubscribe();
        } catch (error) {
          console.error('❌ Error unsubscribing from business map nodes:', error);
        }
      };
    } catch (error) {
      console.error('❌ Error subscribing to business map nodes:', error);
    }
  }, [userId, teamId]);

  // Load expenses
  useEffect(() => {
    if (!userId) {
      console.log('⚠️ ExpensesDashboard: No userId, skipping expenses load');
      setExpenses([]);
      return;
    }

    try {
      const filters: any = {
        type: selectedType
      };
      if (selectedType === 'business' && selectedBusiness) {
        filters.businessId = selectedBusiness;
      }
      if (selectedType === 'project' && selectedProject) {
        filters.projectId = selectedProject;
      }
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }

      const unsubscribe = FirebaseExpensesService.subscribeToExpenses(
        userId,
        teamId,
        filters,
        (loadedExpenses) => {
          try {
            // Apply date filter
            let filtered = loadedExpenses;
            if (dateFilter !== 'all') {
              const now = new Date();
              filtered = loadedExpenses.filter(exp => {
                try {
                  const expDate = new Date(exp.date);
                  switch (dateFilter) {
                    case 'today':
                      return expDate.toDateString() === now.toDateString();
                    case 'week':
                      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                      return expDate >= weekAgo;
                    case 'month':
                      return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
                    case 'year':
                      return expDate.getFullYear() === now.getFullYear();
                    default:
                      return true;
                  }
                } catch (error) {
                  console.error('❌ Error filtering expense by date:', error, exp);
                  return true;
                }
              });
            }

            // Apply search filter
            if (searchQuery) {
              filtered = filtered.filter(exp => {
                try {
                  return exp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    exp.vendor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    exp.category.toLowerCase().includes(searchQuery.toLowerCase());
                } catch (error) {
                  console.error('❌ Error filtering expense by search:', error, exp);
                  return false;
                }
              });
            }

            setExpenses(filtered);
          } catch (error) {
            console.error('❌ Error processing expenses:', error);
            setExpenses([]);
          }
        }
      );

      return () => {
        try {
          unsubscribe();
        } catch (error) {
          console.error('❌ Error unsubscribing from expenses:', error);
        }
      };
    } catch (error) {
      console.error('❌ Error subscribing to expenses:', error);
      setExpenses([]);
    }
  }, [userId, teamId, selectedType, selectedBusiness, selectedProject, statusFilter, dateFilter, searchQuery]);

  // Calculate totals
  const totals = {
    business: expenses.filter(e => e.type === 'business').reduce((sum, e) => sum + e.amount, 0),
    project: expenses.filter(e => e.type === 'project').reduce((sum, e) => sum + e.amount, 0),
    personal: expenses.filter(e => e.type === 'personal').reduce((sum, e) => sum + e.amount, 0),
    total: expenses.reduce((sum, e) => sum + e.amount, 0),
    pending: expenses.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0),
    approved: expenses.filter(e => e.status === 'approved').reduce((sum, e) => sum + e.amount, 0),
    paid: expenses.filter(e => e.status === 'paid').reduce((sum, e) => sum + e.amount, 0)
  };

  const handleAddExpense = async () => {
    if (!formData.category || !formData.amount || !formData.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      await FirebaseExpensesService.createExpense(userId, teamId, {
        type: formData.type,
        businessId: formData.type === 'business' ? formData.businessId : undefined,
        projectId: formData.type === 'project' ? formData.projectId : undefined,
        category: formData.category,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        description: formData.description,
        date: formData.date,
        vendor: formData.vendor || undefined,
        tags: formData.tags,
        status: formData.status
      });

      toast({
        title: "Expense Added",
        description: "Your expense has been added successfully.",
      });

      setIsAddDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error adding expense:', error);
      toast({
        title: "Error",
        description: "Failed to add expense. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEditExpense = async () => {
    if (!selectedExpense || !formData.category || !formData.amount || !formData.description) {
      return;
    }

    try {
      await FirebaseExpensesService.updateExpense(userId, teamId, selectedExpense.id, {
        type: formData.type,
        businessId: formData.type === 'business' ? formData.businessId : undefined,
        projectId: formData.type === 'project' ? formData.projectId : undefined,
        category: formData.category,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        description: formData.description,
        date: formData.date,
        vendor: formData.vendor || undefined,
        tags: formData.tags,
        status: formData.status
      });

      toast({
        title: "Expense Updated",
        description: "Your expense has been updated successfully.",
      });

      setIsEditDialogOpen(false);
      setSelectedExpense(null);
      resetForm();
    } catch (error) {
      console.error('Error updating expense:', error);
      toast({
        title: "Error",
        description: "Failed to update expense. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
      await FirebaseExpensesService.deleteExpense(userId, teamId, expenseId);
      toast({
        title: "Expense Deleted",
        description: "The expense has been deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast({
        title: "Error",
        description: "Failed to delete expense. Please try again.",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      type: selectedType,
      businessId: selectedBusiness,
      projectId: selectedProject,
      category: '',
      amount: '',
      currency: 'USD',
      description: '',
      date: new Date(),
      vendor: '',
      tags: [],
      status: 'pending'
    });
  };

  const openEditDialog = (expense: Expense) => {
    setSelectedExpense(expense);
    setFormData({
      type: expense.type,
      businessId: expense.businessId || '',
      projectId: expense.projectId || '',
      category: expense.category,
      amount: expense.amount.toString(),
      currency: expense.currency,
      description: expense.description,
      date: expense.date,
      vendor: expense.vendor || '',
      tags: expense.tags,
      status: expense.status
    });
    setIsEditDialogOpen(true);
  };

  const getCategoryInfo = (categoryId: string): ExpenseCategory | undefined => {
    return FirebaseExpensesService.getCategoryById(categoryId);
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'approved': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'rejected': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const categories = FirebaseExpensesService.getCategories(selectedType);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Expenses & Billing</h1>
              <p className="text-muted-foreground">Track and manage your business, project, and personal expenses</p>
            </div>
            <Button 
              onClick={() => {
                resetForm();
                setIsAddDialogOpen(true);
              }}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Expenses</p>
                    <p className="text-2xl font-bold text-foreground">{formatCurrency(totals.total)}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Paid</p>
                    <p className="text-2xl font-bold text-foreground">{formatCurrency(totals.paid)}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Pending</p>
                    <p className="text-2xl font-bold text-foreground">{formatCurrency(totals.pending)}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Approved</p>
                    <p className="text-2xl font-bold text-foreground">{formatCurrency(totals.approved)}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1">
              <Button
                variant={selectedType === 'business' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => {
                  setSelectedType('business');
                  setSelectedBusiness('');
                  setSelectedProject('');
                }}
                className="gap-2"
              >
                <Building2 className="w-4 h-4" />
                Business
              </Button>
              <Button
                variant={selectedType === 'project' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => {
                  setSelectedType('project');
                  setSelectedBusiness('');
                  setSelectedProject('');
                }}
                className="gap-2"
              >
                <Target className="w-4 h-4" />
                Project
              </Button>
              <Button
                variant={selectedType === 'personal' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => {
                  setSelectedType('personal');
                  setSelectedBusiness('');
                  setSelectedProject('');
                }}
                className="gap-2"
              >
                <User className="w-4 h-4" />
                Personal
              </Button>
            </div>

            {selectedType === 'business' && businesses.length > 0 && (
              <Select value={selectedBusiness || 'all'} onValueChange={(v) => setSelectedBusiness(v === 'all' ? '' : v)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Businesses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Businesses</SelectItem>
                  {businesses.map(business => (
                    <SelectItem key={business.id} value={business.id}>
                      {business.data.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {selectedType === 'project' && projects.length > 0 && (
              <Select value={selectedProject || 'all'} onValueChange={(v) => setSelectedProject(v === 'all' ? '' : v)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.data.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as any)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search expenses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expenses List */}
      <div className="flex-1 overflow-y-auto p-6">
        {expenses.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center p-12">
              <Receipt className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Expenses Found</h3>
              <p className="text-muted-foreground mb-4 text-center">
                {searchQuery || statusFilter !== 'all' || dateFilter !== 'all'
                  ? "Try adjusting your filters to see more expenses."
                  : "Get started by adding your first expense."}
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {expenses.map((expense) => {
              const category = getCategoryInfo(expense.category);
              const CategoryIcon = category ? iconMap[category.icon] || Package : Package;
              
              return (
                <Card key={expense.id} className="hover:bg-muted/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: category?.color + '20', color: category?.color }}
                        >
                          <CategoryIcon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground">{expense.description}</h3>
                            <Badge className={getStatusColor(expense.status)}>
                              {expense.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                            {expense.vendor && (
                              <span className="flex items-center gap-1">
                                <Building2 className="w-3 h-3" />
                                {expense.vendor}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(expense.date, 'MMM dd, yyyy')}
                            </span>
                            {category && (
                              <span className="flex items-center gap-1">
                                <CategoryIcon className="w-3 h-3" />
                                {category.name}
                              </span>
                            )}
                          </div>
                          {expense.tags.length > 0 && (
                            <div className="flex items-center gap-2 flex-wrap">
                              {expense.tags.map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-2xl font-bold text-foreground">
                              {formatCurrency(expense.amount, expense.currency)}
                            </p>
                            {expense.type === 'business' && expense.businessId && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {businesses.find(b => b.id === expense.businessId)?.data.title || 'Business'}
                              </p>
                            )}
                            {expense.type === 'project' && expense.projectId && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {projects.find(p => p.id === expense.projectId)?.data.title || 'Project'}
                              </p>
                            )}
                          </div>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-48 p-2">
                              <div className="space-y-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full justify-start"
                                  onClick={() => openEditDialog(expense)}
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="w-full justify-start text-red-500 hover:text-red-600"
                                  onClick={() => handleDeleteExpense(expense.id)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </Button>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Expense Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Expense</DialogTitle>
            <DialogDescription>
              Track your {selectedType} expenses and keep your finances organized.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Type</label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as any })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Category *</label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => {
                      const Icon = iconMap[cat.icon] || Package;
                      return (
                        <SelectItem key={cat.id} value={cat.id}>
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" style={{ color: cat.color }} />
                            <span>{cat.name}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.type === 'business' && businesses.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">Business</label>
                <Select value={formData.businessId} onValueChange={(v) => setFormData({ ...formData, businessId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select business" />
                  </SelectTrigger>
                  <SelectContent>
                    {businesses.map(business => (
                      <SelectItem key={business.id} value={business.id}>
                        {business.data.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.type === 'project' && projects.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">Project</label>
                <Select value={formData.projectId} onValueChange={(v) => setFormData({ ...formData, projectId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map(project => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.data.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Amount *</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Currency</label>
                <Select value={formData.currency} onValueChange={(v) => setFormData({ ...formData, currency: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="CAD">CAD (C$)</SelectItem>
                    <SelectItem value="AUD">AUD (A$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Description *</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter expense description..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Vendor</label>
                <Input
                  value={formData.vendor}
                  onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                  placeholder="Vendor name"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <Calendar className="mr-2 h-4 w-4" />
                      {format(formData.date, 'PPP')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={formData.date}
                      onSelect={(date: Date | undefined) => {
                        if (date) {
                          setFormData({ ...formData, date });
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as any })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddExpense}>
                Add Expense
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Expense Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
            <DialogDescription>
              Update expense details and status.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Type</label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as any })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Category *</label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => {
                      const Icon = iconMap[cat.icon] || Package;
                      return (
                        <SelectItem key={cat.id} value={cat.id}>
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" style={{ color: cat.color }} />
                            <span>{cat.name}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.type === 'business' && businesses.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">Business</label>
                <Select value={formData.businessId} onValueChange={(v) => setFormData({ ...formData, businessId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select business" />
                  </SelectTrigger>
                  <SelectContent>
                    {businesses.map(business => (
                      <SelectItem key={business.id} value={business.id}>
                        {business.data.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.type === 'project' && projects.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">Project</label>
                <Select value={formData.projectId} onValueChange={(v) => setFormData({ ...formData, projectId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map(project => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.data.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Amount *</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Currency</label>
                <Select value={formData.currency} onValueChange={(v) => setFormData({ ...formData, currency: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="CAD">CAD (C$)</SelectItem>
                    <SelectItem value="AUD">AUD (A$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Description *</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter expense description..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Vendor</label>
                <Input
                  value={formData.vendor}
                  onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                  placeholder="Vendor name"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <Calendar className="mr-2 h-4 w-4" />
                      {format(formData.date, 'PPP')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={formData.date}
                      onSelect={(date: Date | undefined) => {
                        if (date) {
                          setFormData({ ...formData, date });
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as any })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => {
                setIsEditDialogOpen(false);
                setSelectedExpense(null);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button onClick={handleEditExpense}>
                Update Expense
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

