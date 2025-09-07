import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Brain, 
  MessageCircle, 
  Target, 
  Lightbulb, 
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { bizOptimaAI } from '@/services/bizOptimaAI';

interface ConsultationRequest {
  businessType: string;
  currentChallenges: string[];
  goals: string[];
  industry: string;
  teamSize: string;
  monthlyRevenue: string;
}

interface StrategicAdvice {
  strategy: string;
  tactics: string[];
  timeline: string;
}

export const AIBusinessConsultant: React.FC = () => {
  const [consultation, setConsultation] = useState<ConsultationRequest>({
    businessType: '',
    currentChallenges: [],
    goals: [],
    industry: '',
    teamSize: '',
    monthlyRevenue: ''
  });
  
  const [advice, setAdvice] = useState<StrategicAdvice | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [challengeInput, setChallengeInput] = useState('');
  const [goalInput, setGoalInput] = useState('');

  const addChallenge = () => {
    if (challengeInput.trim()) {
      setConsultation(prev => ({
        ...prev,
        challenges: [...prev.currentChallenges, challengeInput.trim()]
      }));
      setChallengeInput('');
    }
  };

  const addGoal = () => {
    if (goalInput.trim()) {
      setConsultation(prev => ({
        ...prev,
        goals: [...prev.goals, goalInput.trim()]
      }));
      setGoalInput('');
    }
  };

  const removeChallenge = (index: number) => {
    setConsultation(prev => ({
      ...prev,
      currentChallenges: prev.currentChallenges.filter((_, i) => i !== index)
    }));
  };

  const removeGoal = (index: number) => {
    setConsultation(prev => ({
      ...prev,
      goals: prev.goals.filter((_, i) => i !== index)
    }));
  };

  const getStrategicAdvice = async () => {
    if (!consultation.businessType || consultation.currentChallenges.length === 0 || consultation.goals.length === 0) {
      alert('Please fill in business type, at least one challenge, and one goal.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await bizOptimaAI.generateBusinessStrategy(
        consultation.businessType,
        consultation.currentChallenges,
        consultation.goals
      );
      setAdvice(result);
    } catch (error) {
      console.error('Strategy generation failed:', error);
      // Fallback strategic advice
      setAdvice({
        strategy: "Focus on core competencies while implementing systematic improvements across operations, customer experience, and market positioning.",
        tactics: [
          "Conduct thorough market analysis to identify growth opportunities",
          "Implement customer feedback systems for continuous improvement",
          "Optimize operational processes to reduce costs and improve efficiency",
          "Develop strategic partnerships to expand market reach",
          "Invest in team development and skill enhancement",
          "Create data-driven decision-making frameworks"
        ],
        timeline: "6-month implementation with quarterly milestone reviews and adjustments"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const quickConsultationTemplates = [
    {
      type: "E-commerce Startup",
      challenges: ["Low conversion rates", "High customer acquisition costs", "Inventory management"],
      goals: ["Increase sales by 50%", "Improve profit margins", "Scale operations"]
    },
    {
      type: "SaaS Company",
      challenges: ["Customer churn", "Product-market fit", "Scaling development team"],
      goals: ["Reduce churn to <5%", "Increase MRR by 100%", "Launch new features"]
    },
    {
      type: "Consulting Business",
      challenges: ["Client acquisition", "Project management", "Team utilization"],
      goals: ["Double client base", "Improve delivery efficiency", "Expand service offerings"]
    },
    {
      type: "Manufacturing Company",
      challenges: ["Supply chain disruptions", "Quality control", "Cost management"],
      goals: ["Reduce production costs", "Improve quality metrics", "Expand to new markets"]
    }
  ];

  const loadTemplate = (template: typeof quickConsultationTemplates[0]) => {
    setConsultation(prev => ({
      ...prev,
      businessType: template.type,
      currentChallenges: template.challenges,
      goals: template.goals
    }));
  };

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-primary rounded-full">
              <Brain className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            AI Business Consultant
          </h1>
          <p className="text-xl text-muted-foreground">
            Get personalized strategic advice powered by advanced AI
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Consultation Form */}
          <div className="space-y-6">
            <Card className="executive-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2 text-primary" />
                  Business Consultation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Quick Templates */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Quick Start Templates</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {quickConsultationTemplates.map((template, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => loadTemplate(template)}
                        className="justify-start text-left h-auto p-3"
                      >
                        <div>
                          <div className="font-medium">{template.type}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {template.challenges.slice(0, 2).join(', ')}...
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Business Type */}
                <div className="space-y-2">
                  <Label htmlFor="businessType">Business Type</Label>
                  <Input
                    id="businessType"
                    placeholder="e.g., E-commerce, SaaS, Consulting, Manufacturing"
                    value={consultation.businessType}
                    onChange={(e) => setConsultation(prev => ({
                      ...prev,
                      businessType: e.target.value
                    }))}
                  />
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Input
                      id="industry"
                      placeholder="e.g., Technology, Healthcare, Retail"
                      value={consultation.industry}
                      onChange={(e) => setConsultation(prev => ({
                        ...prev,
                        industry: e.target.value
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="teamSize">Team Size</Label>
                    <Input
                      id="teamSize"
                      placeholder="e.g., 5-10 employees"
                      value={consultation.teamSize}
                      onChange={(e) => setConsultation(prev => ({
                        ...prev,
                        teamSize: e.target.value
                      }))}
                    />
                  </div>
                </div>

                {/* Current Challenges */}
                <div className="space-y-2">
                  <Label>Current Business Challenges</Label>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Add a business challenge..."
                      value={challengeInput}
                      onChange={(e) => setChallengeInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addChallenge()}
                    />
                    <Button onClick={addChallenge} size="sm">Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {consultation.currentChallenges.map((challenge, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => removeChallenge(index)}
                      >
                        {challenge} ×
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Business Goals */}
                <div className="space-y-2">
                  <Label>Business Goals</Label>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Add a business goal..."
                      value={goalInput}
                      onChange={(e) => setGoalInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addGoal()}
                    />
                    <Button onClick={addGoal} size="sm">Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {consultation.goals.map((goal, index) => (
                      <Badge 
                        key={index} 
                        variant="default" 
                        className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => removeGoal(index)}
                      >
                        {goal} ×
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={getStrategicAdvice}
                  disabled={isAnalyzing}
                  className="w-full bg-gradient-primary hover:bg-primary-hover"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing Your Business...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Get Strategic Advice
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Strategic Advice */}
          <div className="space-y-6">
            {advice ? (
              <>
                {/* Strategic Overview */}
                <Card className="executive-card">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="h-5 w-5 mr-2 text-primary" />
                      Strategic Recommendation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-gradient-accent rounded-lg border">
                        <h3 className="font-semibold text-foreground mb-2">Core Strategy</h3>
                        <p className="text-foreground leading-relaxed">{advice.strategy}</p>
                      </div>
                      
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-2" />
                        Implementation Timeline: {advice.timeline}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tactical Actions */}
                <Card className="executive-card">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CheckCircle2 className="h-5 w-5 mr-2 text-success" />
                      Action Plan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {advice.tactics.map((tactic, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="text-foreground font-medium">{tactic}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Implementation Tips */}
                <Card className="executive-card">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Lightbulb className="h-5 w-5 mr-2 text-warning" />
                      Implementation Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="h-4 w-4 text-warning mt-1 flex-shrink-0" />
                        <p className="text-sm text-foreground">Start with the highest-impact, lowest-effort initiatives to build momentum</p>
                      </div>
                      <div className="flex items-start space-x-2">
                        <TrendingUp className="h-4 w-4 text-success mt-1 flex-shrink-0" />
                        <p className="text-sm text-foreground">Set measurable KPIs for each tactical action to track progress</p>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Clock className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                        <p className="text-sm text-foreground">Review and adjust your strategy monthly based on performance data</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="executive-card">
                <CardContent className="p-12 text-center">
                  <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Ready for Strategic Guidance
                  </h3>
                  <p className="text-muted-foreground">
                    Fill out your business information to receive personalized strategic advice from our AI consultant.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};