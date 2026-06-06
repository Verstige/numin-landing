import React from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { X, Building2, Target, CheckSquare, Flag, FileText, Users } from 'lucide-react';

interface MobileElementPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onElementAdd: (elementType: string) => void;
}

const MobileElementPalette: React.FC<MobileElementPaletteProps> = ({ 
  isOpen, 
  onClose, 
  onElementAdd 
}) => {
  const elementTemplates = [
    { 
      type: 'business', 
      icon: Building2, 
      label: 'Business', 
      description: 'Main business entity',
      color: 'blue'
    },
    { 
      type: 'project', 
      icon: Target, 
      label: 'Project', 
      description: 'Project or initiative',
      color: 'red'
    },
    { 
      type: 'task', 
      icon: CheckSquare, 
      label: 'Task', 
      description: 'Action item',
      color: 'green'
    },
    { 
      type: 'milestone', 
      icon: Flag, 
      label: 'Milestone', 
      description: 'Key achievement',
      color: 'purple'
    },
    { 
      type: 'resource', 
      icon: FileText, 
      label: 'Resource', 
      description: 'Document or tool',
      color: 'orange'
    },
    { 
      type: 'team', 
      icon: Users, 
      label: 'Team', 
      description: 'Team member',
      color: 'orange'
    }
  ];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[70vh] rounded-t-xl">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Add Elements</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3 flex-1 overflow-y-auto">
            {elementTemplates.map((template) => {
              const Icon = template.icon;
              return (
                <button
                  key={template.type}
                  onClick={() => {
                    onElementAdd(template.type);
                    onClose();
                  }}
                  className="p-4 rounded-lg border border-border hover:bg-background/50 transition-all text-left touch-manipulation active:scale-95"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg bg-${template.color}-100 flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 text-${template.color}-600`} />
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-sm">{template.label}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {template.description}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="pt-4 border-t border-border">
            <div className="text-sm text-muted-foreground mb-2">Quick Actions</div>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  onElementAdd('business');
                  onClose();
                }}
                className="justify-start"
              >
                <Building2 className="w-4 h-4 mr-2" />
                New Business
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  onElementAdd('project');
                  onClose();
                }}
                className="justify-start"
              >
                <Target className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileElementPalette;
