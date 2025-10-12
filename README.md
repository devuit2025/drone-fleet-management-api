# Drone Fleet Management API

Ứng dụng quản lý và giám sát drone thời gian thực với NestJS, TypeScript, PostgreSQL và Socket.io.

## Tính năng chính

- **Quản lý Drone**: CRUD operations cho drone với theo dõi vị trí real-time
- **Quản lý Flight**: Lập kế hoạch, theo dõi và quản lý các chuyến bay
- **Theo dõi Flight Path**: Lưu trữ và hiển thị đường đi của drone
- **Xác thực người dùng**: JWT authentication với role-based access
- **Real-time Updates**: Socket.io cho cập nhật vị trí và trạng thái real-time
- **API Documentation**: Swagger UI tự động

## Công nghệ sử dụng

- **Backend**: NestJS (TypeScript)
- **Database**: PostgreSQL với TypeORM
- **Real-time**: Socket.io
- **Authentication**: JWT với Passport
- **Documentation**: Swagger/OpenAPI
- **Containerization**: Docker & Docker Compose

## Cài đặt và chạy

### Yêu cầu

- Node.js >= 18
- Docker & Docker Compose
- npm hoặc yarn

### Cách 1: Sử dụng Docker Compose (Khuyến nghị)

1. Clone repository:

```bash
git clone <repository-url>
cd DroneFleetManagement-api
```

2. Tạo file environment:

```bash
cp env.example .env
# Chỉnh sửa các giá trị trong .env nếu cần
```

3. Chạy với Docker Compose:

```bash
docker-compose up --build
```

### Cách 2: Chạy local development

1. Cài đặt dependencies:

```bash
npm install
```

2. Setup PostgreSQL database:

```bash
# Tạo database
createdb drone_fleet

# Hoặc sử dụng Docker cho PostgreSQL
docker run --name postgres -e POSTGRES_DB=drone_fleet -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15-alpine
```

3. Tạo file environment:

```bash
cp env.example .env
```

4. Chạy migration (tự động với TypeORM synchronize):

```bash
npm run start:dev
```

## Truy cập ứng dụng

- **API**: http://localhost:3000
- **Swagger Documentation**: http://localhost:3000/api-docs
- **Socket.io**: ws://localhost:3000/drone
- **pgAdmin**: http://localhost:8081 (admin@admin.com / admin)

## Kết nối PostgreSQL

### Thông tin kết nối

- **Host**: localhost
- **Port**: 5434 (Docker) hoặc 5432 (local)
- **Database**: drone_fleet
- **Username**: postgres
- **Password**: postgres

### Kết nối bằng psql

```bash
# Kết nối từ host machine
psql -h localhost -p 5434 -U postgres -d drone_fleet

# Kết nối từ Docker container
docker exec -it drone_fleet_postgres psql -U postgres -d drone_fleet
```

### Kết nối bằng pgAdmin

1. Truy cập http://localhost:8081
2. Đăng nhập với:
   - **Email**: admin@admin.com
   - **Password**: admin
3. Thêm server mới:
   - **Name**: Drone Fleet DB
   - **Host**: postgres (hoặc localhost)
   - **Port**: 5432
   - **Username**: postgres
   - **Password**: postgres

## Database Seeding

### Chạy seeder

```bash
# Chạy seeder đầy đủ (không dùng faker)
docker exec drone_fleet_api npm run seed:no-faker

# Hoặc từ host machine
npm run seed:no-faker
```

### Dữ liệu được tạo

- **Users**: 4 người dùng mẫu (admin, operators, viewer)
- **Pilots**: 3 phi công
- **Licenses**: 3 giấy phép lái drone
- **Drones**: 3 drone mẫu
- **Missions**: 3 nhiệm vụ mẫu
- **Flight Logs**: 10 bản ghi log
- **Mission Reports**: 1 báo cáo nhiệm vụ
- **Simulations**: 3 mô phỏng

### Kiểm tra dữ liệu

```bash
# Xem số lượng bản ghi trong các bảng
docker exec drone_fleet_postgres psql -U postgres -d drone_fleet -c "
SELECT COUNT(*) as count, 'users' as table_name FROM users
UNION ALL SELECT COUNT(*) as count, 'pilots' as table_name FROM pilots
UNION ALL SELECT COUNT(*) as count, 'licenses' as table_name FROM licenses
UNION ALL SELECT COUNT(*) as count, 'drones' as table_name FROM drones
UNION ALL SELECT COUNT(*) as count, 'missions' as table_name FROM missions
UNION ALL SELECT COUNT(*) as count, 'flight_logs' as table_name FROM flight_logs
UNION ALL SELECT COUNT(*) as count, 'mission_reports' as table_name FROM mission_reports
UNION ALL SELECT COUNT(*) as count, 'simulations' as table_name FROM simulations
ORDER BY table_name;"
```

