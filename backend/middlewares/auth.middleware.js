import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "../db.js";

export const protect = async (req, res, next) => {
  try {
    const { token } = req.cookies; // mengambil token dari cookies

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "anda belum login",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // memverifikasi token

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "token tidak valid",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.id, // findOne mengambil satu data berdasarkan primary key (id)
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user tidak ditemukan",
      });
    }

    req.user = user; // menyimpan data user ke dalam objek request
    next(); // melanjutkan ke controller
  } catch (error) {
    console.error("error : ", error);
    res.status(500).json({ message: "internal server error" });
  }
};
