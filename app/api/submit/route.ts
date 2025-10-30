import { NextRequest, NextResponse } from 'next/server';
import { judge0Service } from '@/lib/judge0';
import { Language } from '@/constants';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Submit API called with:', body);

    const { 
      code, 
      language, 
      input = '' 
    }: {
      code: string;
      language: Language;
      input?: string;
    } = body;

    if (!code || !language) {
      return NextResponse.json(
        { error: 'Code and language are required' },
        { status: 400 }
      );
    }

    const token = await judge0Service.submitCode(code, language, input);
    
    console.log('Code submitted, token:', token);

    return NextResponse.json({ 
      success: true, 
      token 
    });

  } catch (error: any) {
    console.error('Submit API error:', error);
    
    return NextResponse.json(
      { 
        error: error.message || 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
