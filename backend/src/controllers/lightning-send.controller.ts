import type { Request, Response } from "express";
import { sendSuccess } from "../utils/reponse.js";
import { AppError } from "../utils/app-error.js";
import { listLightningSendsForCreator, requestLightningSend } from "../services/lightning-send.services.js";
import type { CreateLightningSendInput } from "../schemas/lightning-send.schema.js";

export async function createLightningSendHandler(req: Request, res: Response) {
  if (!req.creator) throw AppError.unauthorized();
  const send = await requestLightningSend(req.creator.id, req.body as CreateLightningSendInput);
  sendSuccess(res, send, 201);
}

export async function listMyLightningSends(req: Request, res: Response) {
  if (!req.creator) throw AppError.unauthorized();
  const sends = await listLightningSendsForCreator(req.creator.id);
  sendSuccess(res, sends);
}
