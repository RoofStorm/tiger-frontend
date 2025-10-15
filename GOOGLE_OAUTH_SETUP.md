# Google OAuth Setup Guide

## Bước 1: Tạo Google OAuth App

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Vào **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth 2.0 Client IDs**
5. Chọn **Web application**
6. Thêm **Authorized redirect URIs**:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)

## Bước 2: Cấu hình Environment Variables

Tạo file `.env.local` trong thư mục `tiger-frontend`:

```env
# NextAuth.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth Configuration
OAUTH_GOOGLE_CLIENT_ID=your-google-client-id
OAUTH_GOOGLE_CLIENT_SECRET=your-google-client-secret

# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/tiger_db"
```

## Bước 3: Cập nhật Database Schema

Đảm bảo database đã có các bảng cần thiết cho NextAuth.js:

```sql
-- Bảng users đã có sẵn
-- Bảng accounts (cho OAuth)
CREATE TABLE accounts (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Bảng sessions (cho session management)
CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  session_token TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL,
  expires TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Bảng verification_tokens (cho email verification)
CREATE TABLE verification_tokens (
  id SERIAL PRIMARY KEY,
  identifier TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Bước 4: Test Google Login

1. Khởi động ứng dụng:

   ```bash
   cd tiger-frontend
   npm run dev
   ```

2. Truy cập `http://localhost:3000/auth/login`
3. Click "Đăng nhập với Google"
4. Chọn tài khoản Google để đăng nhập
5. Kiểm tra database để xem user mới được tạo

## Tính năng Google Login

- **Tự động tạo user**: User mới sẽ được tạo tự động khi đăng nhập lần đầu
- **Daily login bonus**: Tự động nhận 50 điểm khi đăng nhập hàng ngày
- **Avatar sync**: Avatar từ Google sẽ được sync vào hệ thống
- **Login method tracking**: Ghi nhận phương thức đăng nhập (GOOGLE)

## Troubleshooting

### Lỗi "redirect_uri_mismatch"

- Kiểm tra Authorized redirect URIs trong Google Console
- Đảm bảo URL chính xác: `http://localhost:3000/api/auth/callback/google`

### Lỗi "invalid_client"

- Kiểm tra GOOGLE_CLIENT_ID và GOOGLE_CLIENT_SECRET
- Đảm bảo environment variables được load đúng

### Lỗi database

- Kiểm tra DATABASE_URL
- Đảm bảo các bảng NextAuth.js đã được tạo
- Chạy migration nếu cần

## Security Notes

- Không commit file `.env.local` vào git
- Sử dụng HTTPS trong production
- Rotate client secret định kỳ
- Giới hạn Authorized redirect URIs
