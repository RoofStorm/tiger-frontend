import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const apiBaseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';

    // Get query parameters for pagination if needed
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '20';

    // Build query string
    const queryParams = new URLSearchParams({
      page,
      limit,
    });

    console.log(`🔄 Fetching highlighted wishes from Backend API`);

    const response = await fetch(
      `${apiBaseUrl}/wishes/highlighted?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
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

    // Normalize response structure: separate data and pagination
    // Backend returns: { success: true, data: { data: [...], total: 6, page: 1, ... }, message: "Success" }
    // We return: { success: true, data: [...], pagination: { total: 6, page: 1, ... }, message: "Success" }
    if (backendData.success && backendData.data) {
      const innerData = backendData.data;
      
      // Check if data is nested (data.data exists)
      if (innerData.data && Array.isArray(innerData.data)) {
        return NextResponse.json({
          success: true,
          data: innerData.data,
          pagination: {
            total: innerData.total || 0,
            page: innerData.page || 1,
            limit: innerData.limit || 20,
            totalPages: innerData.totalPages || 1,
          },
          message: backendData.message || 'Success',
        });
      }
      
      // If data is already an array, return as is with pagination
      if (Array.isArray(innerData)) {
        return NextResponse.json({
          success: true,
          data: innerData,
          pagination: {
            total: innerData.length,
            page: 1,
            limit: innerData.length,
            totalPages: 1,
          },
          message: backendData.message || 'Success',
        });
      }
    }
    
    // Fallback: return backend response as is
    return NextResponse.json(backendData);
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

