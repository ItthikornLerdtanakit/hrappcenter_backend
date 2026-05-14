# HR APP CENTER — Backend API

**RESTful API Server สำหรับระบบศูนย์กลางแอปพลิเคชัน HR**
Nok Airlines Public Company Limited

---

## 1. บทนำ

Backend API Server พัฒนาด้วย Node.js และ Express Framework ทำหน้าที่เป็น RESTful API สำหรับให้บริการข้อมูลแก่ Frontend Application รวมถึงจัดการการเชื่อมต่อฐานข้อมูล MySQL, การยืนยันตัวตนด้วย JWT และการตรวจสอบสิทธิ์ผู้ใช้งานผ่าน Microsoft Azure AD

---

## 2. เทคโนโลยีที่ใช้ (Tech Stack)

| เทคโนโลยี | เวอร์ชัน | วัตถุประสงค์ |
|---|---|---|
| Node.js + Express | 5.1.0 | Web Framework |
| MySQL2 | 3.15.2 | Database Driver (Connection Pool) |
| JSON Web Token | 9.0.2 | Authentication & Authorization |
| Express Rate Limit | 8.1.0 | API Rate Limiting & DDoS Protection |
| CORS | 2.8.5 | Cross-Origin Resource Sharing |
| dotenv | 17.2.3 | Environment Variables Management |
| body-parser | — | Request Body Parsing |

---

## 3. โครงสร้างโปรเจกต์ (Project Structure)

```
EXPRESS_BACKEND/
├── index.js                      # Application Entry Point (Port 5500)
├── .env                          # Environment Variables (ห้าม commit)
├── .env.local                    # Environment Variables (Local Override)
├── .gitignore
├── package.json
└── component/
    ├── connectdatabase.js        # MySQL Connection Pool
    └── select.js                 # SELECT Query Handlers (Login, Application)
```

---

## 4. ข้อกำหนดเบื้องต้น (Prerequisites)

| รายการ | เวอร์ชันขั้นต่ำ |
|---|---|
| Node.js | >= 18.x |
| MySQL Server | >= 8.0 |
| npm | >= 9.x |

---

## 5. การติดตั้ง (Installation)

```bash
cd EXPRESS_BACKEND
npm install
```

---

## 6. การตั้งค่า Environment Variables

สร้างไฟล์ `.env` ในโฟลเดอร์ `EXPRESS_BACKEND/` ตามรูปแบบด้านล่าง:

```env
# Application
IPADDRESS = '<cors_allowed_origin>'

# Security Keys
SECRET_KEY = '<jwt_signing_secret>'

# Database Configuration
DB_HOST = 'localhost'
DB_USER = '<database_username>'
DB_PASS = '<database_password>'
DB_EMPLOYEE = 'employee_nokair'
DB_TIMEZONE = '+07:00'

# API Route Definitions
LOGIN = '/api/login'
GET_APPLICATION = '/api/get_application'
```

> **คำเตือน:** ไฟล์ `.env` มีข้อมูลที่เป็นความลับ ห้ามเผยแพร่หรือ commit ลง Repository โดยเด็ดขาด

---

## 7. การรันระบบ (Running the Server)

```bash
# Development
node index.js

# Server จะเริ่มทำงานที่ http://localhost:5500
```

เมื่อเริ่มทำงาน Server จะทดสอบการเชื่อมต่อฐานข้อมูลอัตโนมัติ:
```
Connection Success | DB: Employee
Server Running On URL http://localhost:5500
```

---

## 8. ฐานข้อมูล (Database)

ระบบใช้ MySQL Connection Pool เชื่อมต่อกับฐานข้อมูล:

| Connection Pool | ฐานข้อมูล | คำอธิบาย |
|---|---|---|
| `connectdatabase` | `employee_nokair` | ข้อมูลพนักงาน แผนก กลุ่มผู้ใช้ และแอปพลิเคชัน |

### ตารางที่เกี่ยวข้อง

| ตาราง | คำอธิบาย |
|---|---|
| `employees` | ข้อมูลพนักงาน (อีเมล, OID, สถานะ, ตำแหน่ง) |
| `departments` | ข้อมูลแผนก |
| `applications` | รายการแอปพลิเคชันในระบบ |
| `groups` | กลุ่มสิทธิ์การเข้าถึง |
| `grouplists` | ความสัมพันธ์ระหว่างกลุ่มกับพนักงาน |

---

## 9. API Endpoints

**Base URL:** `http://localhost:5500/api`

### 9.1 Authentication

| Method | Endpoint | คำอธิบาย |
|---|---|---|
| POST | `/api/login` | เข้าสู่ระบบด้วยอีเมลและ OID จาก Azure AD, ออก JWT Token |

**Request Body:**
```json
{
  "email": "user@nokair.com",
  "oid": "<azure_ad_object_id>"
}
```

**Response:**
```json
{
  "login": "success",
  "token": "<jwt_token>"
}
```

### 9.2 Application Management

| Method | Endpoint | คำอธิบาย |
|---|---|---|
| POST | `/api/get_application` | ดึงรายการแอปพลิเคชันตามสิทธิ์ของผู้ใช้ |

**Request Body:**
```json
{
  "emp_id": 1,
  "emp_usertype": "admin"
}
```

**Logic:**
- **Admin**: ดึงแอปพลิเคชันทั้งหมด
- **User ทั่วไป**: ดึงเฉพาะแอปพลิเคชันที่อยู่ในกลุ่มที่พนักงานมีสิทธิ์เข้าถึง

---

## 10. ความปลอดภัย (Security)

| มาตรการ | รายละเอียด |
|---|---|
| **JWT Authentication** | ใช้ JSON Web Token สำหรับยืนยันตัวตน (หมดอายุ 1 ชั่วโมง) |
| **Rate Limiting** | จำกัด 100 requests ต่อ 15 นาที ต่อ IP Address (รองรับ IPv4/IPv6) |
| **CORS** | อนุญาตเฉพาะ Origin ที่กำหนดใน Environment Variables |
| **x-powered-by Disabled** | ปิด Header เพื่อซ่อนข้อมูล Server Technology |
| **Trust Proxy** | ตั้งค่า `trust proxy: loopback` สำหรับ Reverse Proxy |
| **Parameterized Queries** | ใช้ Prepared Statements เพื่อป้องกัน SQL Injection |
| **Environment Variables** | ข้อมูลที่เป็นความลับทั้งหมดเก็บในไฟล์ `.env` |

---

## 11. สถาปัตยกรรม (Architecture)

```
Client (Frontend)
    │
    ▼
┌────────────────────────────┐
│  Express Server (Port 5500)│
│  ┌──────────────────────┐  │
│  │  Rate Limiter        │  │
│  │  CORS Middleware      │  │
│  │  Body Parser          │  │
│  └──────────────────────┘  │
│           │                │
│  ┌────────┴────────┐      │
│  │  Route Handlers  │      │
│  │  ├─ /api/login   │      │
│  │  └─ /api/get_app │      │
│  └────────┬────────┘      │
│           │                │
│  ┌────────┴────────────┐  │
│  │  Component Layer     │  │
│  │  ├─ select.js        │  │
│  │  └─ connectdatabase  │  │
│  └────────┬────────────┘  │
│           │                │
│  ┌────────┴────────────┐  │
│  │  MySQL Connection    │  │
│  │  Pool (1 DB)         │  │
│  └─────────────────────┘  │
└────────────────────────────┘
    │
    ▼
employee_nokair
```

---

> **HR People and Administration**
> Nok Airlines Public Company Limited
>
> ปรับปรุงล่าสุด: พฤษภาคม 2569 (May 2026)
