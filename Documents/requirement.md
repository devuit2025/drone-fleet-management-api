# Ứng dụng Quản lý Drone Realtime

## Giới thiệu

Đây là một dự án mẫu được xây dựng để quản lý và giám sát các drone trong thời gian thực. Dự án sử dụng một bộ công nghệ hiện đại và mạnh mẽ để đảm bảo hiệu suất, khả năng mở rộng và dễ bảo trì.

- **Backend:** NestJS (TypeScript)
- **Frontend:** ReactJS (TypeScript)
- **Cơ sở dữ liệu:** PostgreSQL
- **Realtime:** Socket.io
- **ORM:** TypeORM
- **Quản lý môi trường:** Docker Compose (cho môi trường local)

## Tính năng chính

- **Theo dõi vị trí drone:** Hiển thị vị trí trực tiếp của drone trên bản đồ.
- **Quản lý trạng thái:** Cập nhật trạng thái pin, tốc độ và các thông số khác của drone.
- **Lộ trình bay:** Xem lại lịch sử đường đi của drone.
- **Xác thực người dùng:** Đăng nhập an toàn để truy cập hệ thống.
- **Cập nhật các pháp lí, luật pháp về Drone ở các nước**
- **API Documentation:** Tự động tạo tài liệu API với Swagger.

## Cài đặt và chạy dự án (Local)

### Yêu cầu

- [Docker](https://www.docker.com/) và [Docker Compose](https://docs.docker.com/compose/) đã được cài đặt.

### Các bước thực hiện

1.  **Clone dự án:**

    ```bash
    git clone [đường_dẫn_repository_của_bạn]
    cd [tên_thư_mục_dự_án]
    ```

2.  **Thiết lập môi trường:**

    - Tạo file `.env` trong thư mục `backend` dựa trên `.env.example`.
    - Cấu hình kết nối cơ sở dữ liệu PostgreSQL.

3.  **Chạy dịch vụ với Docker Compose:**

    ```bash
    docker-compose up --build
    ```

    Lệnh này sẽ xây dựng và khởi động các container cho cả backend, frontend và cơ sở dữ liệu.

4.  **Truy cập ứng dụng:**
    - **Backend API:** `http://localhost:3000`
    - **Frontend:** `http://localhost:5173`
    - \*\*Swagger UI (API Docs):: `http://localhost:3000/api-docs`

## Repository Pattern

Dự án áp dụng **Repository Pattern** ở mức cơ bản để tách biệt logic truy cập dữ liệu ra khỏi business logic. Điều này giúp code sạch hơn, dễ kiểm thử và thay đổi ORM (nếu cần) trong tương lai. Các repository được định nghĩa trong thư mục `src/repositories/` và được tiêm vào các service thông qua Dependency Injection của NestJS.

## Đóng góp

Bạn có thể đóng góp cho dự án bằng cách mở một **issue** hoặc gửi **pull request**.

## Cấu trúc của api

.
├── src/
│ ├── entities/ # Định nghĩa các model dữ liệu với TypeORM
│ ├── repositories/ # Triển khai Repository pattern cơ bản
│ ├── modules/ # Các module chức năng (users, drones, etc.)
│ ├── gateways/ # Xử lý kết nối Socket.io
│ ├── main.ts
│ └── ...
├── Dockerfile
└── docker-compose.yml
