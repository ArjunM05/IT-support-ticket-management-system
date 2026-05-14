import { Request, Response } from "express";

import { loginSchema } from "../validators/auth.validator";
import { loginUser } from "../services/auth.service";

export async function login(req: Request, res: Response) {
  try {
    const validatedData = loginSchema.parse(req.body);

    const result = await loginUser(
      validatedData.email,
      validatedData.password
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error: any) {
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
}