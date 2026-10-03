import bcrypt from "bcryptjs";

import { prisma } from "../db.js"; // FIX: tambah .js
import { generateToken } from "../utils/generateToken.js"; // FIX: tambah .js

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body; // FIX: username -> name (sesuaikan schema)
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "tidak boleh kosong wajib di isi" });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      // FIX: hapus "!" karena logika sebelumnya terbalik
      return res.status(400).json({ message: "email sudah terdaftar" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // FIX: whitelist role biar user gak bisa kirim "ADMIN" dari body
    const allowedRoles = ["CUSTOMER", "RESTAURANT_OWNER"];
    const finalRole = allowedRoles.includes(role) ? role : "CUSTOMER";

    const user = await prisma.user.create({
      data: {
        name, // FIX: username -> name
        email,
        password: hashedPassword,
        role: finalRole, // FIX: pakai role yang sudah di-whitelist
      },
    });

    const token = generateToken(user.id);

    res.cookie("token", token, {
      httpOnly: true, // cookies tidak bisa diakses oleh javascript
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari
      sameSite: "strict", //cookies hanya bisa diakses oleh domain yang sama
      secure: process.env.NODE_ENV === "production", // cookies hanya bisa diakses oleh domain yang sama
    });

    res.status(201).json({
      success: true,
      message: "user berhasil terdaftar",
      user: {
        id: user.id,
        name: user.name, // FIX: username -> name
        email: user.email,
        role: user.role,
      },
      // FIX: hapus "token" dari response body — udah dikirim lewat cookie
      // (mengirim token di body = celah XSS, karena bisa dibaca JS)
    });
  } catch (error) {
    console.error("error : ", error);
    res.status(500).json({ message: "internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "email dan password wajib diisi",
      });
    }

    // FIX: tambah "await" — kalau gak, user = Promise, bukan object
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      // FIX: pesan jangan bocorkan info (email terdaftar atau tidak)
      return res.status(401).json({
        success: false,
        message: "email atau password salah",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password); // membandingkan sandi yang diinput dengan sandi yang ada di database
    if (!isPasswordValid) {
      // FIX: pesan disamakan biar konsisten & gak bocorkan info
      return res.status(401).json({ success: false, message: "email atau password salah" });
    }

    const token = generateToken(user.id); //membuat token

    res.cookie("token", token, {
      httpOnly: true, // cookies tidak bisa diakses oleh javascript
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari
      sameSite: "strict", //cookies hanya bisa diakses oleh domain yang sama
      secure: process.env.NODE_ENV === "production", // cookies hanya bisa diakses oleh domain yang sama
    });

    res.status(200).json({
      success: true,
      message: "login berhasil",
      user: {
        id: user.id,
        name: user.name, // FIX: username -> name
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("error : ", error);
    res.status(500).json({ message: "internal server error" });
  }
};

export const logOut = async (req, res) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
    });

    res.status(200).json({
      success: true,
      message: "logout berhasil",
    });
  } catch (error) {
    console.error("error : ", error);
    res.status(500).json({ message: "internal server error" });
  }
};

export const getMe = async (req, res) => {
  try {
    // FIX: hapus console.log (buat debugging, jangan di production)
    // FIX: jangan kirim req.user mentah — berisi password hash
    res.status(200).json({
      success: true,
      user: {
        id: req.user.id,
        name: req.user.name, // FIX: username -> name
        email: req.user.email,
        role: req.user.role,
        avatar: req.user.avatar,
        createdAt: req.user.createdAt,
      },
    });
  } catch (error) {
    console.error("error : ", error);
    res.status(500).json({ message: "internal server error" });
  }
};
