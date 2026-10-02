import bcrypt from "bcryptjs";
import {} from "";
import { prisma } from "../db";
import { generateToken } from "../utils/generateToken";

export const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password || !role) {
      return res
        .status(400)
        .json({ message: "tidak boleh kosong wajib di isi" });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (!existingUser) {
      return res.status(400).json({ message: "email sudah terdaftar" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role,
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
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token,
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

    const user = prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "email tidak terdaftar",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password); // membandingkan sandi yang diinput dengan sandi yang ada di database
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "sandi salah" });
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
        username: user.username,
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