### Tài khoản mẫu

| Email                    | Password    | Role     |
| ------------------------ | ----------- | -------- |
| admin@dronefleet.com     | admin123    | Admin    |
| operator1@dronefleet.com | operator123 | Operator |
| operator2@dronefleet.com | operator123 | Operator |
| viewer1@dronefleet.com   | viewer123   | Viewer   |

## API Endpoints

### Authentication

- `POST /auth/register` - Đăng ký người dùng mới
- `POST /auth/login` - Đăng nhập

### Users

- `GET /users` - Lấy danh sách người dùng
- `POST /users` - Tạo người dùng mới
- `GET /users/:id` - Lấy thông tin người dùng
- `PATCH /users/:id` - Cập nhật người dùng
- `DELETE /users/:id` - Xóa người dùng

### Drones

- `GET /drones` - Lấy danh sách drone
- `POST /drones` - Tạo drone mới
- `GET /drones/:id` - Lấy thông tin drone
- `PATCH /drones/:id` - Cập nhật drone
- `PATCH /drones/:id/location` - Cập nhật vị trí drone
- `PATCH /drones/:id/status` - Cập nhật trạng thái drone
- `DELETE /drones/:id` - Xóa drone

### Flights

- `GET /flights` - Lấy danh sách chuyến bay
- `POST /flights` - Tạo chuyến bay mới
- `GET /flights/:id` - Lấy thông tin chuyến bay
- `PATCH /flights/:id` - Cập nhật chuyến bay
- `PATCH /flights/:id/start` - Bắt đầu chuyến bay
- `PATCH /flights/:id/end` - Kết thúc chuyến bay
- `POST /flights/:id/path-point` - Thêm điểm đường đi
- `GET /flights/:id/path` - Lấy đường đi của chuyến bay

## Socket.io Events

### Client → Server

- `drone:location_update` - Cập nhật vị trí drone
- `drone:status_update` - Cập nhật trạng thái drone
- `flight:path_point` - Thêm điểm đường đi
- `flight:start` - Bắt đầu chuyến bay
- `flight:end` - Kết thúc chuyến bay
- `join:drone` - Tham gia room theo dõi drone
- `join:flight` - Tham gia room theo dõi chuyến bay

### Server → Client

- `drone:location_updated` - Vị trí drone đã được cập nhật
- `drone:status_updated` - Trạng thái drone đã được cập nhật
- `flight:path_point_added` - Điểm đường đi đã được thêm
- `flight:started` - Chuyến bay đã bắt đầu
- `flight:ended` - Chuyến bay đã kết thúc

## Database Schema

### Users

- id (UUID)
- username (unique)
- email (unique)
- password (hashed)
- role (admin, operator, viewer)
- firstName, lastName
- isActive
- timestamps

### Drones

- id (UUID)
- name, model, serialNumber (unique)
- type (quadcopter, hexacopter, etc.)
- status (idle, flying, charging, maintenance, error)
- batteryLevel, latitude, longitude, altitude, speed
- maxFlightTime, maxPayloadWeight
- isActive, lastHeartbeat
- timestamps

### Flights

- id (UUID)
- name, description
- status (planned, in_progress, completed, cancelled, failed)
- plannedStartTime, actualStartTime, actualEndTime
- plannedDuration, actualDuration
- startLatitude, startLongitude, startAltitude
- endLatitude, endLongitude, endAltitude
- maxAltitude, totalDistance, averageSpeed
- weatherConditions, notes
- pilotId, droneId (foreign keys)
- timestamps

### Flight Paths

- id (UUID)
- latitude, longitude, altitude, speed
- batteryLevel, timestamp, sequence
- flightId (foreign key)
- timestamps

## Development

### Scripts

- `npm run start` - Chạy production
- `npm run start:dev` - Chạy development với watch mode
- `npm run start:debug` - Chạy development với debug mode
- `npm run build` - Build ứng dụng
- `npm run test` - Chạy tests
- `npm run lint` - Chạy ESLint
- `npm run seed:no-faker` - Chạy database seeder (không dùng faker)
- `npm run seed:simple` - Chạy seeder đơn giản

### Cấu trúc thư mục

```
src/
├── entities/          # TypeORM entities
├── repositories/      # Repository pattern implementation
├── modules/          # Feature modules
│   ├── auth/         # Authentication module
│   ├── users/        # Users module
│   ├── drones/       # Drones module
│   └── flights/      # Flights module
├── gateways/         # Socket.io gateways
├── seeders/          # Database seeders
│   ├── *.seeder.ts   # Individual entity seeders
│   ├── seeder.module.ts
│   └── seeder.service.ts
├── main.ts          # Application entry point
└── app.module.ts    # Root module
```

## Contributing

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## License

MIT License
