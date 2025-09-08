import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Globe, 
  TrendingUp, 
  Target, 
  Shield, 
  AlertTriangle,
  Search,
  BarChart3,
  PieChart,
  Lightbulb,
  Activity,
  Database
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line } from 'recharts';
import { bizOptimaAI, type MarketAnalysis } from '@/services/bizOptimaAI';
import { dataManager } from '@/services/dataManager';

interface MarketData {
  industry: string;
  targetMarket: string;
  companySize: string;
}

const CHART_COLORS = {
  primary: 'hsl(var(--chart-primary))',
  secondary: 'hsl(var(--chart-secondary))',
  tertiary: 'hsl(var(--chart-tertiary))',
  quaternary: 'hsl(var(--chart-quaternary))',
  quinary: 'hsl(var(--chart-quinary))',
};

export const MarketAnalyzer: React.FC = () => {
  const [marketData, setMarketData] = useState<MarketData>({
    industry: '',
    targetMarket: '',
    companySize: ''
  });
  
  const [analysis, setAnalysis] = useState<MarketAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasBusinessData, setHasBusinessData] = useState(false);

  const businessData = dataManager.getBusinessData();

  useEffect(() => {
    if (businessData) {
      setHasBusinessData(true);
      setMarketData(prev => ({
        ...prev,
        industry: businessData.industry || prev.industry,
        companySize: getCompanySize(businessData.employees)
      }));
    } else {
      setHasBusinessData(false);
    }
  }, [businessData]);

  const getCompanySize = (employees: number): string => {
    if (employees <= 10) return 'Startup (1-10 employees)';
    if (employees <= 50) return 'Small Business (11-50 employees)';
    if (employees <= 200) return 'Medium Business (51-200 employees)';
    if (employees <= 1000) return 'Large Business (201-1000 employees)';
    return 'Enterprise (1000+ employees)';
  };

  const safeGrowthRate = (rate: any): number => {
    if (typeof rate === 'number' && !isNaN(rate)) return rate;
    if (typeof rate === 'string') {
      const parsed = parseFloat(rate);
      return !isNaN(parsed) ? parsed : 0;
    }
    return 0;
  };

  const industryTemplates = [
    { name: 'Technology/SaaS', target: 'Small to Medium Businesses', size: 'Startup (1-50 employees)' },
    { name: 'E-commerce/Retail', target: 'Online Consumers', size: 'Small Business (51-200 employees)' },
    { name: 'Healthcare/Medical', target: 'Healthcare Providers', size: 'Medium Business (201-1000 employees)' },
    { name: 'Financial Services', target: 'Individual Consumers', size: 'Large Enterprise (1000+ employees)' },
    { name: 'Manufacturing', target: 'B2B Companies', size: 'Medium Business (201-1000 employees)' },
    { name: 'Education/Training', target: 'Educational Institutions', size: 'Small Business (51-200 employees)' },
    { name: 'Professional Services', target: 'Business Clients', size: 'Small Business (11-50 employees)' },
    { name: 'Real Estate', target: 'Property Buyers/Sellers', size: 'Small Business (11-50 employees)' },
  ];

  const loadTemplate = (template: typeof industryTemplates[0]) => {
    setMarketData({
      industry: template.name,
      targetMarket: template.target,
      companySize: template.size
    });
  };

  const analyzeMarket = async () => {
    if (!marketData.industry || !marketData.targetMarket || !marketData.companySize) {
      alert('Please fill in all market analysis fields.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await bizOptimaAI.analyzeMarketOpportunity(
        marketData.industry,
        marketData.targetMarket,
        marketData.companySize
      );
      setAnalysis(result);
    } catch (error) {
      console.error('Market analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Generate market trend data based on analysis
  const generateMarketTrendData = () => {
    if (!analysis) return [];
    
    const baseGrowth = analysis.growthRate;
    const quarters = ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024', 'Q1 2025', 'Q2 2025'];
    
    return quarters.map((quarter, index) => ({
      quarter,
      growth: Math.max(0, baseGrowth + (Math.random() - 0.5) * 4),
      competition: Math.min(10, 5 + index * 0.5 + (Math.random() - 0.5) * 2),
      opportunity: Math.max(0, baseGrowth * 0.8 + (Math.random() - 0.5) * 3)
    }));
  };

  // Generate competitive landscape data
  const generateCompetitiveData = () => {
    return [
      { segment: 'Market Leaders', share: 30, companies: 2 },
      { segment: 'Major Players', share: 35, companies: 5 },
      { segment: 'Emerging Competitors', share: 25, companies: 12 },
      { segment: 'Niche Players', share: 10, companies: 20 },
    ];
  };

  // Generate industry analysis radar data
  const generateIndustryAnalysisData = () => {
    if (!analysis) return [];
    
    const baseScore = 70;
    return [
      { factor: 'Market Size', current: baseScore + Math.random() * 20, potential: baseScore + 20 + Math.random() * 10 },
      { factor: 'Growth Rate', current: analysis.growthRate * 5, potential: (analysis.growthRate + 2) * 5 },
      { factor: 'Competition', current: 100 - (analysis.growthRate * 2), potential: 100 - (analysis.growthRate * 2.5) },
      { factor: 'Barriers to Entry', current: 60 + Math.random() * 20, potential: 55 + Math.random() * 15 },
      { factor: 'Technology Adoption', current: 80 + Math.random() * 15, potential: 90 + Math.random() * 10 },
      { factor: 'Customer Demand', current: 75 + Math.random() * 20, potential: 85 + Math.random() * 15 },
    ];
  };

  const marketTrendData = generateMarketTrendData();
  const competitiveData = generateCompetitiveData();
  const industryAnalysisData = generateIndustryAnalysisData();

  if (!hasBusinessData) {
    return (
      <div className="p-6 space-y-6 bg-background min-h-screen">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Market Intelligence</h1>
            <p className="text-muted-foreground mt-1">
              AI-powered market analysis and competitive intelligence
            </p>
          </div>
        </div>

        <Card className="border-dashed border-2 border-muted-foreground/25">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Database className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Business Data Available</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              To perform market analysis, please add your business data first. We'll use your industry 
              and company information to provide targeted market insights.
            </p>
          </CardContent>
        </Card>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Go to <strong>Data Management</strong> to add your company information 
            to unlock AI-powered market analysis and competitive intelligence.
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
          <h1 className="text-3xl font-bold text-foreground">Market Intelligence</h1>
          <p className="text-muted-foreground mt-1">
            AI-powered market analysis and competitive intelligence
          </p>
        </div>
        <Button 
          onClick={analyzeMarket} 
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
              <Search className="h-4 w-4 mr-2" />
              Analyze Market
            </>
          )}
        </Button>
      </div>

      {/* Market Analysis Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2 text-primary" />
            Market Analysis Parameters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                value={marketData.industry}
                onChange={(e) => setMarketData(prev => ({ ...prev, industry: e.target.value }))}
                placeholder="e.g., Technology/SaaS"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="targetMarket">Target Market</Label>
              <Input
                id="targetMarket"
                value={marketData.targetMarket}
                onChange={(e) => setMarketData(prev => ({ ...prev, targetMarket: e.target.value }))}
                placeholder="e.g., Small Businesses"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="companySize">Company Size</Label>
              <Input
                id="companySize"
                value={marketData.companySize}
                onChange={(e) => setMarketData(prev => ({ ...prev, companySize: e.target.value }))}
                placeholder="e.g., Startup (1-50 employees)"
              />
            </div>
          </div>

          {/* Quick Templates */}
          <div className="space-y-2">
            <Label>Quick Templates:</Label>
            <div className="flex flex-wrap gap-2">
              {industryTemplates.map((template, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => loadTemplate(template)}
                  className="text-xs"
                >
                  {template.name}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Market Analysis Results */}
      {analysis && (
        <>
          {/* Key Market Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Globe className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Market Size</p>
                    <h3 className="text-xl font-bold">{analysis.marketSize}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-8 w-8 text-success" />
                  <div>
                    <p className="text-sm text-muted-foreground">Growth Rate</p>
                    <h3 className="text-xl font-bold">{safeGrowthRate(analysis.growthRate).toFixed(1)}%</h3>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Shield className="h-8 w-8 text-warning" />
                  <div>
                    <p className="text-sm text-muted-foreground">Competition</p>
                    <h3 className="text-xl font-bold">{analysis.competitivePosition.slice(0, 8)}...</h3>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Lightbulb className="h-8 w-8 text-tertiary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Opportunities</p>
                    <h3 className="text-xl font-bold">{analysis.opportunities.length}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Market Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                  Market Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={marketTrendData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="quarter" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="growth" 
                      stroke={CHART_COLORS.primary} 
                      strokeWidth={3}
                      name="Growth Rate (%)"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="opportunity" 
                      stroke={CHART_COLORS.secondary} 
                      strokeWidth={3}
                      name="Opportunity Score"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Competitive Landscape */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="h-5 w-5 mr-2 text-primary" />
                  Competitive Landscape
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={competitiveData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="segment" />
                    <YAxis />
                    <Tooltip />
                    <Bar 
                      dataKey="share" 
                      fill={CHART_COLORS.primary}
                      name="Market Share (%)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Industry Analysis Radar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                Industry Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={industryAnalysisData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="factor" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name="Current State"
                    dataKey="current"
                    stroke={CHART_COLORS.primary}
                    fill={CHART_COLORS.primary}
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                  <Radar
                    name="Potential"
                    dataKey="potential"
                    stroke={CHART_COLORS.secondary}
                    fill={CHART_COLORS.secondary}
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Analysis Results */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Opportunities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2 text-success" />
                  Market Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.opportunities.map((opportunity, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 rounded-full bg-success mt-2 flex-shrink-0" />
                      <p className="text-sm text-foreground">{opportunity}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Threats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-destructive" />
                  Market Threats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.threats.map((threat, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <AlertTriangle className="h-3 w-3 text-destructive mt-1 flex-shrink-0" />
                      <p className="text-sm text-foreground">{threat}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2 text-primary" />
                  Strategic Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.recommendations.map((recommendation, index) => (
                    <div key={index} className="space-y-1">
                      <Badge variant="outline" className="text-xs">
                        #{index + 1}
                      </Badge>
                      <p className="text-sm text-foreground">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Competitive Position */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2 text-primary" />
                Competitive Position Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed">{analysis.competitivePosition}</p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};