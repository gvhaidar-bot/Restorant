import bcrypt from "bcryptjs";
import { prisma } from "../db.js";
import { generateToken } from "../utils/generateToken.js";

export const registerUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password || !role) {
      return res.status(400).json({ success: false, message: "Semua field harus diisi" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email sudah terdaftar" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashPassword,
      },
    });

    const token = generateToken(newUser.id); //untuk user yang baru register, supaya dia gak perlu login ulang setiap kali akses halaman.

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Hanya kirim cookie melalui HTTPS di production
      sameSite: "strict", // Mencegah CSRF
      maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie berlaku selama 7 hari
    });

    res.status(201).json({
      success: true,
      message: "User berhasil didaftarkan",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};
