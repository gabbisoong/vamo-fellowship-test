import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Available models:
// - claude-sonnet-4-20250514 (Claude Sonnet 4 - latest, recommended)
// - claude-opus-4-1-20250805 (Claude Opus 4.1 - most powerful)
// - claude-3-5-sonnet-20241022 (Claude 3.5 Sonnet - previous version)
// - claude-3-5-haiku-20241022 (Claude 3.5 Haiku - faster, cheaper)
const DEFAULT_MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514';

export async function generateClaudeResponse(
  prompt: string,
  systemPrompt?: string,
  model?: string
): Promise<string> {
  try {
    const response = await anthropic.messages.create({
      model: model || DEFAULT_MODEL,
      max_tokens: 1024,
      system: systemPrompt || 'You are a helpful assistant.',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return content.text;
    }
    
    throw new Error('Unexpected response type from Claude');
  } catch (error) {
    console.error('Error calling Claude API:', error);
    throw error;
  }
}

export async function enhanceNoteContent(
  content: string,
  context?: string,
  model?: string
): Promise<string> {
  const systemPrompt = 'You are a helpful writing assistant that enhances and improves note content while maintaining the original meaning and intent.';
  const prompt = context
    ? `Please enhance the following note content:\n\n${content}\n\nContext: ${context}`
    : `Please enhance the following note content:\n\n${content}`;

  return generateClaudeResponse(prompt, systemPrompt, model);
}

export async function generateNoteSummary(
  content: string,
  model?: string
): Promise<string> {
  const systemPrompt = 'You are a helpful assistant that creates concise summaries of notes.';
  const prompt = `Please create a brief summary of the following note:\n\n${content}`;

  return generateClaudeResponse(prompt, systemPrompt, model);
}

