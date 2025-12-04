import { NextRequest, NextResponse } from 'next/server';
import { generateClaudeResponse, enhanceNoteContent, generateNoteSummary } from '@/lib/claude';

// POST /api/claude - Interact with Claude
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, content, prompt, systemPrompt, context, model } = body;

    if (!content && !prompt) {
      return NextResponse.json(
        { error: 'Content or prompt is required' },
        { status: 400 }
      );
    }

    let result: string;

    switch (action) {
      case 'enhance':
        result = await enhanceNoteContent(content, context, model);
        break;
      case 'summarize':
        result = await generateNoteSummary(content, model);
        break;
      case 'chat':
        result = await generateClaudeResponse(prompt, systemPrompt, model);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use "enhance", "summarize", or "chat"' },
          { status: 400 }
        );
    }

    return NextResponse.json({ result });
  } catch (error: any) {
    console.error('Error calling Claude API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process Claude request' },
      { status: 500 }
    );
  }
}

