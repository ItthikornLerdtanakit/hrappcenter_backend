import express from 'express';
import cors from 'cors';
import bodyparser from 'body-parser';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { configDotenv } from 'dotenv';

import { login, get_application } from './component/select.js';

configDotenv();
const ipaddress = process.env.IPADDRESS;
const app = express();
const port = 5500;

app.set('trust proxy', 'loopback');

// -------------------------
//   RATE LIMIT ปลอดภัย IPv6
// -------------------------
// สร้าง Rate Limiter เพื่อลดการโจมตี DDoS
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 นาที
    max: 100, // จำกัดที่ 100 requests ต่อ 15 นาที
    keyGenerator: (req, res) => {
        // ใช้ helper ที่ถูกต้อง (รองรับ IPv6)
        let ip = ipKeyGenerator(req);
        // ถ้ามี port เช่น 10.1.1.5:54321 → remove port
        if (typeof ip === 'string' && ip.includes(':')) {
            // IPv4 + port (มีส่วนยาว 2 ส่วน เช่น 10.1.1.5:1234)
            if (ip.split(':').length === 2 && ip.includes('.')) {
                ip = ip.split(':')[0];
            }
        }
        return ip;
    },
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// -------------------------
// CORS
// -------------------------
app.use(cors({
    origin: ipaddress,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept']
}));
app.use(express.urlencoded({ extended: false }));
app.use(bodyparser.json());

// -------------------------
// ROUTES
// -------------------------
app.post(process.env.LOGIN, async (req, res) => {
    try {
        const result = await login(req.body);
        res.send(result);
    } catch (error) {
        console.error(error);
    }
});

app.post(process.env.GET_APPLICATION, async (req, res) => {
    try {
        const result = await get_application(req.body);
        res.send(result);
    } catch (error) {
        console.error(error);
    }
});

// -------------------------
// LISTEN
// -------------------------
app.listen(port, () => console.log(`Server Running On URL http://localhost:${port}`));