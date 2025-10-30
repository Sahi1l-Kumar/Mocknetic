import { NextRequest, NextResponse } from 'next/server';
import { judge0Service } from '@/lib/judge0';
import { LANGUAGE_IDS } from '@/constants';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Execute API called with:', body);

    const { 
      code, 
      language, 
      input = ''
    }: {
      code: string;
      language: string;
      input?: string;
    } = body;

    // Validate required fields
    if (!code || !language) {
      return NextResponse.json(
        { error: 'Code and language are required' },
        { status: 400 }
      );
    }

    // Validate language - Check if language exists in LANGUAGE_IDS
    const languageKey = language.toLowerCase();
    if (!LANGUAGE_IDS[languageKey as keyof typeof LANGUAGE_IDS]) {
      return NextResponse.json(
        { error: `Unsupported language: ${language}. Supported: ${Object.keys(LANGUAGE_IDS).join(', ')}` },
        { status: 400 }
      );
    }

    // Execute code
    const result = await judge0Service.executeCode(code, languageKey as any, input);

    console.log('Execution completed:', result);

    return NextResponse.json({ 
      success: true, 
      result 
    });

  } catch (error: any) {
    console.error('Execute API error:', error);
    
    return NextResponse.json(
      { 
        error: error.message || 'Internal server error',
        details: error.stack 
      },
      { status: 500 }
    );
  }
}
