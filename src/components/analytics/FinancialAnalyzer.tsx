import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Calculator,
  PieChart,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  Target,
  Activity,
  Database
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, ComposedChart, Area, AreaChart } from 'recharts';
import { bizOptimaAI, type FinancialMetrics, type BusinessAnalysis } from '@/services/bizOptimaAI';
import { dataManager, type FinancialRecord } from '@/services/dataManager';

const CHART_COLORS = {
  primary: 'hsl(var(--chart-primary))',
  secondary: 'hsl(var(--chart-secondary))',
  tertiary: 'hsl(var(--chart-tertiary))',
  quaternary: 'hsl(var(--chart-quaternary))',
  quinary: 'hsl(var(--chart-quinary))',
};

export const FinancialAnalyzer: React.FC = () => {
  const [financialData, setFinancialData] = useState<FinancialMetrics>(
    dataManager.getFinancialMetrics() || {
      revenue: 0,
      costs: 0,
      grossProfit: 0,
      netProfit: 0,
      assets: 0,
      liabilities: 0,
      equity: 0,
      cashFlow: 0,
      expenses: 0
    }
  );

  const [analysis, setAnalysis] = useState<BusinessAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasData, setHasData] = useState(false);

  const businessData = dataManager.getBusinessData();
  const financialRecords = dataManager.getFinancialRecords();

  useEffect(() => {
    const realData = dataManager.getFinancialMetrics();
    if (realData) {
      setFinancialData(realData);
      setHasData(true);
    } else {
      setHasData(false);
    }
  }, [businessData, financialRecords]);

  const calculateRatios = () => {
    if (!hasData || financialData.revenue === 0) {
      return {
        profitMargin: 0,
        grossMargin: 0,
        liquidityRatio: 0,
        debtToEquity: 0,
        roi: 0,
        currentRatio: 0,
        cashFlowRatio: 0
      };
    }

    return {
      profitMargin: (financialData.netProfit / financialData.revenue) * 100,
      grossMargin: (financialData.grossProfit / financialData.revenue) * 100,
      liquidityRatio: financialData.liabilities > 0 ? financialData.assets / financialData.liabilities : 0,
      debtToEquity: financialData.equity > 0 ? financialData.liabilities / financialData.equity : 0,
      roi: financialData.assets > 0 ? (financialData.netProfit / financialData.assets) * 100 : 0,
      currentRatio: financialData.liabilities > 0 ? financialData.assets / financialData.liabilities : 0,
      cashFlowRatio: financialData.revenue > 0 ? financialData.cashFlow / financialData.revenue * 100 : 0
    };
  };

  const runFinancialAnalysis = async () => {
    if (!hasData) {
      alert('Please add your business data first');
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await bizOptimaAI.analyzeFinancialData(financialData);
      setAnalysis(result);
    } catch (error) {
      console.error('Financial analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateChartData = () => {
    if (financialRecords.length === 0) return { cashFlowData: [], profitabilityData: [], expenseBreakdown: [] };

    // Generate cash flow data from records
    const cashFlowData = financialRecords.slice(-6).map(record => {
      const date = new Date(record.date);
      return {
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        operating: record.profit > 0 ? record.profit * 0.8 : record.profit,
        investing: record.revenue * -0.05, // Simplified investing outflow
        financing: record.revenue * 0.02, // Simplified financing inflow
        net: record.cashFlow
      };
    });

    // Generate profitability trends
    const profitabilityData = financialRecords.slice(-6).map((record, index) => {
      const date = new Date(record.date);
      const quarter = `Q${Math.floor(date.getMonth() / 3) + 1} ${date.getFullYear()}`;
      const margin = record.revenue > 0 ? (record.profit / record.revenue * 100) : 0;
      
      return {
        quarter,
        revenue: record.revenue,
        grossProfit: record.revenue - record.expenses,
        netProfit: record.profit,
        margin: Math.round(margin)
      };
    });

    // Generate expense breakdown (simplified)
    const totalExpenses = financialData.expenses;
    const expenseBreakdown = [
      { category: 'Operations', amount: totalExpenses * 0.4, percentage: 40, color: CHART_COLORS.primary },
      { category: 'Salaries', amount: totalExpenses * 0.35, percentage: 35, color: CHART_COLORS.secondary },
      { category: 'Marketing', amount: totalExpenses * 0.15, percentage: 15, color: CHART_COLORS.tertiary },
      { category: 'Technology', amount: totalExpenses * 0.07, percentage: 7, color: CHART_COLORS.quaternary },
      { category: 'Other', amount: totalExpenses * 0.03, percentage: 3, color: CHART_COLORS.quinary },
    ];

    return { cashFlowData, profitabilityData, expenseBreakdown };
  };

  const ratios = calculateRatios();
  const { cashFlowData, profitabilityData, expenseBreakdown } = generateChartData();

  if (!hasData) {
    return (
      <div className="p-6 space-y-6 bg-background min-h-screen">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Financial Analysis</h1>
            <p className="text-muted-foreground mt-1">
              Advanced financial modeling and insights
            </p>
          </div>
        </div>

        <Card className="border-dashed border-2 border-muted-foreground/25">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Database className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Financial Data Available</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              To perform financial analysis, please add your business data and financial records first.
            </p>
          </CardContent>
        </Card>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Go to <strong>Data Management</strong> to add your company information and financial records 
            to unlock comprehensive financial analysis and AI-powered insights.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const FinancialMetricCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    trend = 'up',
    format = 'currency'
  }: {
    title: string;
    value: number;
    change: number;
    icon: React.ElementType;
    trend?: 'up' | 'down';
    format?: 'currency' | 'percentage' | 'ratio';
  }) => {
    const formatValue = (val: number) => {
      switch (format) {
        case 'currency':
          return `$${val.toLocaleString()}`;
        case 'percentage':
          return `${val.toFixed(1)}%`;
        case 'ratio':
          return val.toFixed(2);
        default:
          return val.toLocaleString();
      }
    };

    return (
      <Card className="metric-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground font-medium">{title}</p>
              <h3 className="text-2xl font-bold mt-1">{formatValue(value)}</h3>
              <div className="flex items-center mt-2">
                {trend === 'up' ? (
                  <TrendingUp className="h-4 w-4 text-success mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-destructive mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  trend === 'up' ? 'text-success' : 'text-destructive'
                }`}>
                  {change > 0 ? '+' : ''}{change.toFixed(1)}%
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
  };

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Financial Analysis Center</h1>
            <p className="text-xl text-muted-foreground mt-1">
              Comprehensive financial modeling and business intelligence
            </p>
          </div>
          <Button 
            onClick={runFinancialAnalysis}
            disabled={isAnalyzing}
            className="bg-gradient-primary hover:bg-primary-hover"
          >
            {isAnalyzing ? (
              <>
                <Activity className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Calculator className="h-4 w-4 mr-2" />
                Run AI Analysis
              </>
            )}
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="profitability">Profitability</TabsTrigger>
            <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
            <TabsTrigger value="ratios">Financial Ratios</TabsTrigger>
            <TabsTrigger value="input">Data Input</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Financial Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FinancialMetricCard
                title="Total Revenue"
                value={financialData.revenue}
                change={12.3}
                icon={DollarSign}
                trend="up"
                format="currency"
              />
              <FinancialMetricCard
                title="Net Profit"
                value={financialData.netProfit}
                change={8.7}
                icon={TrendingUp}
                trend="up"
                format="currency"
              />
              <FinancialMetricCard
                title="Profit Margin"
                value={ratios.profitMargin}
                change={2.1}
                icon={Target}
                trend="up"
                format="percentage"
              />
              <FinancialMetricCard
                title="Cash Flow"
                value={financialData.cashFlow}
                change={15.4}
                icon={Activity}
                trend="up"
                format="currency"
              />
            </div>

            {/* Revenue & Profit Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="executive-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                    Revenue & Profitability Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={profitabilityData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="quarter" />
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
                      <Bar dataKey="revenue" fill={CHART_COLORS.primary} name="Revenue" />
                      <Line 
                        type="monotone" 
                        dataKey="netProfit" 
                        stroke={CHART_COLORS.secondary} 
                        strokeWidth={3}
                        name="Net Profit"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="executive-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="h-5 w-5 mr-2 text-primary" />
                    Expense Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <RechartsPieChart data={expenseBreakdown}>
                        {expenseBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </RechartsPieChart>
                      <Tooltip 
                        formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {expenseBreakdown.map((item, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-xs text-muted-foreground">
                          {item.category}: {item.percentage}%
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Analysis Results */}
            {analysis && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="executive-card">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CheckCircle2 className="h-5 w-5 mr-2 text-success" />
                      Financial Health Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center space-y-4">
                      <div className="text-4xl font-bold text-primary">
                        {Math.round(analysis.overallHealth)}/100
                      </div>
                      <Progress value={analysis.overallHealth} className="h-3" />
                      <p className="text-sm text-muted-foreground">
                        {analysis.overallHealth >= 80 ? 'Excellent' : 
                         analysis.overallHealth >= 60 ? 'Good' : 
                         analysis.overallHealth >= 40 ? 'Fair' : 'Needs Improvement'} 
                        financial health
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="executive-card">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="h-5 w-5 mr-2 text-primary" />
                      Key Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analysis.insights.slice(0, 3).map((insight, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <p className="text-sm text-foreground">{insight}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="executive-card">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2 text-warning" />
                      Priority Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analysis.recommendations.slice(0, 2).map((rec, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Badge variant={rec.priority === 'high' ? 'destructive' : 'default'}>
                              {rec.priority.toUpperCase()}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{rec.timeline}</span>
                          </div>
                          <p className="text-sm font-medium">{rec.action}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Profitability Tab */}
          <TabsContent value="profitability" className="space-y-6">
            <Card className="executive-card">
              <CardHeader>
                <CardTitle>Profitability Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={profitabilityData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="quarter" />
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
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stackId="1"
                      stroke={CHART_COLORS.primary} 
                      fill={CHART_COLORS.primary}
                      fillOpacity={0.6}
                      name="Revenue"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="grossProfit" 
                      stackId="2"
                      stroke={CHART_COLORS.secondary} 
                      fill={CHART_COLORS.secondary}
                      fillOpacity={0.6}
                      name="Gross Profit"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="netProfit" 
                      stackId="3"
                      stroke={CHART_COLORS.tertiary} 
                      fill={CHART_COLORS.tertiary}
                      fillOpacity={0.6}
                      name="Net Profit"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cash Flow Tab */}
          <TabsContent value="cashflow" className="space-y-6">
            <Card className="executive-card">
              <CardHeader>
                <CardTitle>Cash Flow Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={cashFlowData}>
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
                    <Bar dataKey="operating" fill={CHART_COLORS.primary} name="Operating" />
                    <Bar dataKey="investing" fill={CHART_COLORS.secondary} name="Investing" />
                    <Bar dataKey="financing" fill={CHART_COLORS.tertiary} name="Financing" />
                    <Line 
                      type="monotone" 
                      dataKey="net" 
                      stroke={CHART_COLORS.quaternary} 
                      strokeWidth={3}
                      name="Net Cash Flow"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financial Ratios Tab */}
          <TabsContent value="ratios" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(ratios).map(([key, value]) => (
                <Card key={key} className="metric-card">
                  <CardContent className="p-6 text-center">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </h3>
                    <p className="text-3xl font-bold text-primary">
                      {typeof value === 'number' ? value.toFixed(2) : value}
                      {key.includes('Margin') || key.includes('roi') ? '%' : ''}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {value >= 20 && key.includes('Margin') ? 'Excellent' :
                       value >= 10 && key.includes('Margin') ? 'Good' :
                       value >= 5 && key.includes('Margin') ? 'Fair' : 'Below Average'}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Data Input Tab */}
          <TabsContent value="input" className="space-y-6">
            <Card className="executive-card">
              <CardHeader>
                <CardTitle>Financial Data Input</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="revenue">Total Revenue ($)</Label>
                      <Input
                        id="revenue"
                        type="number"
                        value={financialData.revenue}
                        onChange={(e) => setFinancialData(prev => ({
                          ...prev,
                          revenue: Number(e.target.value)
                        }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="costs">Total Costs ($)</Label>
                      <Input
                        id="costs"
                        type="number"
                        value={financialData.costs}
                        onChange={(e) => setFinancialData(prev => ({
                          ...prev,
                          costs: Number(e.target.value)
                        }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="assets">Total Assets ($)</Label>
                      <Input
                        id="assets"
                        type="number"
                        value={financialData.assets}
                        onChange={(e) => setFinancialData(prev => ({
                          ...prev,
                          assets: Number(e.target.value)
                        }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="liabilities">Total Liabilities ($)</Label>
                      <Input
                        id="liabilities"
                        type="number"
                        value={financialData.liabilities}
                        onChange={(e) => setFinancialData(prev => ({
                          ...prev,
                          liabilities: Number(e.target.value)
                        }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="equity">Total Equity ($)</Label>
                      <Input
                        id="equity"
                        type="number"
                        value={financialData.equity}
                        onChange={(e) => setFinancialData(prev => ({
                          ...prev,
                          equity: Number(e.target.value)
                        }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cashFlow">Cash Flow ($)</Label>
                      <Input
                        id="cashFlow"
                        type="number"
                        value={financialData.cashFlow}
                        onChange={(e) => setFinancialData(prev => ({
                          ...prev,
                          cashFlow: Number(e.target.value)
                        }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="grossProfit">Gross Profit ($)</Label>
                      <Input
                        id="grossProfit"
                        type="number"
                        value={financialData.grossProfit}
                        onChange={(e) => setFinancialData(prev => ({
                          ...prev,
                          grossProfit: Number(e.target.value)
                        }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="netProfit">Net Profit ($)</Label>
                      <Input
                        id="netProfit"
                        type="number"
                        value={financialData.netProfit}
                        onChange={(e) => setFinancialData(prev => ({
                          ...prev,
                          netProfit: Number(e.target.value)
                        }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <Button 
                    onClick={runFinancialAnalysis}
                    disabled={isAnalyzing}
                    className="w-full bg-gradient-primary hover:bg-primary-hover"
                  >
                    {isAnalyzing ? (
                      <>
                        <Activity className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing Financial Data...
                      </>
                    ) : (
                      <>
                        <Calculator className="h-4 w-4 mr-2" />
                        Analyze Financial Performance
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};