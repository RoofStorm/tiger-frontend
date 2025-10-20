import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { POINTS } from '@/constants/points';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, referralCode } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        {
          error: 'Vui lòng điền đầy đủ thông tin: email, mật khẩu và tên',
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email này đã được sử dụng' },
        { status: 400 }
      );
    }

    // Call Backend API to create user with referral code
    console.log(`🔄 Creating user via Backend API: ${email}`);
    try {
      const response = await fetch(
        `${process.env.BACKEND_URL || 'http://localhost:4000'}/api/auth/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
            name,
            referralCode: referralCode || null,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Backend response:', JSON.stringify(data, null, 2));

        if (data.success && data.data?.user) {
          console.log(
            `✅ User created successfully via Backend: ${data.data.user.email}`
          );
          return NextResponse.json({
            message: 'User created successfully',
            user: data.data.user,
          });
        } else {
          console.log(
            '⚠️ Backend API returned error:',
            data.error || data.message
          );
          return NextResponse.json(
            {
              error: data.error || data.message || 'Đăng ký thất bại',
            },
            { status: 400 }
          );
        }
      } else {
        const errorData = await response.json();
        console.log(
          '⚠️ Backend API error response:',
          response.status,
          errorData
        );

        // Return specific error from backend
        return NextResponse.json(
          {
            error:
              errorData.error ||
              errorData.message ||
              `Lỗi API Backend (${response.status})`,
          },
          { status: response.status }
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

// Fallback function for local user creation
async function createUserLocally(
  email: string,
  password: string,
  name: string,
  referralCode?: string
) {
  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: hashedPassword,
      name,
      role: 'USER',
      status: 'ACTIVE',
      points: 0,
    },
  });

  // Process referral if provided
  if (referralCode) {
    try {
      // Find referrer by referral code
      const referrer = await prisma.user.findUnique({
        where: { referralCode },
      });

      if (referrer) {
        // Link the new user to referrer
        await prisma.user.update({
          where: { id: user.id },
          data: { referredBy: referrer.id },
        });

        // Referral bonus is now handled by Backend ReferralService
        // to implement weekly limits and proper validation
        console.log(
          `✅ Referral linked: ${referrer.email} referred ${user.email} (points handled by Backend)`
        );
      } else {
        console.log(`⚠️ Referral code not found: ${referralCode}`);
      }
    } catch (error) {
      console.error('❌ Error processing referral:', error);
      // Don't throw error, just log it - user registration should still succeed
    }
  }

  // Return user without password
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...userWithoutPassword } = user;

  return NextResponse.json({
    message: 'User created successfully',
    user: userWithoutPassword,
  });
}
