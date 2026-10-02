// Membuat "tiket digital" (JWT token) yang berisi ID user, supaya server bisa mengenali siapa yang sedang login di request berikutnya.

import jwt from "jsonwebtoken";

export const generateToken = async (user) => {
  return jwt.sign({ user }, process.env.JWT_SECRET, { expiresIn: "7d" });
};
