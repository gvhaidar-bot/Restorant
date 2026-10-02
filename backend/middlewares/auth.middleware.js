import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "../db.js";
export const protect = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = prisma.user.findUnique({
      where: {
        id: decoded.userId,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("error : ", error);
    return res.status(401).json({
      success: false,
      message: "invalid token",
    });
  }
};
