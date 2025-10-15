# Facebook OAuth Setup Guide

## 1. Tạo Facebook App

1. Truy cập [Facebook Developers](https://developers.facebook.com/)
2. Đăng nhập bằng tài khoản Facebook của bạn
3. Click "My Apps" → "Create App"
4. Chọn "Consumer" hoặc "Other" làm loại app
5. Điền thông tin:
   - **App Name**: Tiger App
   - **App Contact Email**: your-email@example.com
   - **App Purpose**: Authentication

## 2. Cấu hình Facebook App

### 2.1. Thông tin bắt buộc cho Facebook App

Trước khi cấu hình, bạn cần chuẩn bị:

**📱 App Icon (1024 x 1024):**

- File: `public/logo-1024x1024.svg` (đã tạo sẵn)
- Hoặc tạo logo riêng với kích thước 1024x1024 pixels

**🔒 Privacy Policy URL:**

- URL: `http://localhost:3000/privacy-policy.html`
- File: `public/privacy-policy.html` (đã tạo sẵn)

**🗑️ Data Deletion Instructions URL:**

- URL: `http://localhost:3000/data-deletion.html`
- File: `public/data-deletion.html` (đã tạo sẵn)

**📂 Category:**

- Chọn: **Entertainment** hoặc **Social**

### 2.2. Thêm Facebook Login Product

1. Trong App Dashboard, click "Add Product"
2. Tìm "Facebook Login" và click "Set Up"
3. Chọn "Web" platform

### 2.3. Cấu hình OAuth Redirect URIs

1. Vào "Facebook Login" → "Settings"
2. Thêm các Valid OAuth Redirect URIs:
   ```
   http://localhost:3000/api/auth/callback/facebook
   http://localhost:3001/api/auth/callback/facebook
   http://localhost:3002/api/auth/callback/facebook
   http://localhost:3004/api/auth/callback/facebook
   ```

### 2.4. Cấu hình App Domains

1. Vào "Settings" → "Basic"
2. Thêm App Domains:
   ```
   localhost
   ```

### 2.5. Lấy App ID và App Secret

1. Vào "Settings" → "Basic"
2. Copy **App ID** và **App Secret**

## 3. Cập nhật Environment Variables

Thêm vào file `.env.local`:

```env
# OAuth Facebook
OAUTH_FACEBOOK_CLIENT_ID="your-facebook-app-id"
OAUTH_FACEBOOK_CLIENT_SECRET="your-facebook-app-secret"
```

## 4. Cấu hình Permissions

### 4.1. Request Permissions

Trong Facebook Login settings, thêm các permissions:

- `email` - Để lấy email
- `public_profile` - Để lấy tên và ảnh đại diện

### 4.2. App Review (Optional)

- Nếu app ở chế độ Development, chỉ có thể đăng nhập với tài khoản admin/developer
- Để public, cần submit App Review

## 5. Test Facebook Login

1. Start frontend: `npm run dev`
2. Vào trang login: `http://localhost:3000/auth/login`
3. Click "Đăng nhập với Facebook"
4. Kiểm tra console logs để debug

## 6. Troubleshooting

### Lỗi "App Not Setup"

- Kiểm tra App ID và App Secret
- Đảm bảo App đã được publish (nếu cần)

### Lỗi "Invalid OAuth Redirect URI"

- Kiểm tra redirect URI trong Facebook App settings
- Đảm bảo port khớp với NEXTAUTH_URL

### Lỗi "App Not Available"

- App có thể đang ở chế độ Development
- Thêm tài khoản test vào App Roles

## 7. Production Setup

Khi deploy production:

1. Thêm production domain vào App Domains
2. Thêm production redirect URI
3. Submit App Review nếu cần
4. Cập nhật environment variables với production values
