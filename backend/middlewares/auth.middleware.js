import jwt from "jsonwebtoken";
import { prisma } from "../db.js";
// FIX: hapus import bcrypt — gak dipakai

export const protect = async (req, res, next) => {
  try {
    const { token } = req.cookies; // mengambil token dari cookies

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token tidak valid", // FIX: hapus spasi ganda
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // memverifikasi token

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId, // FIX: decoded.userId
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    req.user = user; // menyimpan data user ke dalam objek request
    next(); // melanjutkan ke controller
  } catch (error) {
    console.error("Auth error:", error);

    // FIX: bedakan error token invalid vs server error
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token tidak valid atau sudah kadaluarsa",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
