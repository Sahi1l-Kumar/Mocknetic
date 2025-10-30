import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
  try {
    const baseURL = process.env.JUDGE0_API_URL || 'http://localhost:2358';
    
    const response = await axios.get(`${baseURL}/system_info`, {
      timeout: 5000
    });

    return NextResponse.json({ 
      success: true, 
      judge0Status: 'running',
      systemInfo: response.data 
    });

  } catch (error: any) {
    console.error('Judge0 health check failed:', error.message);
    
    return NextResponse.json(
      { 
        success: false,
        judge0Status: 'down',
        error: 'Judge0 service is not running' 
      },
      { status: 503 }
    );
  }
}
