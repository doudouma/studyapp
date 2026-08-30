/// <reference types="@cloudflare/workers-types" />
import { nanoid } from "nanoid";
import { eq, and, isNull } from "drizzle-orm";
import { createDb } from "../../db";
import { apiKey, user } from "../../db/schema";

// Key format: 100m_<32hex>  (36 chars total)
const KEY_PREFIX = "100m_";
const KEY_RANDOM_LEN = 32;
const MAX_KEYS_PER_USER = 10;

function generateRawKey(): string {
  const chars = "0123456789abcdef";
  let rand = "";
  const bytes = crypto.getRandomValues(new Uint8Array(KEY_RANDOM_LEN));
  for (const b of bytes) rand += chars[b >> 4] + chars[b & 0xf];
  return KEY_PREFIX + rand;
}

async function sha256hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Result returned on key creation (raw key shown once). */
export interface CreatedApiKey {
  id: string;
  key: string; // raw key — shown once
  name: string;
  prefix: string;
  createdAt: Date;
  lastUsedAt: null;
}

/** Public info for listing keys (no hash, no raw key). */
export interface ApiKeyInfo {
  id: string;
  name: string;
  prefix: string;
  createdAt: Date;
  lastUsedAt: Date | null;
}

/**
 * Create a new API key for the given user.
 * Returns the raw key ONCE; only the SHA-256 hash is stored.
 */
export async function createApiKey(
  d1: D1Database,
  userId: string,
  name: string,
): Promise<CreatedApiKey> {
  const db = createDb(d1);

  // Check per-user limit
  const existing = await db
    .select({ id: apiKey.id })
    .from(apiKey)
    .where(and(eq(apiKey.userId, userId), isNull(apiKey.revokedAt)));
  if (existing.length >= MAX_KEYS_PER_USER) {
    throw new Error(`最多允许 ${MAX_KEYS_PER_USER} 个活跃密钥`);
  }

  const rawKey = generateRawKey();
  const keyHash = await sha256hex(rawKey);
  const id = nanoid(12);
  const prefix = rawKey.slice(0, 8);
  const now = new Date();

  await db.insert(apiKey).values({
    id,
    userId,
    name: name || "unnamed",
    keyHash,
    prefix,
    createdAt: now,
  });

  return { id, key: rawKey, name: name || "unnamed", prefix, createdAt: now, lastUsedAt: null };
}

/** List all non-revoked keys for a user. Returns empty list if table doesn't exist. */
export async function listApiKeys(
  d1: D1Database,
  userId: string,
): Promise<ApiKeyInfo[]> {
  const db = createDb(d1);
  try {
    const rows = await db
      .select({
        id: apiKey.id,
        name: apiKey.name,
        prefix: apiKey.prefix,
        createdAt: apiKey.createdAt,
        lastUsedAt: apiKey.lastUsedAt,
      })
      .from(apiKey)
      .where(and(eq(apiKey.userId, userId), isNull(apiKey.revokedAt)))
      .orderBy(apiKey.createdAt);
    return rows;
  } catch {
    // Table may not exist if migration hasn't been applied
    return [];
  }
}

/** Revoke (soft-delete) an API key. Returns true if a key was revoked. */
export async function revokeApiKey(
  d1: D1Database,
  userId: string,
  keyId: string,
): Promise<boolean> {
  const db = createDb(d1);
  const result = await db
    .update(apiKey)
    .set({ revokedAt: new Date() })
    .where(and(eq(apiKey.id, keyId), eq(apiKey.userId, userId), isNull(apiKey.revokedAt)))
    .returning({ id: apiKey.id });
  return result.length > 0;
}

/**
 * Validate a raw API key and return the associated user.
 * Returns null if the key is invalid, revoked, the user no longer exists,
 * or the api_key table hasn't been created yet.
 */
export async function getUserByApiKey(
  d1: D1Database,
  rawKey: string,
): Promise<{ id: string; name: string; email: string; image: string | undefined; role: string } | null> {
  const db = createDb(d1);
  const keyHash = await sha256hex(rawKey);

  // Find the key record (not revoked)
  const [keyRow] = await db
    .select()
    .from(apiKey)
    .where(and(eq(apiKey.keyHash, keyHash), isNull(apiKey.revokedAt)))
    .limit(1);

  if (!keyRow) return null;

  // Look up the user
  const [userRow] = await db
    .select()
    .from(user)
    .where(eq(user.id, keyRow.userId))
    .limit(1);

  if (!userRow) return null;

  // Update lastUsedAt (fire-and-forget — don't block on failure)
  db.update(apiKey)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKey.id, keyRow.id))
    .execute()
    .catch(() => {});

  return {
    id: userRow.id,
    name: userRow.name,
    email: userRow.email,
    image: userRow.image ?? undefined,
    role: userRow.role,
  };
}
