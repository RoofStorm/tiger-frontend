# 🚀 Hướng dẫn sử dụng Ngrok cho Facebook OAuth

## 📋 Tổng quan

Ngrok là công cụ tạo tunnel để expose local server ra Internet, cho phép Facebook gọi đến localhost từ server của họ.

## 🔧 Cài đặt Ngrok

### 1. Cài đặt qua npm (đã thực hiện):

```bash
npm install -g ngrok
```

### 2. Đăng ký tài khoản ngrok:

- Truy cập: https://dashboard.ngrok.com/signup
- Tạo tài khoản miễn phí

### 3. Lấy authtoken:

- Đăng nhập vào dashboard
- Vào: https://dashboard.ngrok.com/get-started/your-authtoken
- Copy authtoken

### 4. Cấu hình authtoken:

```bash
ngrok config add-authtoken YOUR_AUTHTOKEN_HERE
```

## 🚀 Sử dụng Ngrok

### 1. Start ngrok cho frontend (port 3000):

```bash
ngrok http 3000
```

### 2. Lấy public URL:

- Mở trình duyệt: http://localhost:4040
- Hoặc chạy lệnh:

```bash
curl -s http://localhost:4040/api/tunnels | python3 -c "import sys, json; data=json.load(sys.stdin); print('Ngrok URL:', data['tunnels'][0]['public_url'] if data['tunnels'] else 'No tunnels')"
```

### 3. URLs cho Facebook App:

**Valid OAuth Redirect URIs:**

```
https://YOUR-NGROK-URL.ngrok-free.dev/api/auth/callback/facebook
```

**Data Deletion Callback URL:**

```
https://YOUR-NGROK-URL.ngrok-free.dev/api/facebook/data-deletion
```

**Privacy Policy URL:**

```
https://YOUR-NGROK-URL.ngrok-free.dev/api/facebook/privacy-policy
```

## 🔍 Kiểm tra trạng thái

### 1. Kiểm tra ngrok đang chạy:

```bash
curl -s http://localhost:4040/api/tunnels
```

### 2. Test API endpoints:

```bash
# Test Data Deletion API
curl -s https://YOUR-NGROK-URL.ngrok-free.dev/api/facebook/data-deletion

# Test Privacy Policy API
curl -I https://YOUR-NGROK-URL.ngrok-free.dev/api/facebook/privacy-policy
```

## ⚠️ Lưu ý quan trọng

### 1. Ngrok URL thay đổi:

- **Free plan**: URL thay đổi mỗi lần restart ngrok
- **Paid plan**: Có thể giữ URL cố định

### 2. Giữ ngrok chạy:

- **Phải giữ ngrok chạy** trong khi test Facebook login
- Nếu tắt ngrok, Facebook sẽ không thể gọi đến localhost

### 3. Chỉ dùng cho development:

- **Không dùng cho production**
- Chỉ dùng để test OAuth locally

## 🛠️ Troubleshooting

### 1. Lỗi "authentication failed":

```bash
# Kiểm tra authtoken
ngrok config check

# Cấu hình lại authtoken
ngrok config add-authtoken YOUR_AUTHTOKEN
```

### 2. Lỗi "tunnel not found":

```bash
# Kiểm tra ngrok đang chạy
curl -s http://localhost:4040/api/tunnels

# Restart ngrok
pkill ngrok
ngrok http 3000
```

### 3. Facebook không thể gọi đến ngrok:

- Kiểm tra ngrok URL có đúng không
- Kiểm tra frontend có đang chạy port 3000 không
- Kiểm tra API endpoints có hoạt động không

## 📱 Cấu hình Facebook App

### 1. Vào Facebook Developers:

- https://developers.facebook.com/apps/
- Chọn app của bạn

### 2. Cấu hình OAuth Redirect URIs:

- Vào "Facebook Login" → "Settings"
- Thêm: `https://YOUR-NGROK-URL.ngrok-free.dev/api/auth/callback/facebook`

### 3. Cấu hình Data Deletion Callback URL:

- Vào "App Review" → "Permissions and Features"
- Thêm: `https://YOUR-NGROK-URL.ngrok-free.dev/api/facebook/data-deletion`

### 4. Cấu hình Privacy Policy URL:

- Vào "App Review" → "Permissions and Features"
- Thêm: `https://YOUR-NGROK-URL.ngrok-free.dev/api/facebook/privacy-policy`

## 🔄 Quy trình test hoàn chỉnh

### 1. Start các services:

```bash
# Terminal 1: Start backend
cd tiger-backend
npm run start:dev

# Terminal 2: Start frontend
cd tiger-frontend
npm run dev

# Terminal 3: Start ngrok
ngrok http 3000
```

### 2. Lấy ngrok URL và cấu hình Facebook App

### 3. Test Facebook login:

- Truy cập: http://localhost:3000/auth/login
- Click "Đăng nhập với Facebook"
- Kiểm tra login thành công

### 4. Kiểm tra avatar hiển thị:

- Vào profile page
- Kiểm tra Facebook avatar có load được không

## 📞 Hỗ trợ

Nếu gặp vấn đề:

1. Kiểm tra ngrok status: http://localhost:4040
2. Kiểm tra frontend logs
3. Kiểm tra Facebook App configuration
4. Restart tất cả services nếu cần

---

**Lưu ý**: Ngrok free plan có giới hạn bandwidth và số lượng requests. Nếu cần test nhiều, hãy cân nhắc upgrade lên paid plan.
