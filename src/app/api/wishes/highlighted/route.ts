import { NextRequest, NextResponse } from 'next/server';
import { fetchFromServer } from '@/lib/fetch';

export async function GET(request: NextRequest) {
  try {
    const apiBaseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';

    // Get query parameters for cursor-based pagination
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor');
    const limit = searchParams.get('limit') || '15';

    // Build query string
    const queryParams = new URLSearchParams({
      limit,
    });
    
    if (cursor) {
      queryParams.append('cursor', cursor);
    }

    console.log(`🔄 Fetching highlighted wishes from Backend API (Cursor-based)`);

    const response = await fetchFromServer(
      `${apiBaseUrl}/wishes/highlighted?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
      request.headers
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: 'Failed to fetch highlighted wishes',
      }));

      console.log(
        '⚠️ Backend API error response:',
        response.status,
        errorData
      );

      const errorMessage =
        errorData.error ||
        errorData.message ||
        errorData.data?.message ||
        `Lỗi API Backend (${response.status})`;

      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    const backendData = await response.json();
    console.log('✅ Successfully fetched highlighted wishes');

    // Return structure: { success, data, nextCursor }
    // Backend now returns this directly or in a consistent way
    return NextResponse.json({
      success: backendData.success !== false,
      data: backendData.data?.data || backendData.data || [],
      nextCursor: backendData.nextCursor || backendData.data?.nextCursor || null,
      message: backendData.message || 'Success',
    });
  } catch (error) {
    console.error('❌ Error calling backend API:', error);
    return NextResponse.json(
      {
        error: 'API Backend không khả dụng. Vui lòng thử lại sau.',
      },
      { status: 503 }
    );
  }
}

