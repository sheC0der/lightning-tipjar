import type { Request, Response } from "express";
import { AppError } from "../utils/app-error.js";
import { logger } from "../utils/logger.js";
import { createLnurlInvoice, getLnurlPayParams } from "../services/lnurl.services.js";

function sendLnurlError(res: Response, err: unknown) {
  const reason = err instanceof AppError ? err.message : "Unable to process this request";
  if (!(err instanceof AppError)) {
    logger.error("Unhandled LNURL error", { error: err instanceof Error ? err.message : String(err) });
  }
  res.status(200).json({ status: "ERROR", reason });
}

export async function lnurlPayParamsHandler(req: Request, res: Response) {
  try {
    const username = req.params.username as string;
    const callbackUrl = `${req.protocol}://${req.get("host")}/lnurlp/${username}/callback`;
    const params = await getLnurlPayParams(username, callbackUrl);
    res.status(200).json(params);
  } catch (err) {
    sendLnurlError(res, err);
  }
}

export async function lnurlPayCallbackHandler(req: Request, res: Response) {
  try {
    const username = req.params.username as string;
    const amountMsats = Number(req.query.amount);

    if (!Number.isFinite(amountMsats)) {
      throw AppError.badRequest("Missing or invalid amount parameter");
    }

    const { paymentRequest } = await createLnurlInvoice(username, amountMsats);
    res.status(200).json({ pr: paymentRequest, routes: [] });
  } catch (err) {
    sendLnurlError(res, err);
  }
}
