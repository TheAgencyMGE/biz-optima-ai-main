import React, { useState } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { BusinessDashboard } from '@/components/analytics/BusinessDashboard';
import { AIBusinessConsultant } from '@/components/strategy/AIBusinessConsultant';
import { MarketAnalyzer } from '@/components/analytics/MarketAnalyzer';
import { FinancialAnalyzer } from '@/components/analytics/FinancialAnalyzer';
import { OperationalAnalyzer } from '@/components/operations/OperationalAnalyzer';
import { DataInput } from '@/components/data/DataInput';

const Index = () => {
  const [activeSection, setActiveSection] = useState('dashboard');

  const handleDataUpdate = () => {
    // Force re-render by updating state
    setActiveSection(prev => prev);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <BusinessDashboard 
            onShowDataInput={() => setActiveSection('data')} 
          />
        );
      case 'data':
        return <DataInput onDataUpdate={handleDataUpdate} />;
      case 'consultant':
        return <AIBusinessConsultant />;
      case 'market':
        return <MarketAnalyzer />;
      case 'financial':
        return <FinancialAnalyzer />;
      case 'operations':
        return <OperationalAnalyzer />;
      default:
        return (
          <BusinessDashboard 
            onShowDataInput={() => setActiveSection('data')} 
          />
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Navigation 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default Index;
