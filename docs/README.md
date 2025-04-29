# Hệ Thống Quản Lý Đặt Phòng Họp

Đây là tài liệu mô tả chi tiết về cấu trúc cơ sở dữ liệu của hệ thống quản lý đặt phòng họp, được xây dựng bằng Prisma ORM với PostgreSQL.

## Cấu Trúc Cơ Sở Dữ Liệu

### Phân Quyền (ROLE)

```
enum ROLE {
  USER
  MANAGER
  ADMIN
}
```

Hệ thống có 3 cấp độ phân quyền:

- USER: Người dùng thông thường
- MANAGER: Quản lý
- ADMIN: Quản trị viên

### Người Dùng (User)

Quản lý thông tin người dùng trong hệ thống.

- Thông tin cơ bản: họ tên, tên đăng nhập, mật khẩu
- Thông tin bổ sung: ảnh đại diện, cấp độ, điểm kinh nghiệm
- Quan hệ:
  - Thuộc về một phòng ban (Department)
  - Có thể tạo nhiều lịch đặt phòng (Booking)
  - Có thể tham gia nhiều cuộc họp (BookingAttendee)
  - Có các thông báo (Notification)
  - Có lịch sử hoạt động (AuditLog)

### Phòng Ban (Department)

Quản lý cấu trúc tổ chức theo phòng ban.

- Thông tin: mã code, tên phòng ban, trạng thái, mô tả
- Quan hệ:
  - Thuộc về một chi nhánh (Branch)
  - Có nhiều nhân viên (User)

### Chi Nhánh (Branch)

Quản lý thông tin các chi nhánh của tổ chức.

- Thông tin: mã code, tên chi nhánh, trạng thái, mô tả
- Quan hệ:
  - Có nhiều phòng ban (Department)

### Phòng Họp (Room)

Quản lý thông tin các phòng họp.

- Thông tin: tên phòng, sức chứa, tầng, trạng thái, mô tả
- Quan hệ:
  - Có nhiều tiện nghi (RoomFacility)
  - Có nhiều lịch đặt phòng (Booking)

### Tiện Nghi Phòng Họp (RoomFacility)

Quản lý các trang thiết bị và tiện nghi trong phòng họp.

- Thông tin: tên tiện nghi, số lượng, trạng thái, mô tả
- Quan hệ:
  - Thuộc về một phòng họp (Room)

### Đặt Phòng (Booking)

Quản lý thông tin đặt phòng họp.

- Thông tin: tiêu đề, thời gian bắt đầu, thời gian kết thúc, trạng thái, mô tả
- Quan hệ:
  - Được tạo bởi một người dùng (User)
  - Thuộc về một phòng họp (Room)
  - Có nhiều người tham gia (BookingAttendee)

### Người Tham Gia Họp (BookingAttendee)

Quản lý thông tin người tham gia cuộc họp.

- Thông tin: trạng thái tham gia
- Quan hệ:
  - Liên kết với một lịch đặt phòng (Booking)
  - Liên kết với một người dùng (User)

### Thông Báo (Notification)

Quản lý thông báo cho người dùng.

- Thông tin: loại thông báo, nội dung, trạng thái đã đọc
- Quan hệ:
  - Thuộc về một người dùng (User)

### Nhật Ký Hoạt Động (AuditLog)

Ghi lại lịch sử các hoạt động trong hệ thống.

- Thông tin: hành động, đối tượng tác động, chi tiết
- Quan hệ:
  - Được tạo bởi một người dùng (User)

### Cấu Hình (Configuration)

Quản lý các cấu hình hệ thống.

- Thông tin: tên cấu hình, giá trị, trạng thái, mô tả

## Đặc Điểm Chung

- Tất cả các model đều có:
  - ID duy nhất (UUID)
  - Trường trạng thái (status)
  - Thời gian tạo (createdAt)
  - Thời gian cập nhật (updatedAt)
- Sử dụng soft delete thông qua trường status
- Theo dõi người tạo/cập nhật cho các model quan trọng
