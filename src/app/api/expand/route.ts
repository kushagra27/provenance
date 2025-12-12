import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { ComponentDetailResult } from '@/lib/types';

const SYSTEM_PROMPT = `You are a historian of technology and manufacturing. You will be given a component/material/technology name and the object it's part of. Return a detailed history of that component.

Return a STRICT JSON object (no markdown, no code fences, just raw JSON) with this structure:
{
  "name": "Component Name",
  "history": [
    {"year": "2000", "event": "Recent milestone", "description": "Short detail"},
    {"year": "1950", "event": "Earlier event", "description": "Short detail"}
  ]
}

Rules:
- Provide 5-6 key historical milestones for this component/material/technology
- Order events from MOST RECENT to OLDEST (descending chronological order)
- Focus on the component's history independent of the main object
- Keep descriptions concise but informative (max 15 words)
- Years can be approximate (e.g., "3500 BC", "1850s", "~1900")`;

export async function POST(request: NextRequest) {
  try {
    const { componentName, objectTitle } = await request.json();

    if (!componentName || !objectTitle) {
      return NextResponse.json(
        { error: 'Component name and object title are required' },
        { status: 400 }
      );
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: 'OpenRouter API key not configured' },
        { status: 500 }
      );
    }

    const openrouter = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
      defaultHeaders: {
        'HTTP-Referer': process.env.SITE_URL || 'http://localhost:3000',
        'X-Title': 'Provenance',
      },
    });

    const response = await openrouter.chat.completions.create({
      model: 'openai/gpt-4o',
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: `Provide a detailed history of "${componentName}" as a component/material used in "${objectTitle}".`,
        },
      ],
      max_tokens: 800,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 500 }
      );
    }

    let result: ComponentDetailResult;
    try {
      const cleanedContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      result = JSON.parse(cleanedContent);
    } catch {
      console.error('Failed to parse AI response:', content);
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 500 }
      );
    }

    if (!result.name || !result.history) {
      return NextResponse.json(
        { error: 'Invalid response structure from AI' },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to expand component history' },
      { status: 500 }
    );
  }
}
