import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { ProvenanceResult } from '@/lib/types';

const SYSTEM_PROMPT = `You are a historian of technology and manufacturing. Identify the object in the image. Return a STRICT JSON object (no markdown, no code fences, just raw JSON) with this structure:
{
  "title": "Name of object",
  "summary": "A 1-sentence poetic description of its significance to humanity.",
  "timeline": [
    {"year": "2000", "event": "Recent Development", "description": "Short detail"},
    {"year": "1990", "event": "Earlier Event", "description": "Short detail"}
  ],
  "components": [
    {
      "name": "Component Name",
      "connectsAtYear": "1990",
      "history": [
        {"year": "1950", "event": "Component milestone", "description": "Short detail"},
        {"year": "1900", "event": "Component origin", "description": "Short detail"}
      ]
    }
  ]
}

Rules:
- The timeline should contain exactly 4 key historical milestones of this object, ordered from MOST RECENT to OLDEST (descending chronological order)
- The components array should contain exactly 3 key materials, technologies, or processes that make up this object
- Each component must have a "connectsAtYear" that matches one of the years in the main timeline (the year when this component became part of the object's story)
- Each component's history should contain exactly 2 events, ordered from most recent to oldest
- Keep descriptions concise but informative (max 15 words)
- The summary should be poetic and evocative, highlighting the object's significance to human civilization
- If you cannot identify the object, make an educated guess based on what you can see
- Years can be approximate (e.g., "3500 BC", "1850s", "~1900")`;

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
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
          content: [
            {
              type: 'image_url',
              image_url: {
                url: image,
                detail: 'high',
              },
            },
            {
              type: 'text',
              text: 'Analyze this object and provide its provenance information with component histories.',
            },
          ],
        },
      ],
      max_tokens: 1500,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 500 }
      );
    }

    let result: ProvenanceResult;
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

    if (!result.title || !result.summary || !result.timeline || !result.components) {
      return NextResponse.json(
        { error: 'Invalid response structure from AI' },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze image' },
      { status: 500 }
    );
  }
}
