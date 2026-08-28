import type { Request, Response } from "express";
import { sendSuccess } from "../utils/reponse.js";
import { AppError } from "../utils/app-error.js";
import { createTip, getTipStatus, listTipsForCreator } from "../services/tip.services.js";
import type { CreateTipInput } from "../schemas/tip.schema.js";

export async function createTipHandler(req: Request, res: Response) {
  const result = await createTip(req.params.username as string, req.body as CreateTipInput);
  sendSuccess(res, result, 201);
}

export async function getTipStatusHandler(req: Request, res: Response) {
  const status = await getTipStatus(req.params.id as string);
  sendSuccess(res, status);
}

export async function listMyTips(req: Request, res: Response) {
  if (!req.creator) throw AppError.unauthorized();
  const tips = await listTipsForCreator(req.creator.id);
  sendSuccess(res, tips);
}
