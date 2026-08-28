import { prisma } from "../config/db.js";
import { AppError } from "../utils/app-error.js";

export async function getPublicCreatorProfile(username: string) {
  const creator = await prisma.creator.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      displayName: true,
      bio: true,
      avatarUrl: true,
    },
  });

  if (!creator) {
    throw AppError.notFound("Creator not found");
  }

  return creator;
}

export interface UpdateCreatorProfileInput {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  mobileMoneyNetwork?: "MTN" | "MPS";
  mobileMoneyNumber?: string;
}

export async function updateCreatorProfile(creatorId: string, input: UpdateCreatorProfileInput) {
  return prisma.creator.update({
    where: { id: creatorId },
    data: input,
    select: {
      id: true,
      username: true,
      displayName: true,
      bio: true,
      avatarUrl: true,
      mobileMoneyNetwork: true,
      mobileMoneyNumber: true,
    },
  });
}
