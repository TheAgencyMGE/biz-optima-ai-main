import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { 
  Settings, 
  TrendingUp, 
  Users,
  Clock,
  Target,
  Zap,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Activity
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line } from 'recharts';
import { bizOptimaAI, type OperationalAnalysis } from '@/services/bizOptimaAI';

const CHART_COLORS = {
  primary: 'hsl(var(--chart-primary))',
  secondary: 'hsl(var(--chart-secondary))',
  tertiary: 'hsl(var(--chart-tertiary))',
  quaternary: 'hsl(var(--chart-quaternary))',
  quinary: 'hsl(var(--chart-quinary))',
};

// Sample operational data
const efficiencyTrends = [
  { month: 'Jan', productivity: 85, quality: 92, satisfaction: 88, efficiency: 87 },
  { month: 'Feb', productivity: 87, quality: 91, satisfaction: 90, efficiency: 89 },
  { month: 'Mar', productivity: 89, quality: 93, satisfaction: 87, efficiency: 90 },
  { month: 'Apr', productivity: 91, quality: 94, satisfaction: 92, efficiency: 92 },
  { month: 'May', productivity: 88, quality: 92, satisfaction: 89, efficiency: 90 },
  { month: 'Jun', productivity: 93, quality: 95, satisfaction: 94, efficiency: 94 },
];

const processMetrics = [
  { process: 'Customer Service', current: 78, target: 90, improvement: 15 },
  { process: 'Order Processing', current: 85, target: 95, improvement: 12 },
  { process: 'Quality Control', current: 92, target: 98, improvement: 7 },
  { process: 'Inventory Management', current: 75, target: 85, improvement: 13 },
  { process: 'Financial Reporting', current: 88, target: 95, improvement: 8 },
  { process: 'HR Operations', current: 82, target: 90, improvement: 10 },
];

const teamProductivity = [
  { department: 'Sales', productivity: 92, utilization: 88, satisfaction: 85 },
  { department: 'Marketing', productivity: 85, utilization: 82, satisfaction: 90 },
  { department: 'Operations', productivity: 88, utilization: 91, satisfaction: 87 },
  { department: 'Finance', productivity: 91, utilization: 85, satisfaction: 88 },
  { department: 'Technology', productivity: 87, utilization: 89, satisfaction: 92 },
  { department: 'HR', productivity: 84, utilization: 80, satisfaction: 89 },
];

