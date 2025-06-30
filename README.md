# DocBao Backend API

Backend API cho ứng dụng đọc báo với Express, TypeScript và Prisma ORM.

## 🚀 Cài đặt

### 1. Cài đặt dependencies

```bash
npm install
```

### 2. Cài đặt Docker và PostgreSQL

Đảm bảo bạn đã cài đặt Docker và Docker Compose.

Chạy PostgreSQL container:

```bash
docker-compose up -d
```

### 3. Cấu hình môi trường

Tạo file `.env` từ file `env.example`:

```bash
cp env.example .env
```

Chỉnh sửa các biến môi trường trong file `.env` nếu cần.

### 4. Khởi tạo database

```bash
# Generate Prisma client
npm run prisma:generate

# Tạo migration và áp dụng vào database
npm run prisma:migrate
```

### 5. Chạy ứng dụng

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

## 📊 API Endpoints

### Health Check
- `GET /health` - Kiểm tra trạng thái API
- `GET /test-db` - Kiểm tra kết nối database

## 🗄️ Database Schema

### Users
- `id` - ID duy nhất
- `email` - Email (unique)
- `phone` - Số điện thoại (optional, unique)
- `password` - Mật khẩu đã hash
- `fullName` - Họ tên
- `avatar` - URL avatar (optional)
- `role` - Vai trò (USER/ADMIN)
- `isActive` - Trạng thái hoạt động
- `createdAt` - Thời gian tạo
- `updatedAt` - Thời gian cập nhật

### Articles
- `id` - ID duy nhất
- `title` - Tiêu đề bài viết
- `content` - Nội dung bài viết
- `summary` - Tóm tắt (optional)
- `imageUrl` - URL hình ảnh (optional)
- `authorId` - ID tác giả
- `category` - Danh mục (optional)
- `tags` - Tags (array)
- `isPublished` - Trạng thái xuất bản
- `publishedAt` - Thời gian xuất bản (optional)
- `viewCount` - Số lượt xem
- `createdAt` - Thời gian tạo
- `updatedAt` - Thời gian cập nhật

### Comments
- `id` - ID duy nhất
- `content` - Nội dung comment
- `userId` - ID người comment
- `articleId` - ID bài viết
- `parentId` - ID comment cha (optional, cho reply)
- `createdAt` - Thời gian tạo
- `updatedAt` - Thời gian cập nhật

### OtpCodes
- `id` - ID duy nhất
- `email` - Email
- `code` - Mã OTP
- `expiresAt` - Thời gian hết hạn
- `isUsed` - Đã sử dụng chưa
- `createdAt` - Thời gian tạo

## 🛠️ Scripts

- `npm run dev` - Chạy development server
- `npm run build` - Build production
- `npm run start` - Chạy production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Tạo và áp dụng migration
- `npm run prisma:studio` - Mở Prisma Studio
- `npm run prisma:seed` - Chạy seed data

## 📝 Roadmap

### ✅ Giai đoạn 1: Khởi tạo
- [x] Docker PostgreSQL
- [x] Dự án TypeScript + Express
- [x] Cấu hình Prisma ORM

### 🔄 Giai đoạn 2: Auth & Phân quyền
- [ ] API đăng ký gửi OTP
- [ ] Xác thực OTP và tạo user
- [ ] API đăng nhập + tạo JWT
- [ ] Middleware kiểm JWT và kiểm quyền admin

### ⏳ Giai đoạn 3: Bài viết và Người dùng
- [ ] CRUD bài viết (Admin)
- [ ] GET bài viết có filter, sort, pagination
- [ ] Admin gán quyền admin và xoá user

### ⏳ Giai đoạn 4: Swagger + Seed + Testing
- [ ] Tạo swagger.yaml
- [ ] Script seed Prisma
- [ ] Test API bằng Swagger 