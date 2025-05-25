import jwt from "jsonwebtoken";
import cookie from "cookie";

export function verifyAuth(cookieString, jwtSecret) {
  if (!cookieString) return false;

  try {
    const cookies = cookie.parse(cookieString);
    const token = cookies.token;

    if (!token) return false;

    jwt.verify(token, jwtSecret);
    return true;
  } catch (err) {
    console.error("verifyAuth error:", err);
    return false;
  }
}
