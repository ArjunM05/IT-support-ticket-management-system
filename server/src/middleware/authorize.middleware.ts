import { NextFunction, Response } from "express";
import { AuthRequest } from "./auth.middleware";

export function authorize(...roles: string[]) {
  return (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden! You cannot access this page.",
      });
    }

    next();
  };
}