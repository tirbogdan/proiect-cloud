import jwt from "jsonwebtoken";
import { parse } from "cookie";

export function verifyAuth(cookieString, jwtSecret) {
  if (!cookieString) return false;

  try {
    const cookies = parse(cookieString);
    const token = cookies.token;

    if (!token) return false;

    jwt.verify(token, jwtSecret);
    return true;
  } catch (err) {
    console.error("verifyAuth error:", err);
    console.error("cookieString", cookieString);
    return false;
  }
}
