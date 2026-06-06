// AI Email Service - Comprehensive email analysis and response generation
export interface EmailAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral' | 'urgent';
  priority: 'high' | 'medium' | 'low';
  intent: 'question' | 'request' | 'complaint' | 'proposal' | 'follow-up' | 'general';
  category: 'business' | 'personal' | 'marketing' | 'support' | 'sales';
  confidence: number;
  keyPoints: string[];
  entities: {
    people: string[];
    companies: string[];
    dates: string[];
    amounts: string[];
    topics: string[];
  };
  suggestedActions: string[];
  urgencyScore: number;
  responseTone: 'professional' | 'friendly' | 'formal';
}

export interface AIEmailDraft {
  id: string;
  tone: 'professional' | 'friendly' | 'formal';
  subject: string;
  content: string;
  confidence: number;
  reasoning: string;
  keyPoints: string[];
  suggestedNextSteps: string[];
}

export interface EmailContext {
  sender: string;
  recipient: string;
  subject: string;
  content: string;
  timestamp: string;
  isReply: boolean;
  conversationHistory?: string[];
  relationshipType?: 'client' | 'colleague' | 'prospect' | 'vendor' | 'unknown';
}

class AIEmailService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.VITE_GEMINI_API_KEY || '';
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';
  }

  // Main email analysis function
  async analyzeEmail(email: EmailContext): Promise<EmailAnalysis> {
    try {
      const prompt = this.buildAnalysisPrompt(email);
      const response = await this.callGeminiAPI(prompt);
      return this.parseAnalysisResponse(response);
    } catch (error) {
      console.error('Error analyzing email:', error);
      return this.getFallbackAnalysis(email);
    }
  }

  // Generate AI email drafts
  async generateDrafts(email: EmailContext, analysis: EmailAnalysis): Promise<AIEmailDraft[]> {
    try {
      const drafts: AIEmailDraft[] = [];
      
      // Generate drafts for different tones
      const tones: Array<'professional' | 'friendly' | 'formal'> = ['professional', 'friendly', 'formal'];
      
      for (const tone of tones) {
        const prompt = this.buildDraftPrompt(email, analysis, tone);
        const response = await this.callGeminiAPI(prompt);
        const draft = this.parseDraftResponse(response, tone, analysis);
        drafts.push(draft);
      }

      return drafts;
    } catch (error) {
      console.error('Error generating drafts:', error);
      return this.getFallbackDrafts(email, analysis);
    }
  }

  // Build analysis prompt for Gemini API
  private buildAnalysisPrompt(email: EmailContext): string {
    return `
Analyze this email comprehensively and provide detailed insights:

Email Details:
- From: ${email.sender}
- To: ${email.recipient}
- Subject: ${email.subject}
- Content: ${email.content}
- Timestamp: ${email.timestamp}
- Is Reply: ${email.isReply ? 'Yes' : 'No'}

Please analyze and respond with a JSON object containing:

1. sentiment: "positive", "negative", "neutral", or "urgent"
2. priority: "high", "medium", or "low" based on urgency indicators
3. intent: "question", "request", "complaint", "proposal", "follow-up", or "general"
4. category: "business", "personal", "marketing", "support", or "sales"
5. confidence: number between 0-100
6. keyPoints: array of 3-5 key points from the email
7. entities: object with arrays for:
   - people: names mentioned
   - companies: company names
   - dates: dates or deadlines
   - amounts: monetary amounts or numbers
   - topics: main topics discussed
8. suggestedActions: array of 3-5 recommended next steps
9. urgencyScore: number between 1-10
10. responseTone: recommended tone "professional", "friendly", or "formal"

Focus on business context and professional communication patterns. Be thorough and accurate.
`;
  }

  // Build draft generation prompt
  private buildDraftPrompt(email: EmailContext, analysis: EmailAnalysis, tone: string): string {
    return `
Generate a ${tone} email response based on this analysis:

Original Email:
- From: ${email.sender}
- Subject: ${email.subject}
- Content: ${email.content}

Analysis Results:
- Intent: ${analysis.intent}
- Category: ${analysis.category}
- Priority: ${analysis.priority}
- Key Points: ${analysis.keyPoints.join(', ')}

Please generate a ${tone} response with:

1. subject: Appropriate subject line for the reply
2. content: Well-structured email body in ${tone} tone
3. confidence: confidence level (70-100)
4. reasoning: explanation of why this tone and content was chosen
5. keyPoints: main points covered in the response
6. suggestedNextSteps: recommended follow-up actions

Guidelines for ${tone} tone:
- Professional: Formal, business-appropriate, clear and concise
- Friendly: Warm, approachable, relationship-building
- Formal: Highly structured, traditional business correspondence

Respond with a JSON object containing these fields.
`;
  }

  // Call Gemini API
  private async callGeminiAPI(prompt: string): Promise<any> {
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured');
    }

    const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 32,
          topP: 1,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.candidates[0]?.content?.parts[0]?.text || '';
  }

  // Parse analysis response from Gemini
  private parseAnalysisResponse(response: string): EmailAnalysis {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return this.validateAnalysis(parsed);
      }
    } catch (error) {
      console.error('Error parsing analysis response:', error);
    }

    return this.getFallbackAnalysis({} as EmailContext);
  }

  // Parse draft response from Gemini
  private parseDraftResponse(response: string, tone: string, analysis: EmailAnalysis): AIEmailDraft {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          id: `draft-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          tone: tone as 'professional' | 'friendly' | 'formal',
          subject: parsed.subject || `Re: ${analysis.intent}`,
          content: parsed.content || 'Thank you for your email.',
          confidence: Math.max(70, Math.min(100, parsed.confidence || 85)),
          reasoning: parsed.reasoning || `Generated ${tone} response based on email analysis.`,
          keyPoints: parsed.keyPoints || ['Acknowledgment', 'Response to inquiry'],
          suggestedNextSteps: parsed.suggestedNextSteps || ['Follow up if needed']
        };
      }
    } catch (error) {
      console.error('Error parsing draft response:', error);
    }

    return this.getFallbackDraft(tone, analysis);
  }

  // Validate and sanitize analysis results
  private validateAnalysis(analysis: any): EmailAnalysis {
    return {
      sentiment: ['positive', 'negative', 'neutral', 'urgent'].includes(analysis.sentiment) 
        ? analysis.sentiment : 'neutral',
      priority: ['high', 'medium', 'low'].includes(analysis.priority) 
        ? analysis.priority : 'medium',
      intent: ['question', 'request', 'complaint', 'proposal', 'follow-up', 'general'].includes(analysis.intent)
        ? analysis.intent : 'general',
      category: ['business', 'personal', 'marketing', 'support', 'sales'].includes(analysis.category)
        ? analysis.category : 'business',
      confidence: Math.max(0, Math.min(100, analysis.confidence || 75)),
      keyPoints: Array.isArray(analysis.keyPoints) ? analysis.keyPoints.slice(0, 5) : [],
      entities: {
        people: Array.isArray(analysis.entities?.people) ? analysis.entities.people : [],
        companies: Array.isArray(analysis.entities?.companies) ? analysis.entities.companies : [],
        dates: Array.isArray(analysis.entities?.dates) ? analysis.entities.dates : [],
        amounts: Array.isArray(analysis.entities?.amounts) ? analysis.entities.amounts : [],
        topics: Array.isArray(analysis.entities?.topics) ? analysis.entities.topics : []
      },
      suggestedActions: Array.isArray(analysis.suggestedActions) ? analysis.suggestedActions.slice(0, 5) : [],
      urgencyScore: Math.max(1, Math.min(10, analysis.urgencyScore || 5)),
      responseTone: ['professional', 'friendly', 'formal'].includes(analysis.responseTone)
        ? analysis.responseTone : 'professional'
    };
  }

  // Fallback analysis when API fails
  private getFallbackAnalysis(email: EmailContext): EmailAnalysis {
    const urgencyKeywords = ['urgent', 'asap', 'immediately', 'emergency', 'critical'];
    const isUrgent = urgencyKeywords.some(keyword => 
      email.content?.toLowerCase().includes(keyword) || 
      email.subject?.toLowerCase().includes(keyword)
    );

    return {
      sentiment: isUrgent ? 'urgent' : 'neutral',
      priority: isUrgent ? 'high' : 'medium',
      intent: 'general',
      category: 'business',
      confidence: 60,
      keyPoints: ['Email received', 'Response needed'],
      entities: {
        people: [],
        companies: [],
        dates: [],
        amounts: [],
        topics: []
      },
      suggestedActions: ['Review email content', 'Prepare response'],
      urgencyScore: isUrgent ? 8 : 5,
      responseTone: 'professional'
    };
  }

  // Fallback drafts when API fails
  private getFallbackDrafts(email: EmailContext, analysis: EmailAnalysis): AIEmailDraft[] {
    const tones: Array<'professional' | 'friendly' | 'formal'> = ['professional', 'friendly', 'formal'];
    
    return tones.map(tone => this.getFallbackDraft(tone, analysis));
  }

  // Fallback draft for specific tone
  private getFallbackDraft(tone: string, analysis: EmailAnalysis): AIEmailDraft {
    const responses = {
      professional: "Thank you for your email. I have reviewed your message and will respond appropriately.",
      friendly: "Thanks for reaching out! I've received your email and I'm looking forward to helping you.",
      formal: "I acknowledge receipt of your correspondence and will provide a detailed response in due course."
    };

    return {
      id: `draft-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tone: tone as 'professional' | 'friendly' | 'formal',
      subject: `Re: ${analysis.intent}`,
      content: responses[tone as keyof typeof responses] || responses.professional,
      confidence: 70,
      reasoning: `Generated ${tone} response template based on email analysis.`,
      keyPoints: ['Acknowledgment', 'Response commitment'],
      suggestedNextSteps: ['Review original email', 'Prepare detailed response']
    };
  }

  // Extract entities using simple regex patterns (fallback when API fails)
  private extractEntities(text: string) {
    const entities = {
      people: [] as string[],
      companies: [] as string[],
      dates: [] as string[],
      amounts: [] as string[],
      topics: [] as string[]
    };

    // Simple entity extraction patterns
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const phoneRegex = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g;
    const moneyRegex = /\$[\d,]+(?:\.\d{2})?|\b\d+(?:\.\d{2})?\s*(?:dollars?|USD|usd)\b/gi;
    const dateRegex = /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}\b|\b\d{1,2}\/\d{1,2}\/\d{4}\b|\b\d{4}-\d{2}-\d{2}\b/g;

    // Extract entities
    entities.people = [...text.matchAll(emailRegex)].map(match => match[0]);
    entities.amounts = [...text.matchAll(moneyRegex)].map(match => match[0]);
    entities.dates = [...text.matchAll(dateRegex)].map(match => match[0]);

    return entities;
  }
}

