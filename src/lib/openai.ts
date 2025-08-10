export interface OpenAIResponse {
  content: string;
  error?: string;
}

export async function callOpenAI(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<OpenAIResponse> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OpenAI API key not configured. Please add NEXT_PUBLIC_OPENAI_API_KEY to your .env.local file.');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.NEXT_PUBLIC_OPENAI_MODEL || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are an expert coding interviewer helping a candidate with a React/TypeScript calendar application challenge. 
            
            Your role:
            - Provide helpful, specific guidance on React/TypeScript concepts
            - Help debug code issues
            - Suggest best practices and improvements
            - Ask clarifying questions when needed
            - Be encouraging but also point out areas for improvement
            
            Keep responses concise but helpful. Focus on the specific coding challenge at hand.`
          },
          ...messages
        ],
        max_tokens: parseInt(process.env.NEXT_PUBLIC_OPENAI_MAX_TOKENS || '1000'),
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No response content from OpenAI');
    }

    return { content };
  } catch (error) {
    console.error('OpenAI API error:', error);
    return {
      content: 'I apologize, but I\'m having trouble connecting to my AI service right now. Please try again in a moment.',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