export const OperationalAnalyzer: React.FC = () => {
  const [operationalData, setOperationalData] = useState({
    processes: ['Customer Service', 'Order Processing', 'Quality Control', 'Inventory Management'],
    teamSize: 25,
    monthlyOutput: 1500
  });

  const [analysis, setAnalysis] = useState<OperationalAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [newProcess, setNewProcess] = useState('');

  const addProcess = () => {
    if (newProcess.trim() && !operationalData.processes.includes(newProcess.trim())) {
      setOperationalData(prev => ({
        ...prev,
        processes: [...prev.processes, newProcess.trim()]
      }));
      setNewProcess('');
    }
  };

  const removeProcess = (index: number) => {
    setOperationalData(prev => ({
      ...prev,
      processes: prev.processes.filter((_, i) => i !== index)
    }));
  };

  const analyzeOperations = async () => {
    setIsAnalyzing(true);
    try {
      const result = await bizOptimaAI.analyzeOperationalEfficiency(
        operationalData.processes,
        operationalData.teamSize,
        operationalData.monthlyOutput
      );
      setAnalysis(result);
    } catch (error) {
      console.error('Operational analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const MetricCard = ({ 
    title, 
    value, 
    target, 
    icon: Icon,
    unit = '%'
  }: {
    title: string;
    value: number;
    target?: number;
    icon: React.ElementType;
    unit?: string;
  }) => {
    const percentage = target ? (value / target) * 100 : value;
    const status = percentage >= 90 ? 'excellent' : percentage >= 75 ? 'good' : 'needs-improvement';
    
    return (
      <Card className="metric-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground font-medium">{title}</p>
              <h3 className="text-2xl font-bold mt-1">{value}{unit}</h3>
              {target && (
                <div className="mt-2">
                  <Progress value={percentage} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Target: {target}{unit}
                  </p>
                </div>
              )}
              <Badge 
                variant={status === 'excellent' ? 'default' : status === 'good' ? 'secondary' : 'destructive'}
                className="mt-2"
              >
                {status === 'excellent' ? 'Excellent' : status === 'good' ? 'Good' : 'Needs Improvement'}
              </Badge>
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
            <h1 className="text-4xl font-bold text-foreground">Operational Efficiency Center</h1>
            <p className="text-xl text-muted-foreground mt-1">
              Optimize processes, boost productivity, and enhance operational performance
            </p>
          </div>
          <Button 
            onClick={analyzeOperations}
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
                <Settings className="h-4 w-4 mr-2" />
                Analyze Operations
              </>
            )}
          </Button>
        </div>

        {/* Key Operational Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Overall Efficiency"
            value={94}
            target={100}
            icon={Target}
          />
          <MetricCard
            title="Team Productivity"
            value={89}
            target={95}
            icon={Users}
          />
          <MetricCard
            title="Process Quality"
            value={92}
            target={98}
            icon={CheckCircle2}
          />
          <MetricCard
            title="Customer Satisfaction"
            value={87}
            target={90}
            icon={TrendingUp}
          />
        </div>

        {/* Charts and Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Efficiency Trends */}
          <Card className="executive-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                Operational Efficiency Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={efficiencyTrends}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[70, 100]} />
                  <Tooltip 
                    formatter={(value: number) => [`${value}%`, '']}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="productivity" 
                    stroke={CHART_COLORS.primary} 
                    strokeWidth={3}
                    name="Productivity"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="quality" 
                    stroke={CHART_COLORS.secondary} 
                    strokeWidth={3}
                    name="Quality"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="efficiency" 
                    stroke={CHART_COLORS.tertiary} 
                    strokeWidth={3}
                    name="Overall Efficiency"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Process Performance */}
          <Card className="executive-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2 text-primary" />
                Process Performance Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={processMetrics} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="process" type="category" width={120} />
                  <Tooltip 
                    formatter={(value: number) => [`${value}%`, '']}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="current" fill={CHART_COLORS.primary} name="Current Performance" />
                  <Bar dataKey="target" fill={CHART_COLORS.secondary} name="Target Performance" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Team Productivity Radar */}
        <Card className="executive-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-primary" />
              Team Performance Matrix
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={teamProductivity}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="department" />
                  <PolarRadiusAxis angle={90} domain={[70, 100]} tickCount={4} />
                  <Radar
                    name="Productivity"
                    dataKey="productivity"
                    stroke={CHART_COLORS.primary}
                    fill={CHART_COLORS.primary}
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                  <Radar
                    name="Utilization"
                    dataKey="utilization"
                    stroke={CHART_COLORS.secondary}
                    fill={CHART_COLORS.secondary}
                    fillOpacity={0.1}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                  <Tooltip 
                    formatter={(value: number) => [`${value}%`, '']}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground mb-4">Department Performance</h3>
                {teamProductivity.map((dept, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{dept.department}</span>
                      <span className="text-sm text-muted-foreground">
                        {Math.round((dept.productivity + dept.utilization + dept.satisfaction) / 3)}%
                      </span>
                    </div>
                    <Progress 
                      value={(dept.productivity + dept.utilization + dept.satisfaction) / 3} 
                      className="h-2" 
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Productivity: {dept.productivity}%</span>
                      <span>Satisfaction: {dept.satisfaction}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Analysis Results */}
        {analysis && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Efficiency Score */}
            <Card className="executive-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2 text-success" />
                  Efficiency Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="text-4xl font-bold text-primary">
                    {analysis.efficiencyScore}/100
                  </div>
                  <Progress value={analysis.efficiencyScore} className="h-3" />
                  <p className="text-sm text-muted-foreground">
                    {analysis.efficiencyScore >= 90 ? 'Excellent' : 
                     analysis.efficiencyScore >= 75 ? 'Good' : 
                     analysis.efficiencyScore >= 60 ? 'Fair' : 'Needs Improvement'} 
                    operational efficiency
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Bottlenecks */}
            <Card className="executive-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-warning" />
                  Process Bottlenecks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.bottlenecks.map((bottleneck, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <AlertTriangle className="h-4 w-4 text-warning mt-1 flex-shrink-0" />
                      <p className="text-sm text-foreground">{bottleneck}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Automation Opportunities */}
            <Card className="executive-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-primary" />
                  Automation Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.automationOpportunities.map((opportunity, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <Lightbulb className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                      <p className="text-sm text-foreground">{opportunity}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Improvement Recommendations */}
        {analysis && (
          <Card className="executive-card mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle2 className="h-5 w-5 mr-2 text-success" />
                Operational Improvement Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {analysis.improvements.map((improvement, index) => (
                  <div key={index} className="p-4 bg-gradient-accent rounded-lg border">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-foreground">{improvement.area}</h3>
                        <Badge variant="outline">{improvement.expectedGain}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{improvement.suggestion}</p>
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4 text-success" />
                        <span className="text-sm font-medium text-success">
                          Expected Improvement: {improvement.expectedGain}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Configuration Panel */}
        <Card className="executive-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2 text-primary" />
              Operational Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="teamSize">Team Size</Label>
                  <Input
                    id="teamSize"
                    type="number"
                    value={operationalData.teamSize}
                    onChange={(e) => setOperationalData(prev => ({
                      ...prev,
                      teamSize: Number(e.target.value)
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monthlyOutput">Monthly Output (Units/Deliverables)</Label>
                  <Input
                    id="monthlyOutput"
                    type="number"
                    value={operationalData.monthlyOutput}
                    onChange={(e) => setOperationalData(prev => ({
                      ...prev,
                      monthlyOutput: Number(e.target.value)
                    }))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Key Business Processes</Label>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Add a business process..."
                      value={newProcess}
                      onChange={(e) => setNewProcess(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addProcess()}
                    />
                    <Button onClick={addProcess} size="sm">Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {operationalData.processes.map((process, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => removeProcess(index)}
                      >
                        {process} ×
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Button 
                onClick={analyzeOperations}
                disabled={isAnalyzing}
                className="w-full bg-gradient-primary hover:bg-primary-hover"
              >
                {isAnalyzing ? (
                  <>
                    <Activity className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing Operational Efficiency...
                  </>
                ) : (
                  <>
                    <Settings className="h-4 w-4 mr-2" />
                    Run Operational Analysis
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};