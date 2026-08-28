import type { Request, Response } from "express";
import { sendSuccess } from "../utils/reponse.js";
import { AppError } from "../utils/app-error.js";
import { getPublicCreatorProfile, updateCreatorProfile } from "../services/creator.services.js";

export async function getCreatorByUsername(req: Request, res: Response) {
  const creator = await getPublicCreatorProfile(req.params.username as string);
  sendSuccess(res, { ...creator, lightningAddress: `${creator.username}@${req.get("host")}` });
}

export async function updateMyProfile(req: Request, res: Response) {
  if (!req.creator) throw AppError.unauthorized();
  const updated = await updateCreatorProfile(req.creator.id, req.body);
  sendSuccess(res, { ...updated, lightningAddress: `${updated.username}@${req.get("host")}` });
}
