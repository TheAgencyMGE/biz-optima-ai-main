import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  BarChart3, 
  PieChart,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Database,
  Plus
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell } from 'recharts';
import { bizOptimaAI, type BusinessAnalysis, type FinancialMetrics } from '@/services/bizOptimaAI';
import { dataManager, type FinancialRecord } from '@/services/dataManager';

interface BusinessDashboardProps {
  companyName?: string;
  onShowDataInput?: () => void;
}

const CHART_COLORS = {
  primary: 'hsl(var(--chart-primary))',
  secondary: 'hsl(var(--chart-secondary))',
  tertiary: 'hsl(var(--chart-tertiary))',
  quaternary: 'hsl(var(--chart-quaternary))',
  quinary: 'hsl(var(--chart-quinary))',
};

export const BusinessDashboard: React.FC<BusinessDashboardProps> = ({ 
  companyName,
  onShowDataInput
}) => {
  const [analysis, setAnalysis] = useState<BusinessAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastAnalyzed, setLastAnalyzed] = useState<Date | null>(null);
  const [hasData, setHasData] = useState(false);

  const businessData = dataManager.getBusinessData();
  const financialRecords = dataManager.getFinancialRecords();
  const kpiData = dataManager.getKPIData();
  
  const displayCompanyName = businessData?.companyName || companyName || "Your Company";

  // Convert financial records to chart data
  const generatePerformanceData = (records: FinancialRecord[]) => {
    if (records.length === 0) return [];
    
    return records.slice(-12).map(record => ({
      month: new Date(record.date).toLocaleDateString('en-US', { month: 'short' }),
      date: record.date,
      revenue: record.revenue,
      profit: record.profit,
      expenses: record.expenses,
      cashFlow: record.cashFlow
    }));
  };

  const runAnalysis = async () => {
    const financialMetrics = dataManager.getFinancialMetrics();
    if (!financialMetrics) {
      setHasData(false);
      return;
    }

    setIsLoading(true);
    setHasData(true);
    
    try {
      const result = await bizOptimaAI.analyzeFinancialData(financialMetrics);
      setAnalysis(result);
      setLastAnalyzed(new Date());
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runAnalysis();
  }, [businessData, financialRecords]);

  const MetricCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    trend = 'up' 
  }: {
    title: string;
    value: string;
    change: string;
    icon: React.ElementType;
    trend?: 'up' | 'down';
  }) => (
    <Card className="metric-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
            <div className="flex items-center mt-2">
              {trend === 'up' ? (
                <TrendingUp className="h-4 w-4 text-success mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive mr-1" />
              )}
              <span className={`text-sm font-medium ${
                trend === 'up' ? 'text-success' : 'text-destructive'
              }`}>
                {change}
              </span>
            </div>
          </div>
          <div className="p-3 bg-primary/10 rounded-lg">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Calculate metrics from real data
  const getMetrics = () => {
    const financialMetrics = dataManager.getFinancialMetrics();
    if (!financialMetrics || financialRecords.length === 0) {
      return {
        revenue: '$0',
        profitMargin: '0%',
        healthScore: '0/100',
        cashFlow: '$0'
      };
    }

    const latestRecord = financialRecords[financialRecords.length - 1];
    const previousRecord = financialRecords.length > 1 ? financialRecords[financialRecords.length - 2] : null;
    
    const profitMargin = latestRecord.revenue > 0 ? (latestRecord.profit / latestRecord.revenue * 100).toFixed(1) : '0';
    const healthScore = analysis ? Math.round(analysis.overallHealth) : 0;
    
    return {
      revenue: `$${latestRecord.revenue.toLocaleString()}`,
      profitMargin: `${profitMargin}%`,
      healthScore: `${healthScore}/100`,
      cashFlow: `$${latestRecord.cashFlow.toLocaleString()}`,
      revenueChange: previousRecord ? 
        `${((latestRecord.revenue - previousRecord.revenue) / previousRecord.revenue * 100).toFixed(1)}%` : 'N/A',
      profitChange: previousRecord ? 
        `${((latestRecord.profit - previousRecord.profit) / previousRecord.profit * 100).toFixed(1)}%` : 'N/A',
      cashFlowChange: previousRecord ? 
        `${((latestRecord.cashFlow - previousRecord.cashFlow) / previousRecord.cashFlow * 100).toFixed(1)}%` : 'N/A'
    };
  };

  const performanceData = generatePerformanceData(financialRecords);
  const metrics = getMetrics();

  if (!hasData || !businessData) {
    return (
      <div className="p-6 space-y-6 bg-background min-h-screen">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Business Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Get started by adding your business data
            </p>
          </div>
        </div>

        <Card className="border-dashed border-2 border-muted-foreground/25">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Database className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Business Data Found</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              To get AI-powered insights and analytics, you need to input your business data first. 
              Add your company information, financial records, and KPIs to get started.
            </p>
            <Button onClick={onShowDataInput} size="lg">
              <Plus className="h-4 w-4 mr-2" />
              Add Business Data
            </Button>
          </CardContent>
        </Card>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Getting Started:</strong> Upload your financial data via Excel/CSV files or manually enter 
            your company information to unlock powerful AI-driven business insights, financial analysis, 
            and strategic recommendations.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {companyName} Business Intelligence
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time business performance and strategic insights
          </p>
          {lastAnalyzed && (
            <p className="text-sm text-muted-foreground flex items-center mt-2">
              <Clock className="h-4 w-4 mr-1" />
              Last analyzed: {lastAnalyzed.toLocaleString()}
            </p>
          )}
        </div>
        <Button 
          onClick={runAnalysis} 
          disabled={isLoading}
          className="bg-gradient-primary hover:bg-primary-hover"
        >
          {isLoading ? (
            <>
              <Activity className="h-4 w-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <BarChart3 className="h-4 w-4 mr-2" />
              Refresh Analysis
            </>
          )}
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Latest Revenue"
          value={metrics.revenue}
          change={metrics.revenueChange}
          icon={DollarSign}
          trend={metrics.revenueChange.startsWith('+') ? 'up' : 'down'}
        />
        <MetricCard
          title="Profit Margin"
          value={metrics.profitMargin}
          change={metrics.profitChange}
          icon={TrendingUp}
          trend={metrics.profitChange.startsWith('+') ? 'up' : 'down'}
        />
        <MetricCard
          title="Business Health Score"
          value={metrics.healthScore}
          change={analysis ? '+5 points' : 'Analyzing...'}
          icon={Target}
          trend="up"
        />
        <MetricCard
          title="Cash Flow"
          value={metrics.cashFlow}
          change={metrics.cashFlowChange}
          icon={Activity}
          trend={metrics.cashFlowChange.startsWith('+') ? 'up' : 'down'}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card className="executive-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-primary" />
              Revenue & Profit Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            {performanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke={CHART_COLORS.primary} 
                    strokeWidth={3}
                    name="Revenue"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="profit" 
                    stroke={CHART_COLORS.secondary} 
                    strokeWidth={3}
                    name="Profit"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No financial data available</p>
                  <p className="text-sm">Add financial records to see trends</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* KPI Performance */}
        <Card className="executive-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="h-5 w-5 mr-2 text-primary" />
              Key Performance Indicators
            </CardTitle>
          </CardHeader>
          <CardContent>
            {kpiData.length > 0 ? (
              <div className="space-y-4">
                {kpiData.slice(0, 4).map((kpi, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{kpi.metric}</span>
                      <span className="text-sm text-muted-foreground">
                        {kpi.value}{kpi.unit} / {kpi.target}{kpi.unit}
                      </span>
                    </div>
                    <Progress 
                      value={kpi.target > 0 ? Math.min(100, (kpi.value / kpi.target) * 100) : 0} 
                      className="h-2" 
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center">
                  <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No KPIs configured</p>
                  <p className="text-sm">Add KPIs to track performance</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      {analysis && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Key Insights */}
          <Card className="executive-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle2 className="h-5 w-5 mr-2 text-success" />
                Key Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.insights.map((insight, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <p className="text-sm text-foreground">{insight}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card className="executive-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2 text-primary" />
                Strategic Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.recommendations.map((rec, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant={
                        rec.priority === 'high' ? 'destructive' : 
                        rec.priority === 'medium' ? 'default' : 'secondary'
                      }>
                        {rec.priority.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{rec.timeline}</span>
                    </div>
                    <h4 className="font-medium text-sm">{rec.action}</h4>
                    <p className="text-xs text-muted-foreground">{rec.impact}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Risk Factors & Opportunities */}
          <Card className="executive-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-warning" />
                Risks & Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-destructive mb-2">Risk Factors</h4>
                  <div className="space-y-2">
                    {analysis.riskFactors.map((risk, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <AlertTriangle className="h-3 w-3 text-destructive mt-1 flex-shrink-0" />
                        <p className="text-xs text-foreground">{risk}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm text-success mb-2">Opportunities</h4>
                  <div className="space-y-2">
                    {analysis.opportunities.map((opportunity, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <CheckCircle2 className="h-3 w-3 text-success mt-1 flex-shrink-0" />
                        <p className="text-xs text-foreground">{opportunity}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Financial Ratios */}
      {analysis && (
        <Card className="executive-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-primary" />
              Financial Ratios Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {Object.entries(analysis.financialRatios).map(([key, value]) => (
                <div key={key} className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    {typeof value === 'number' ? value.toFixed(2) : value}
                    {key.includes('Margin') || key.includes('roi') ? '%' : ''}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};