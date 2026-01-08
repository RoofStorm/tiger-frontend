import { NextRequest, NextResponse } from 'next/server';
import { fetchFromServer } from '@/lib/fetch';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, referralCode, username } = await request.json();

    if (!email || !password || !name || !username) {
      return NextResponse.json(
        {
          error: 'Vui lòng điền đầy đủ thông tin: email, mật khẩu, tên và tên đăng nhập',
        },
        { status: 400 }
      );
    }

    // Call Backend API to create user with referral code
    // Backend will handle user existence check and validation
    try {
      const apiBaseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';
      const response = await fetchFromServer(
        `${apiBaseUrl}/auth/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
            name,
            username,
            referralCode: referralCode || null,
          }),
        },
        request.headers
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: 'Registration failed',
        }));

        // Extract error message from backend response
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

      const data = await response.json();

      // Handle backend response format: { success: true, data: { user, accessToken, ... } }
      // or direct format: { user, accessToken, ... }
      const userData =
        data.success && data.data?.user
          ? data.data.user
          : data.user || data.data;

      if (userData) {
        return NextResponse.json({
          message: 'User created successfully',
          user: userData,
        });
      } else {
        return NextResponse.json(
          {
            error: data.error || data.message || 'Đăng ký thất bại',
          },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error('❌ Error calling backend API:', error);
      // Return error instead of fallback to avoid confusion
      return NextResponse.json(
        {
          error: 'API Backend không khả dụng. Vui lòng thử lại sau.',
        },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Lỗi máy chủ nội bộ' }, { status: 500 });
  }
}
