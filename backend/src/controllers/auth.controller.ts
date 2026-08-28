import type { Request, Response } from "express";
import { sendSuccess } from "../utils/reponse.js";
import { AppError } from "../utils/app-error.js";
import { loginCreator, registerCreator, getCreatorById } from "../services/auth.services.js";
import type { RegisterInput, LoginInput } from "../schemas/auth.schema.js";

export async function register(req: Request, res: Response) {
  const result = await registerCreator(req.body as RegisterInput);
  sendSuccess(res, result, 201);
}

export async function login(req: Request, res: Response) {
  const result = await loginCreator(req.body as LoginInput);
  sendSuccess(res, result);
}

export async function me(req: Request, res: Response) {
  if (!req.creator) throw AppError.unauthorized();
  const creator = await getCreatorById(req.creator.id);
  sendSuccess(res, {
    id: creator.id,
    username: creator.username,
    email: creator.email,
    displayName: creator.displayName,
    bio: creator.bio,
    avatarUrl: creator.avatarUrl,
    mobileMoneyNetwork: creator.mobileMoneyNetwork,
    mobileMoneyNumber: creator.mobileMoneyNumber,
    lightningAddress: `${creator.username}@${req.get("host")}`,
  });
}
