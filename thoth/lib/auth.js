import jwt from "jsonwebtoken";
import cookie from "cookie";

export function verifyAuth(cookieString, jwtSecret) {
  if (!cookieString) return false;

  const cookies = cookie.parse(cookieString);
  const token = cookies.token;

  if (!token) return false;

  try {
    jwt.verify(token, jwtSecret);
    return true;
  } catch {
    return false;
  }
}
