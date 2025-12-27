import { NextRequest, NextResponse } from 'next/server';

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
    console.log(`🔄 Creating user via Backend API: ${email}`);
    try {
      const apiBaseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';
      const response = await fetch(`${apiBaseUrl}/auth/register`, {
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
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: 'Registration failed',
        }));
        console.log(
          '⚠️ Backend API error response:',
          response.status,
          errorData
        );

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
      console.log('🔍 Backend response:', JSON.stringify(data, null, 2));

      // Handle backend response format: { success: true, data: { user, accessToken, ... } }
      // or direct format: { user, accessToken, ... }
      const userData =
        data.success && data.data?.user
          ? data.data.user
          : data.user || data.data;

      if (userData) {
        console.log(
          `✅ User created successfully via Backend: ${userData.email}`
        );
        return NextResponse.json({
          message: 'User created successfully',
          user: userData,
        });
      } else {
        console.log('⚠️ Backend API returned unexpected format:', data);
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
