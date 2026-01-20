# User Management Service

Service để quản lý người dùng trong hệ thống MentorLink.

## API Endpoints

**Base URL**: `/api/admin/user-management`

> **Lưu ý**: Tất cả các endpoint đều yêu cầu authentication token và role ADMIN.

### 1. Get All Users (với filter và pagination)
```javascript
import { getAllUsers } from '@/services/user';

// Lấy danh sách người dùng với filter
const response = await getAllUsers({
    keySearch: 'john',      // Tìm kiếm theo tên hoặc email
    roleId: 3,              // 1=ADMIN, 2=MODERATOR, 3=MENTOR, 4=CUSTOMER
    status: 1,              // 0=INACTIVE, 1=ACTIVE, 2=PENDING, 3=BLOCKED
    page: 1,                // Trang hiện tại (bắt đầu từ 1)
    size: 10                // Số items mỗi trang
});

// Response structure:
{
    respCode: "00",
    respMsg: "Success",
    data: {
        items: [
            {
                id: 1,
                email: "user@example.com",
                fullName: "John Doe",
                status: "ACTIVE"
            }
        ],
        totalPages: 5,
        totalElements: 50,
        currentPage: 1,
        pageSize: 10
    }
}
```

### 2. Get User By ID
```javascript
import { getUserById } from '@/services/user';

const response = await getUserById(1);

// Response structure:
{
    respCode: "00",
    respMsg: "Success",
    data: {
        id: 1,
        email: "user@example.com",
        fullName: "John Doe",
        status: "ACTIVE"
    }
}
```

### 3. Delete User
```javascript
import { deleteUser } from '@/services/user';

const response = await deleteUser(1);

// Response structure:
{
    respCode: "00",
    respMsg: "User deleted successfully",
    data: null
}
```

### 4. Get User Statistics
```javascript
import { getUserStatistics } from '@/services/user';

const response = await getUserStatistics();

// Response structure:
{
    respCode: "00",
    respMsg: "Success",
    data: {
        totalUsers: 1234,
        totalMentors: 89,
        totalMentorPending: 12,
        totalUserBlocked: 5
    }
}
```

## Role Mapping
- `ADMIN` = 1
- `MODERATOR` = 2
- `MENTOR` = 3
- `CUSTOMER` = 4

## Status Mapping
- `INACTIVE` = 0
- `ACTIVE` = 1
- `PENDING` = 2
- `BLOCKED` = 3

## Error Handling

Service sử dụng axios interceptor để tự động xử lý:
- Token refresh khi hết hạn
- Redirect to login khi unauthorized
- Response data extraction

Khi gọi API, bạn nên wrap trong try-catch:

```javascript
try {
    const response = await getAllUsers(params);
    // Handle success
    console.log(response.data);
} catch (error) {
    // Handle error
    console.error(error.respMsg || 'An error occurred');
}
```

## Usage in Component

Xem ví dụ tích hợp đầy đủ tại: `components/admin/UserManagement.jsx`
