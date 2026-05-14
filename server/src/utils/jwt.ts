import jwt from "jsonwebtoken";

interface JwtPayload {
  userId: string;
  role: string;
}

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN as string;

export function generateToken(payload: JwtPayload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: (JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"]) || "1d",
  });
}