// Export singleton instance
export const aiEmailService = new AIEmailService();

// Export utility functions
export const analyzeEmailContent = (content: string): Partial<EmailAnalysis> => {
  const urgencyKeywords = ['urgent', 'asap', 'immediately', 'emergency', 'critical', 'deadline'];
  const questionKeywords = ['?', 'how', 'what', 'when', 'where', 'why', 'can you', 'could you'];
  const requestKeywords = ['please', 'request', 'need', 'require', 'help', 'assist'];
  const complaintKeywords = ['problem', 'issue', 'complaint', 'wrong', 'error', 'dissatisfied'];

  const lowerContent = content.toLowerCase();
  
  const isUrgent = urgencyKeywords.some(keyword => lowerContent.includes(keyword));
  const isQuestion = questionKeywords.some(keyword => lowerContent.includes(keyword));
  const isRequest = requestKeywords.some(keyword => lowerContent.includes(keyword));
  const isComplaint = complaintKeywords.some(keyword => lowerContent.includes(keyword));

  let intent: EmailAnalysis['intent'] = 'general';
  if (isQuestion) intent = 'question';
  else if (isRequest) intent = 'request';
  else if (isComplaint) intent = 'complaint';

  return {
    priority: isUrgent ? 'high' : 'medium',
    intent,
    urgencyScore: isUrgent ? 8 : 5
  };
};
