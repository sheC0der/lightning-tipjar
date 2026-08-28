import type { Request, Response } from "express";
import { sendSuccess } from "../utils/reponse.js";
import { AppError } from "../utils/app-error.js";
import {
  getCreatorBalance,
  listWithdrawalsForCreator,
  requestWithdrawal,
} from "../services/withdrawal.services.js";
import type { CreateWithdrawalInput } from "../schemas/withdrawal.schema.js";

export async function getMyBalance(req: Request, res: Response) {
  if (!req.creator) throw AppError.unauthorized();
  const balance = await getCreatorBalance(req.creator.id);
  sendSuccess(res, balance);
}

export async function createWithdrawalHandler(req: Request, res: Response) {
  if (!req.creator) throw AppError.unauthorized();
  const withdrawal = await requestWithdrawal(req.creator.id, req.body as CreateWithdrawalInput);
  sendSuccess(res, withdrawal, 201);
}

export async function listMyWithdrawals(req: Request, res: Response) {
  if (!req.creator) throw AppError.unauthorized();
  const withdrawals = await listWithdrawalsForCreator(req.creator.id);
  sendSuccess(res, withdrawals);
}
