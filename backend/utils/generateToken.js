// Membuat "tiket digital" (JWT token) yang berisi ID user, supaya server bisa mengenali siapa yang sedang login di request berikutnya.

import jwt from "jsonwebtoken";

export const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};
