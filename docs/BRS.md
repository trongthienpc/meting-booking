# Tài Liệu Đặc Tả Yêu Cầu Nghiệp Vụ (BRS)

## 1. Giới Thiệu

### 1.1 Mục Tiêu

Xây dựng hệ thống quản lý đặt phòng họp nhằm:

- Tối ưu hóa việc sử dụng tài nguyên phòng họp
- Giảm thiểu xung đột lịch họp
- Tăng cường minh bạch trong quá trình đặt phòng
- Cải thiện trải nghiệm người dùng

### 1.2 Phạm Vi

- Quản lý toàn bộ quy trình đặt và sử dụng phòng họp
- Tích hợp với hệ thống quản lý nhân sự hiện có
- Theo dõi và báo cáo việc sử dụng phòng họp

## 2. Yêu Cầu Nghiệp Vụ Chi Tiết

### 2.1 Quản Lý Người Dùng

#### 2.1.1 Phân Quyền

- **Admin**

  - Quản lý toàn bộ hệ thống
  - Phân quyền người dùng
  - Xem báo cáo tổng quan

- **Quản Lý**

  - Phê duyệt đặt phòng
  - Quản lý phòng họp
  - Xem báo cáo phòng ban

- **Nhân Viên**
  - Đặt phòng họp
  - Xem lịch phòng trống
  - Tham gia cuộc họp

#### 2.1.2 Quy Trình Xác Thực

1. Đăng nhập qua tài khoản công ty
2. Kiểm tra quyền truy cập
3. Ghi log hoạt động

### 2.2 Quản Lý Phòng Họp

#### 2.2.1 Thông Tin Phòng

- Tên phòng
- Sức chứa
- Vị trí (tầng)
- Tiện nghi có sẵn
- Trạng thái hiện tại

#### 2.2.2 Quy Định Sử Dụng

- Thời gian đặt tối thiểu: 30 phút
- Thời gian đặt tối đa: 8 giờ
- Đặt trước tối đa: 30 ngày
- Hủy đặt: trước 24 giờ

### 2.3 Quy Trình Đặt Phòng

#### 2.3.1 Đặt Phòng Thông Thường

1. Kiểm tra phòng trống
2. Điền thông tin cuộc họp
   - Tiêu đề
   - Thời gian bắt đầu/kết thúc
   - Số người tham gia
   - Tiện nghi cần thiết
3. Chọn người tham gia
4. Gửi yêu cầu đặt phòng
5. Nhận xác nhận

#### 2.3.2 Đặt Phòng Định Kỳ

1. Chọn tần suất (hàng ngày/tuần/tháng)
2. Xác định thời gian lặp lại
3. Kiểm tra xung đột
4. Xác nhận đặt phòng

### 2.4 Quy Trình Phê Duyệt

#### 2.4.1 Điều Kiện Phê Duyệt

- Cuộc họp > 4 giờ
- Số người > 20
- Ngoài giờ làm việc
- Cuối tuần/ngày lễ

#### 2.4.2 Các Bước Phê Duyệt

1. Quản lý nhận thông báo
2. Xem xét yêu cầu
3. Phê duyệt/từ chối/yêu cầu điều chỉnh
4. Thông báo kết quả

### 2.5 Quản Lý Thông Báo

#### 2.5.1 Loại Thông Báo

- Xác nhận đặt phòng
- Nhắc nhở cuộc họp
- Thay đổi lịch họp
- Yêu cầu phê duyệt
- Kết quả phê duyệt

#### 2.5.2 Kênh Thông Báo

- Email công ty
- Thông báo trong ứng dụng
- Calendar invite

### 2.6 Báo Cáo & Thống Kê

#### 2.6.1 Báo Cáo Định Kỳ

- Tần suất sử dụng phòng
- Thời gian sử dụng trung bình
- Tỷ lệ đặt/hủy phòng
- Phòng họp phổ biến

#### 2.6.2 Phân Tích Xu Hướng

- Thời điểm cao điểm
- Nhu cầu theo phòng ban
- Dự báo nhu cầu

## 3. Ràng Buộc & Giới Hạn

### 3.1 Ràng Buộc Kỹ Thuật

- Tương thích với hệ thống hiện có
- Đáp ứng yêu cầu bảo mật
- Khả năng mở rộng

### 3.2 Ràng Buộc Nghiệp Vụ

- Tuân thủ quy định công ty
- Phù hợp quy trình làm việc
- Đảm bảo tính minh bạch

## 4. Yêu Cầu Tích Hợp

### 4.1 Hệ Thống Nội Bộ

- Hệ thống quản lý nhân sự
- Email công ty
- Lịch làm việc

### 4.2 Dịch Vụ Bên Ngoài

- Google Calendar
- Microsoft Teams
- Slack

## 5. Quy Trình Triển Khai

### 5.1 Giai Đoạn Thử Nghiệm

1. Triển khai cho nhóm thử nghiệm
2. Thu thập phản hồi
3. Điều chỉnh hệ thống

### 5.2 Triển Khai Chính Thức

1. Đào tạo người dùng
2. Chuyển đổi dữ liệu
3. Go-live từng phần
4. Theo dõi và hỗ trợ
