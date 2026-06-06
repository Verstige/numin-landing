import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Building2, Target, Users, MapPin, Globe, TrendingUp } from 'lucide-react';

interface Business {
  id: string;
  name: string;
  description: string;
  status: string;
  priority: "low" | "medium" | "high";
  location?: string;
  website?: string;
  industry?: string;
  businessStage?: string;
  revenue?: string;
  employees?: string;
}

interface BusinessSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBusiness: (business: Business) => void;
  onCreateBusiness: (business: Omit<Business, 'id'>) => void;
  businesses: Business[];
  selectedBusiness?: Business | null;
}

export default function BusinessSelector({
  isOpen,
  onClose,
  onSelectBusiness,
  onCreateBusiness,
  businesses,
  selectedBusiness
}: BusinessSelectorProps) {
  const [isCreatingBusiness, setIsCreatingBusiness] = useState(false);
  const [newBusiness, setNewBusiness] = useState({
    name: '',
    description: '',
    status: 'planning',
    priority: 'medium' as const,
    location: '',
    website: '',
    industry: '',
    businessStage: '',
    revenue: '',
    employees: ''
  });

  const handleCreateBusiness = () => {
    if (newBusiness.name.trim()) {
      onCreateBusiness(newBusiness);
      setNewBusiness({
        name: '',
        description: '',
        status: 'planning',
        priority: 'medium',
        location: '',
        website: '',
        industry: '',
        businessStage: '',
        revenue: '',
        employees: ''
      });
      setIsCreatingBusiness(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-500';
      case 'planning': return 'bg-blue-500';
      case 'paused': return 'bg-yellow-500';
      case 'completed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Business Context</DialogTitle>
          <DialogDescription>
            Choose which business you want to work with, or create a new one
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Create New Business Button */}
          <div className="flex justify-end">
            <Button
              onClick={() => setIsCreatingBusiness(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create New Business
            </Button>
          </div>

          {/* Business Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {businesses.map((business) => (
              <Card
                key={business.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedBusiness?.id === business.id
                    ? 'ring-2 ring-blue-500 bg-blue-50'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => onSelectBusiness(business)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-blue-600" />
                      <CardTitle className="text-lg">{business.name}</CardTitle>
                    </div>
                    <div className="flex gap-1">
                      <Badge className={`${getStatusColor(business.status)} text-white text-xs`}>
                        {business.status}
                      </Badge>
                      <Badge className={`${getPriorityColor(business.priority)} text-white text-xs`}>
                        {business.priority}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {business.description}
                  </p>
                  
                  <div className="space-y-2">
                    {business.location && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />
                        <span>{business.location}</span>
                      </div>
                    )}
                    {business.website && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Globe className="w-3 h-3" />
                        <span className="truncate">{business.website}</span>
                      </div>
                    )}
                    {business.industry && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <TrendingUp className="w-3 h-3" />
                        <span>{business.industry}</span>
                      </div>
                    )}
                    {business.employees && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Users className="w-3 h-3" />
                        <span>{business.employees} employees</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Create Business Modal */}
          <Dialog open={isCreatingBusiness} onOpenChange={setIsCreatingBusiness}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Business</DialogTitle>
                <DialogDescription>
                  Fill in the details to create a new business
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                  <div>
                    <Label htmlFor="business-name">Business Name</Label>
                    <Input
                      id="business-name"
                      value={newBusiness.name}
                      onChange={(e) => setNewBusiness({ ...newBusiness, name: e.target.value })}
                      placeholder="Enter business name"
                      className="bg-secondary border-border"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="business-description">Description</Label>
                    <Textarea
                      id="business-description"
                      value={newBusiness.description}
                      onChange={(e) => setNewBusiness({ ...newBusiness, description: e.target.value })}
                      placeholder="Brief description of your business"
                      className="bg-secondary border-border"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="business-status">Status</Label>
                      <Select
                        value={newBusiness.status}
                        onValueChange={(value) => setNewBusiness({ ...newBusiness, status: value })}
                      >
                        <SelectTrigger className="bg-secondary border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="planning">Planning</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="paused">Paused</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="business-priority">Priority</Label>
                      <Select
                        value={newBusiness.priority}
                        onValueChange={(value: "low" | "medium" | "high") => setNewBusiness({ ...newBusiness, priority: value })}
                      >
                        <SelectTrigger className="bg-secondary border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="business-location">Location</Label>
                      <Input
                        id="business-location"
                        value={newBusiness.location}
                        onChange={(e) => setNewBusiness({ ...newBusiness, location: e.target.value })}
                        placeholder="City, Country"
                        className="bg-secondary border-border"
                      />
                    </div>

                    <div>
                      <Label htmlFor="business-website">Website</Label>
                      <Input
                        id="business-website"
                        value={newBusiness.website}
                        onChange={(e) => setNewBusiness({ ...newBusiness, website: e.target.value })}
                        placeholder="https://example.com"
                        className="bg-secondary border-border"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="business-industry">Industry</Label>
                      <Input
                        id="business-industry"
                        value={newBusiness.industry}
                        onChange={(e) => setNewBusiness({ ...newBusiness, industry: e.target.value })}
                        placeholder="e.g., Technology, Healthcare"
                        className="bg-secondary border-border"
                      />
                    </div>

                    <div>
                      <Label htmlFor="business-stage">Business Stage</Label>
                      <Select
                        value={newBusiness.businessStage}
                        onValueChange={(value) => setNewBusiness({ ...newBusiness, businessStage: value })}
                      >
                        <SelectTrigger className="bg-secondary border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="startup">Startup</SelectItem>
                          <SelectItem value="growth">Growth</SelectItem>
                          <SelectItem value="mature">Mature</SelectItem>
                          <SelectItem value="enterprise">Enterprise</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setIsCreatingBusiness(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateBusiness}
                      disabled={!newBusiness.name.trim()}
                    >
                      Business
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
        </div>
      </DialogContent>
    </Dialog>
  );
}
