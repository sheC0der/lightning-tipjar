import bcrypt from "bcryptjs";
import { prisma } from "../config/db.js";
import { AppError } from "../utils/app-error.js";
import { signAuthToken } from "../middleware/auth.middlware.js";
import type { LoginInput, RegisterInput } from "../schemas/auth.schema.js";

const SALT_ROUNDS = 10;

export interface AuthResult {
  token: string;
  creator: {
    id: string;
    username: string;
    displayName: string;
    email: string;
  };
}

export async function registerCreator(input: RegisterInput): Promise<AuthResult> {
  const existing = await prisma.creator.findFirst({
    where: { OR: [{ email: input.email }, { username: input.username }] },
  });

  if (existing) {
    throw AppError.conflict(
      existing.email === input.email ? "Email is already registered" : "Username is already taken",
    );
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  const creator = await prisma.creator.create({
    data: {
      username: input.username,
      email: input.email,
      passwordHash,
      displayName: input.displayName,
      bio: input.bio ?? null,
      mobileMoneyNetwork: input.mobileMoneyNetwork,
      mobileMoneyNumber: input.mobileMoneyNumber,
    },
  });

  const token = signAuthToken({ id: creator.id, username: creator.username });

  return {
    token,
    creator: {
      id: creator.id,
      username: creator.username,
      displayName: creator.displayName,
      email: creator.email,
    },
  };
}

export async function loginCreator(input: LoginInput): Promise<AuthResult> {
  const creator = await prisma.creator.findUnique({ where: { email: input.email } });

  if (!creator) {
    throw AppError.unauthorized("Invalid email or password");
  }

  const passwordMatches = await bcrypt.compare(input.password, creator.passwordHash);

  if (!passwordMatches) {
    throw AppError.unauthorized("Invalid email or password");
  }

  const token = signAuthToken({ id: creator.id, username: creator.username });

  return {
    token,
    creator: {
      id: creator.id,
      username: creator.username,
      displayName: creator.displayName,
      email: creator.email,
    },
  };
}

export async function getCreatorById(id: string) {
  const creator = await prisma.creator.findUnique({ where: { id } });

  if (!creator) {
    throw AppError.notFound("Creator not found");
  }

  return creator;
}
