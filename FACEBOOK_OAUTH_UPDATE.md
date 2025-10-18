# 🔄 Cập nhật Facebook OAuth với Ngrok URL mới

## 🌐 Ngrok URL hiện tại:

```
https://nonnomadically-remittent-abrielle.ngrok-free.dev
```

## 📋 Các URL cần cập nhật trong Facebook App:

### 1. **OAuth Redirect URIs:**

```
https://nonnomadically-remittent-abrielle.ngrok-free.dev/api/auth/callback/facebook
```

### 2. **Privacy Policy URL:**

```
https://nonnomadically-remittent-abrielle.ngrok-free.dev/api/facebook/privacy-policy
```

### 3. **Data Deletion Callback URL:**

```
https://nonnomadically-remittent-abrielle.ngrok-free.dev/api/facebook/data-deletion
```

### 4. **App Domains:**

```
nonnomadically-remittent-abrielle.ngrok-free.dev
```

## 🔧 Các bước cập nhật:

### Bước 1: Truy cập Facebook Developers

1. Vào https://developers.facebook.com/
2. Chọn App của bạn
3. Vào **Facebook Login** > **Settings**

### Bước 2: Cập nhật Valid OAuth Redirect URIs

1. Thêm URL: `https://nonnomadically-remittent-abrielle.ngrok-free.dev/api/auth/callback/facebook`
2. Xóa URL cũ nếu có
3. Nhấn **Save Changes**

### Bước 3: Cập nhật App Settings

1. Vào **Settings** > **Basic**
2. Cập nhật **Privacy Policy URL**: `https://nonnomadically-remittent-abrielle.ngrok-free.dev/api/facebook/privacy-policy`
3. Cập nhật **Data Deletion Callback URL**: `https://nonnomadically-remittent-abrielle.ngrok-free.dev/api/facebook/data-deletion`
4. Cập nhật **App Domains**: `nonnomadically-remittent-abrielle.ngrok-free.dev`

### Bước 4: Test Facebook Login

1. Truy cập: `https://nonnomadically-remittent-abrielle.ngrok-free.dev/auth/login`
2. Nhấn nút "Đăng nhập với Facebook"
3. Kiểm tra xem có redirect đúng không

## 🚨 Lưu ý quan trọng:

### Ngrok URL thay đổi mỗi lần restart:

- **Free plan**: URL thay đổi mỗi lần restart ngrok
- **Paid plan**: Có thể giữ URL cố định

### Nếu URL thay đổi:

1. Chạy lại: `ngrok http 3000`
2. Lấy URL mới: `curl -s http://localhost:4040/api/tunnels | jq -r '.tunnels[0].public_url'`
3. Cập nhật lại Facebook App với URL mới

## 🔍 Kiểm tra kết nối:

### Test API endpoints:

```bash
# Test privacy policy
curl https://nonnomadically-remittent-abrielle.ngrok-free.dev/api/facebook/privacy-policy

# Test data deletion
curl https://nonnomadically-remittent-abrielle.ngrok-free.dev/api/facebook/data-deletion

# Test homepage
curl https://nonnomadically-remittent-abrielle.ngrok-free.dev/
```

### Test Facebook Login:

1. Vào: `https://nonnomadically-remittent-abrielle.ngrok-free.dev/auth/login`
2. Nhấn "Đăng nhập với Facebook"
3. Kiểm tra popup Facebook
4. Kiểm tra redirect về app

## 📱 Test trên mobile:

- URL ngrok hoạt động trên cả desktop và mobile
- Test trên điện thoại để đảm bảo responsive

## 🎯 Kết quả mong đợi:

- ✅ Facebook login popup mở được
- ✅ Redirect về app sau khi login
- ✅ User được tạo trong database
- ✅ Avatar Facebook hiển thị đúng
- ✅ Daily login bonus được cộng (50 điểm)
