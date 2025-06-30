# Hướng dẫn Hệ thống Phân quyền (Authorization)

## Tổng quan

Hệ thống phân quyền của DocBao API sử dụng JWT tokens và role-based access control (RBAC) để bảo vệ các endpoint. Có 2 loại role chính:

- **USER**: Người dùng thường
- **ADMIN**: Quản trị viên

## Cách hoạt động

### 1. Authentication Flow
1. User đăng nhập qua `/api/auth/login`
2. Server trả về JWT token
3. Client gửi token trong header `Authorization: Bearer <token>`
4. Middleware kiểm tra và decode token
5. Nếu token hợp lệ, thông tin user được gắn vào `req.user`

### 2. Authorization Flow
1. Sau khi authentication thành công, middleware phân quyền kiểm tra role
2. Nếu user có quyền → tiếp tục xử lý request
3. Nếu user không có quyền → trả về lỗi 403 Forbidden

## Middleware có sẵn

### `authenticateToken`
- **Mục đích**: Kiểm tra JWT token
- **Response codes**: 
  - 401: Không có token
  - 403: Token không hợp lệ

### `requireRole(allowedRoles[])`
- **Mục đích**: Kiểm tra role linh hoạt
- **Parameters**: Array các role được phép
- **Response codes**:
  - 401: Chưa authenticate
  - 403: Không có quyền truy cập

### `requireAdmin`
- **Mục đích**: Chỉ cho phép ADMIN
- **Alias**: `requireRole(['ADMIN'])`

### `requireUser`
- **Mục đích**: Cho phép cả USER và ADMIN
- **Alias**: `requireRole(['USER', 'ADMIN'])`

### `requireUserOnly`
- **Mục đích**: Chỉ cho phép USER
- **Alias**: `requireRole(['USER'])`

## Cách sử dụng trong Routes

```typescript
import { authenticateToken, requireAdmin, requireUser, requireRole } from '../middleware/auth';

// Endpoint chỉ dành cho ADMIN
router.get('/admin-only', authenticateToken, requireAdmin, controllerFunction);

// Endpoint cho cả USER và ADMIN
router.get('/user-admin', authenticateToken, requireUser, controllerFunction);

// Endpoint chỉ dành cho USER
router.get('/user-only', authenticateToken, requireUserOnly, controllerFunction);

// Endpoint với role tùy chỉnh
router.get('/custom', authenticateToken, requireRole(['ADMIN', 'MODERATOR']), controllerFunction);
```

## Response Format

### Success Response (200)
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Unauthorized Error (401)
```json
{
  "success": false,
  "message": "Access token is required",
  "error": "UNAUTHORIZED"
}
```

### Forbidden Error (403)
```json
{
  "success": false,
  "message": "Access denied. Required roles: ADMIN. Your role: USER",
  "error": "FORBIDDEN",
  "requiredRoles": ["ADMIN"],
  "userRole": "USER"
}
```

## Testing với Swagger

1. Truy cập: `http://localhost:3000/api-docs`
2. Click "Authorize" button (🔒)
3. Nhập token: `Bearer <your-jwt-token>`
4. Test các endpoint

## Testing với Script

Chạy file test để kiểm tra hệ thống phân quyền:

```bash
node test-authorization.js
```

Script này sẽ:
- Login với admin và user
- Test các endpoint với quyền khác nhau
- Hiển thị kết quả chi tiết

## Ví dụ thực tế

### Scenario 1: User cố gắng truy cập admin endpoint
```bash
# User login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "user123"
}

# User cố gắng truy cập admin endpoint
GET /api/users
Authorization: Bearer <user-token>

# Response: 403 Forbidden
{
  "success": false,
  "message": "Access denied. Required roles: ADMIN. Your role: USER",
  "error": "FORBIDDEN",
  "requiredRoles": ["ADMIN"],
  "userRole": "USER"
}
```

### Scenario 2: Admin truy cập admin endpoint
```bash
# Admin login
POST /api/auth/login
{
  "email": "admin@example.com",
  "password": "admin123"
}

# Admin truy cập admin endpoint
GET /api/users
Authorization: Bearer <admin-token>

# Response: 200 Success
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [...]
}
```

## Bảo mật

- JWT tokens có thời hạn
- Tokens được lưu trữ an toàn (không trong localStorage)
- Role được kiểm tra ở backend, không tin tưởng frontend
- Tất cả sensitive endpoints đều có authentication
- Error messages không tiết lộ thông tin nhạy cảm

## Mở rộng

Để thêm role mới:
1. Cập nhật `UserPayload` interface trong `src/types/index.ts`
2. Thêm role vào database schema
3. Tạo middleware mới hoặc sử dụng `requireRole()`
4. Cập nhật Swagger documentation 