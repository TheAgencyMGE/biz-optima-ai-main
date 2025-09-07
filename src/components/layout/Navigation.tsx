import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Brain, 
  TrendingUp, 
  Target, 
  Globe, 
  Settings,
  Menu,
  X,
  Home,
  Database,
  Upload
} from 'lucide-react';

interface NavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const navigationItems = [
  {
    id: 'dashboard',
    label: 'Business Dashboard',
    icon: BarChart3,
    description: 'Real-time business intelligence and KPIs',
    badge: 'Live'
  },
  {
    id: 'data',
    label: 'Data Management',
    icon: Database,
    description: 'Import and manage your business data',
    badge: 'Essential'
  },
  {
    id: 'consultant',
    label: 'AI Business Consultant',
    icon: Brain,
    description: 'Strategic business advice powered by AI',
    badge: 'AI'
  },
  {
    id: 'financial',
    label: 'Financial Analysis',
    icon: TrendingUp,
    description: 'Financial modeling and forecasting',
    badge: 'Advanced'
  },
  {
    id: 'market',
    label: 'Market Intelligence',
    icon: Globe,
    description: 'Market analysis and competitive intelligence',
    badge: 'Pro'
  },
  {
    id: 'operations',
    label: 'Operations Optimizer',
    icon: Settings,
    description: 'Process efficiency and productivity analysis',
    badge: 'Smart'
  }
];

export const Navigation: React.FC<NavigationProps> = ({ 
  activeSection, 
  onSectionChange 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const NavItem = ({ item }: { item: typeof navigationItems[0] }) => {
    const Icon = item.icon;
    const isActive = activeSection === item.id;
    
    return (
      <Button
        variant={isActive ? "default" : "ghost"}
        className={`w-full justify-start h-auto p-4 ${
          isActive 
            ? 'bg-gradient-primary text-white shadow-md' 
            : 'hover:bg-accent hover:text-accent-foreground'
        }`}
        onClick={() => {
          onSectionChange(item.id);
          setIsMobileMenuOpen(false);
        }}
      >
        <div className="flex items-center space-x-3 w-full">
          <Icon className="h-5 w-5 flex-shrink-0" />
          <div className="flex-1 text-left">
            <div className="flex items-center justify-between">
              <span className="font-medium">{item.label}</span>
              <Badge 
                variant={isActive ? "secondary" : "outline"} 
                className="text-xs"
              >
                {item.badge}
              </Badge>
            </div>
            <p className="text-xs text-left opacity-75 mt-1">
              {item.description}
            </p>
          </div>
        </div>
      </Button>
    );
  };

  return (
    <>
      {/* Mobile Menu Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-card shadow-md"
        >
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-80 bg-card border-r border-border p-6 space-y-6">
        <div className="space-y-4">
          {/* Logo/Brand */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-3">
              <div className="p-3 bg-gradient-primary rounded-xl">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground">BizOptima AI</h1>
            <p className="text-sm text-muted-foreground">
              Intelligent Business Operations Platform
            </p>
          </div>

          {/* Navigation Items */}
          <div className="space-y-2">
            {navigationItems.map((item) => (
              <NavItem key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-auto pt-6 border-t border-border">
          <Card className="p-4 bg-gradient-accent">
            <div className="text-center space-y-2">
              <Brain className="h-6 w-6 text-primary mx-auto" />
              <h3 className="font-semibold text-sm">AI-Powered Insights</h3>
              <p className="text-xs text-muted-foreground">
                Enterprise-grade business intelligence accessible to all
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm">
          <div className="fixed left-0 top-0 h-full w-80 bg-card border-r border-border p-6 space-y-6 shadow-xl">
            <div className="space-y-4">
              {/* Logo/Brand */}
              <div className="text-center">
                <div className="flex items-center justify-center mb-3">
                  <div className="p-3 bg-gradient-primary rounded-xl">
                    <BarChart3 className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-foreground">BizOptima AI</h1>
                <p className="text-sm text-muted-foreground">
                  Intelligent Business Operations Platform
                </p>
              </div>

              {/* Navigation Items */}
              <div className="space-y-2">
                {navigationItems.map((item) => (
                  <NavItem key={item.id} item={item} />
                ))}
              </div>
            </div>

            {/* Footer Info */}
            <div className="mt-auto pt-6 border-t border-border">
              <Card className="p-4 bg-gradient-accent">
                <div className="text-center space-y-2">
                  <Brain className="h-6 w-6 text-primary mx-auto" />
                  <h3 className="font-semibold text-sm">AI-Powered Insights</h3>
                  <p className="text-xs text-muted-foreground">
                    Enterprise-grade business intelligence accessible to all
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}
    </>
  );
};