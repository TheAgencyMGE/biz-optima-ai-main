import { GoogleGenerativeAI } from '@google/generative-ai';

// Business Analysis Types
export interface FinancialMetrics {
  revenue: number;
  costs: number;
  grossProfit: number;
  netProfit: number;
  assets: number;
  liabilities: number;
  equity: number;
  cashFlow: number;
  expenses: number;
}

export interface BusinessAnalysis {
  overallHealth: number;
  financialRatios: {
    profitMargin: number;
    liquidityRatio: number;
    debtToEquity: number;
    roi: number;
    currentRatio: number;
  };
  insights: string[];
  recommendations: Array<{
    action: string;
    impact: string;
    priority: 'high' | 'medium' | 'low';
    timeline: string;
  }>;
  riskFactors: string[];
  opportunities: string[];
}

export interface MarketAnalysis {
  marketSize: string;
  growthRate: number;
  competitivePosition: string;
  opportunities: string[];
  threats: string[];
  recommendations: string[];
}

export interface OperationalAnalysis {
  efficiencyScore: number;
  bottlenecks: string[];
  improvements: Array<{
    area: string;
    suggestion: string;
    expectedGain: string;
  }>;
  automationOpportunities: string[];
}

export class BizOptimaAIService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('VITE_GEMINI_API_KEY environment variable is required');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.9,
        maxOutputTokens: 8192,
      }
    });
  }

  async analyzeFinancialData(financialData: FinancialMetrics): Promise<BusinessAnalysis> {
    const prompt = `As a senior business financial analyst, analyze this company's financial data and provide comprehensive insights:

Financial Metrics:
- Revenue: $${financialData.revenue.toLocaleString()}
- Costs: $${financialData.costs.toLocaleString()}
- Gross Profit: $${financialData.grossProfit.toLocaleString()}
- Net Profit: $${financialData.netProfit.toLocaleString()}
- Total Assets: $${financialData.assets.toLocaleString()}
- Total Liabilities: $${financialData.liabilities.toLocaleString()}
- Equity: $${financialData.equity.toLocaleString()}
- Cash Flow: $${financialData.cashFlow.toLocaleString()}

Provide analysis in this exact JSON format:
{
  "overallHealth": [score 1-100],
  "financialRatios": {
    "profitMargin": [calculate: (netProfit/revenue)*100],
    "liquidityRatio": [calculate: assets/liabilities],
    "debtToEquity": [calculate: liabilities/equity],
    "roi": [calculate: (netProfit/assets)*100],
    "currentRatio": [calculate: assets/liabilities]
  },
  "insights": [
    "Key insight 1 about financial performance",
    "Key insight 2 about profitability trends",
    "Key insight 3 about financial stability"
  ],
  "recommendations": [
    {
      "action": "Specific actionable recommendation",
      "impact": "Expected business impact",
      "priority": "high|medium|low",
      "timeline": "Implementation timeframe"
    }
  ],
  "riskFactors": [
    "Risk factor 1",
    "Risk factor 2"
  ],
  "opportunities": [
    "Growth opportunity 1",
    "Efficiency opportunity 2"
  ]
}

Focus on actionable business insights and specific recommendations.

IMPORTANT: Return ONLY valid JSON without any markdown formatting, code blocks, or additional text. Start directly with { and end with }`;

    try {
      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();
      
      // Extract JSON from markdown code blocks if present
      const cleanedResponse = this.extractJsonFromResponse(responseText);
      return JSON.parse(cleanedResponse);
    } catch (error) {
      console.error('Financial analysis error:', error);
      return this.getDefaultFinancialAnalysis(financialData);
    }
  }

  async analyzeMarketOpportunity(
    industry: string,
    targetMarket: string,
    companySize: string
  ): Promise<MarketAnalysis> {
    const prompt = `As a market research analyst, analyze the market opportunity for a ${companySize} company in the ${industry} industry targeting ${targetMarket}.

Provide comprehensive market intelligence in this JSON format:
{
  "marketSize": "Market size description with numbers",
  "growthRate": [annual growth rate percentage],
  "competitivePosition": "Assessment of competitive landscape",
  "opportunities": [
    "Market opportunity 1",
    "Market opportunity 2",
    "Market opportunity 3"
  ],
  "threats": [
    "Market threat 1",
    "Market threat 2"
  ],
  "recommendations": [
    "Strategic recommendation 1",
    "Strategic recommendation 2",
    "Strategic recommendation 3"
  ]
}

Base analysis on current market trends and competitive dynamics.

IMPORTANT: Return ONLY valid JSON without any markdown formatting, code blocks, or additional text. Start directly with { and end with }`;

    try {
      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();
      const cleanedResponse = this.extractJsonFromResponse(responseText);
      const parsedResult = JSON.parse(cleanedResponse);
      
      // Ensure growthRate is a number
      if (parsedResult.growthRate !== undefined) {
        parsedResult.growthRate = typeof parsedResult.growthRate === 'number' 
          ? parsedResult.growthRate 
          : parseFloat(parsedResult.growthRate) || 0;
      }
      
      return parsedResult;
    } catch (error) {
      console.error('Market analysis error:', error);
      return this.getDefaultMarketAnalysis();
    }
  }

  async analyzeOperationalEfficiency(
    processes: string[],
    teamSize: number,
    monthlyOutput: number
  ): Promise<OperationalAnalysis> {
    const prompt = `As an operations consultant, analyze the operational efficiency for a company with:
- Team size: ${teamSize} employees
- Monthly output: ${monthlyOutput} units/deliverables
- Key processes: ${processes.join(', ')}

Provide operational analysis in this JSON format:
{
  "efficiencyScore": [score 1-100 based on industry benchmarks],
  "bottlenecks": [
    "Process bottleneck 1",
    "Process bottleneck 2"
  ],
  "improvements": [
    {
      "area": "Specific operational area",
      "suggestion": "Detailed improvement suggestion",
      "expectedGain": "Quantified benefit (time/cost/quality)"
    }
  ],
  "automationOpportunities": [
    "Automation opportunity 1",
    "Automation opportunity 2"
  ]
}

Focus on practical, implementable operational improvements.

IMPORTANT: Return ONLY valid JSON without any markdown formatting, code blocks, or additional text. Start directly with { and end with }`;

    try {
      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();
      const cleanedResponse = this.extractJsonFromResponse(responseText);
      return JSON.parse(cleanedResponse);
    } catch (error) {
      console.error('Operational analysis error:', error);
      return this.getDefaultOperationalAnalysis();
    }
  }

  async generateBusinessStrategy(
    businessType: string,
    currentChallenges: string[],
    goals: string[]
  ): Promise<{ strategy: string; tactics: string[]; timeline: string }> {
    const prompt = `As a strategic business consultant, develop a comprehensive strategy for a ${businessType} business.

Current Challenges: ${currentChallenges.join(', ')}
Business Goals: ${goals.join(', ')}

Provide strategic plan in this JSON format:
{
  "strategy": "Overarching strategic approach (2-3 sentences)",
  "tactics": [
    "Specific tactical action 1",
    "Specific tactical action 2",
    "Specific tactical action 3",
    "Specific tactical action 4"
  ],
  "timeline": "Implementation timeline with key milestones"
}

Focus on actionable, results-oriented strategic guidance.

IMPORTANT: Return ONLY valid JSON without any markdown formatting, code blocks, or additional text. Start directly with { and end with }`;

    try {
      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();
      const cleanedResponse = this.extractJsonFromResponse(responseText);
      return JSON.parse(cleanedResponse);
    } catch (error) {
      console.error('Strategy generation error:', error);
      return {
        strategy: "Focus on core competencies while diversifying revenue streams through strategic partnerships and operational excellence.",
        tactics: [
          "Implement data-driven decision making processes",
          "Develop strategic partnerships with complementary businesses",
          "Optimize operational workflows for efficiency gains",
          "Invest in customer retention and satisfaction programs"
        ],
        timeline: "6-month strategic implementation with quarterly milestone reviews"
      };
    }
  }

  private getDefaultFinancialAnalysis(financialData: FinancialMetrics): BusinessAnalysis {
    const profitMargin = (financialData.netProfit / financialData.revenue) * 100;
    const liquidityRatio = financialData.assets / financialData.liabilities;
    const debtToEquity = financialData.liabilities / financialData.equity;
    const roi = (financialData.netProfit / financialData.assets) * 100;

    return {
      overallHealth: Math.min(100, Math.max(0, (profitMargin * 2 + liquidityRatio * 20 + roi) / 3)),
      financialRatios: {
        profitMargin,
        liquidityRatio,
        debtToEquity,
        roi,
        currentRatio: liquidityRatio
      },
      insights: [
        `Current profit margin of ${profitMargin.toFixed(1)}% indicates operational efficiency`,
        `Liquidity ratio of ${liquidityRatio.toFixed(2)} shows financial stability`,
        `ROI of ${roi.toFixed(1)}% demonstrates asset utilization effectiveness`
      ],
      recommendations: [
        {
          action: "Optimize operational costs to improve profit margins",
          impact: "Increase profitability by 5-15%",
          priority: "high",
          timeline: "3-6 months"
        },
        {
          action: "Diversify revenue streams to reduce risk",
          impact: "Stable revenue growth and reduced market dependency",
          priority: "medium",
          timeline: "6-12 months"
        }
      ],
      riskFactors: [
        "High operational costs relative to revenue",
        "Potential cash flow constraints during growth phases"
      ],
      opportunities: [
        "Cost optimization through process automation",
        "Revenue growth through market expansion"
      ]
    };
  }

  private getDefaultMarketAnalysis(): MarketAnalysis {
    return {
      marketSize: "Addressable market showing strong growth potential",
      growthRate: 12.5,
      competitivePosition: "Moderate competition with differentiation opportunities",
      opportunities: [
        "Emerging market segments with high growth potential",
        "Technology adoption creating new business models",
        "Underserved customer segments requiring specialized solutions"
      ],
      threats: [
        "Increasing competitive pressure",
        "Economic uncertainty affecting customer spending"
      ],
      recommendations: [
        "Focus on customer experience differentiation",
        "Invest in digital transformation capabilities",
        "Develop strategic partnerships for market expansion"
      ]
    };
  }

  private getDefaultOperationalAnalysis(): OperationalAnalysis {
    return {
      efficiencyScore: 72,
      bottlenecks: [
        "Manual data processing creating delays",
        "Inefficient communication workflows between teams"
      ],
      improvements: [
        {
          area: "Data Processing",
          suggestion: "Implement automated data collection and analysis systems",
          expectedGain: "30% time savings, improved accuracy"
        },
        {
          area: "Team Communication",
          suggestion: "Adopt collaborative project management tools",
          expectedGain: "20% faster decision-making, better coordination"
        }
      ],
      automationOpportunities: [
        "Automated reporting and dashboard generation",
        "Customer service chatbots for common inquiries"
      ]
    };
  }

  // Utility method to extract JSON from AI responses that may contain markdown code blocks
  private extractJsonFromResponse(responseText: string): string {
    console.log('Raw AI Response:', responseText); // Debug log
    
    // Remove any markdown code block formatting
    let cleanedText = responseText.trim();
    
    // Check if response is wrapped in ```json ... ``` or ``` ... ```
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    // Find the JSON object by looking for { and matching }
    const jsonStart = cleanedText.indexOf('{');
    const jsonEnd = cleanedText.lastIndexOf('}');
    
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      cleanedText = cleanedText.substring(jsonStart, jsonEnd + 1);
    }
    
    // Remove any trailing text after the JSON
    cleanedText = cleanedText.trim();
    
    console.log('Cleaned JSON:', cleanedText); // Debug log
    
    return cleanedText;
  }
}

export const bizOptimaAI = new BizOptimaAIService();