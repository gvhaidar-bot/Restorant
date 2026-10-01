import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import compression from "compression";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
dotenv.config(); //Baca file .env di root project

const app = express(); //Bikin instance aplikasi Express. Semua middleware & route nanti ditempel ke app ini.
const PORT = process.env.PORT || 8000; //Kalau .env ada PORT, pakai itu. Kalau tidak, default 8000.

// middlewares
app.use(express.json()); //Parse body request dengan Content-Type: application/json.
app.use(express.urlencoded({ extended: true }));
app.use(cors()); //Izinkan semua domain akses API  (header Access-Control-Allow-Origin: *).
app.use(cookieParser()); //Parse header Cookie jadi objek req.cookies.

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev")); //Log setiap request ke terminal dengan format berwarna
}

app.get("/", (req, res) => {
  res.json({ success: true, message: "backend sedang berjalan" });
});

app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`port berjalan di ${PORT}`);
});
