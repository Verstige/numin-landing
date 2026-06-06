import React, { useState } from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Building2, Target, CheckSquare, Flag, FileText, Users } from 'lucide-react';

interface MobileElementCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onElementCreate: (element: any) => void;
}

const MobileElementCreator: React.FC<MobileElementCreatorProps> = ({ 
  isOpen, 
  onClose, 
  onElementCreate 
}) => {
  const [selectedType, setSelectedType] = useState<string>('');
  const [elementData, setElementData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'planning'
  });

  const elementTypes = [
    { type: 'business', icon: Building2, label: 'Business', color: 'blue', description: 'Main business entity' },
    { type: 'project', icon: Target, label: 'Project', color: 'red', description: 'Project or initiative' },
    { type: 'task', icon: CheckSquare, label: 'Task', color: 'green', description: 'Action item' },
    { type: 'milestone', icon: Flag, label: 'Milestone', color: 'purple', description: 'Key achievement' },
    { type: 'resource', icon: FileText, label: 'Resource', color: 'orange', description: 'Document or tool' },
    { type: 'team', icon: Users, label: 'Team', color: 'orange', description: 'Team member' }
  ];

  const handleSubmit = () => {
    if (!selectedType || !elementData.title.trim()) return;
    
    onElementCreate({
      type: selectedType,
      title: elementData.title,
      description: elementData.description,
      priority: elementData.priority,
      status: elementData.status
    });
    
    // Reset form
    setSelectedType('');
    setElementData({
      title: '',
      description: '',
      priority: 'medium',
      status: 'planning'
    });
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-xl">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Create New Element</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Element Type Selection */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Choose Element Type</h3>
            <div className="grid grid-cols-2 gap-3">
              {elementTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedType === type.type;
                return (
                  <button
                    key={type.type}
                    onClick={() => setSelectedType(type.type)}
                    className={`p-4 rounded-lg border-2 transition-all touch-manipulation active:scale-95 ${
                      isSelected 
                        ? `border-${type.color}-500 bg-${type.color}-50` 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className={`w-10 h-10 rounded-lg bg-${type.color}-100 flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 text-${type.color}-600`} />
                      </div>
                      <span className="text-sm font-medium">{type.label}</span>
                      <span className="text-xs text-muted-foreground text-center">{type.description}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Element Form */}
          {selectedType && (
            <div className="flex-1 overflow-y-auto space-y-4">
              <div>
                <Label htmlFor="element-title">Title *</Label>
                <Input
                  id="element-title"
                  value={elementData.title}
                  onChange={(e) => setElementData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder={`Enter ${elementTypes.find(t => t.type === selectedType)?.label.toLowerCase()} title`}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="element-description">Description</Label>
                <Textarea
                  id="element-description"
                  value={elementData.description}
                  onChange={(e) => setElementData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder={`Describe this ${elementTypes.find(t => t.type === selectedType)?.label.toLowerCase()}`}
                  className="mt-1 min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="element-priority">Priority</Label>
                  <Select 
                    value={elementData.priority} 
                    onValueChange={(value) => setElementData(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="element-status">Status</Label>
                  <Select 
                    value={elementData.status} 
                    onValueChange={(value) => setElementData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <Button 
                  onClick={handleSubmit}
                  disabled={!elementData.title.trim()}
                  className="w-full"
                >
                  Create {elementTypes.find(t => t.type === selectedType)?.label}
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileElementCreator;
