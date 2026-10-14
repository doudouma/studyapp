import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// --- Better Auth tables (D1/SQLite compatible) ---

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  image: text("image"),
  role: text("role").notNull().default("user"),
  points: integer("points").notNull().default(50),
  linksLimitBonus: integer("links_limit_bonus").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp" }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp" }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// --- API keys ---

export const apiKey = sqliteTable("api_key", {
  id: text("id").primaryKey(),              // nanoid
  userId: text("user_id").notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),             // user label
  keyHash: text("key_hash").notNull().unique(), // SHA-256 hex
  prefix: text("prefix").notNull(),         // first 8 chars, for display
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  lastUsedAt: integer("last_used_at", { mode: "timestamp" }),
  revokedAt: integer("revoked_at", { mode: "timestamp" }),
});

// --- Custom app tables ---

export const page = sqliteTable("page", {
  id: text("id").primaryKey(),               // nanoid(7), same as R2 key
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  slug: text("slug").unique(),               // 自定义地址（/p/{slug}），空为随机 ID；R2 仍以 id 为 key
  title: text("title").default(""),
  category: text("category").default("general"),
  tags: text("tags").default(""),
  isPermanent: integer("is_permanent", { mode: "boolean" }).notNull().default(false),
  viewCount: integer("view_count").notNull().default(0),
  /** 最大访问次数；null = 不限次（∞）；一次性链接 = 1 */
  maxViews: integer("max_views"),
  /** 生命周期状态：active=正常，burned=已焚毁/已过期（内容已删，元数据留存） */
  state: text("state").notNull().default("active"),
  /** 焚毁原因：views=达访问上限，expired=到期，manual=手动 */
  burnReason: text("burn_reason"),
  burnedAt: integer("burned_at", { mode: "timestamp" }),
  /** 上传者指纹（SHA-256(ip|ua)，仅哈希，用于滥用处置） */
  uploaderFp: text("uploader_fp"),
  /** 主 HTML 内容哈希（SHA-256，用于滥用/去重关联） */
  contentHash: text("content_hash"),
  /** 上传时选择的到期预设：permanent|1h|1d|7d|30d|custom（用于分布统计） */
  expiryPreset: text("expiry_preset"),
  isSharedToSquare: integer("is_shared_to_square", { mode: "boolean" }).notNull().default(false),
  sharedAt: integer("shared_at", { mode: "timestamp" }),
  previewPath: text("preview_path"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }),
});

export const pomodoroSession = sqliteTable("pomodoro_session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  duration: integer("duration").notNull(),
  completedAt: integer("completed_at", { mode: "timestamp" }).notNull(),
});

export const membership = sqliteTable("membership", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" })
    .unique(),
  adminId: text("admin_id").references(() => user.id, { onDelete: "set null" }),
  startedAt: integer("started_at", { mode: "timestamp" }).notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// --- Wardrobe tables ---

export const wardrobeItem = sqliteTable("wardrobe_item", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  part: text("part").notNull(), // upperbody, wholebody_up, lowerbody, accessories_up, shoes
  color: text("color").notNull(),
  secondaryColor: text("secondary_color"),
  tags: text("tags"), // JSON array string
  imageUrl: text("image_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const wardrobeJob = sqliteTable("wardrobe_job", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("pending"), // pending, analyzing, generating, completed, failed
  originalImageUrl: text("original_image_url"),
  analysisResult: text("analysis_result"), // JSON string
  error: text("error"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const wardrobeOutfit = sqliteTable("wardrobe_outfit", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  occasion: text("occasion"), // casual, smart-casual, office, party, etc.
  itemIds: text("item_ids").notNull(), // JSON array of wardrobe_item IDs
  imageUrl: text("image_url"), // generated outfit image
  status: text("status").notNull().default("planned"), // planned, generating, completed, failed
  error: text("error"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// --- Upload logs ---

export const uploadLog = sqliteTable("upload_log", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id"),
  pageId: text("page_id").notNull(),
  event: text("event").notNull(),
  contentType: text("content_type"),
  isAnonymous: integer("is_anonymous", { mode: "boolean" }).notNull().default(false),
  ip: text("ip"),
  fileSize: integer("file_size"),
  status: text("status"),
  createdAt: integer("created_at").notNull(),
}, (t) => [
  index("idx_upload_log_user").on(t.userId),
  index("idx_upload_log_time").on(t.createdAt),
  index("idx_upload_log_event").on(t.event),
]);

export const scanLog = sqliteTable("scan_log", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  pageId: text("page_id").notNull(),
  status: text("status").notNull(),           // approved / blocked / error
  reason: text("reason"),                     // regex / phishing / ai
  threats: text("threats"),                   // 威胁详情 JSON
  htmlLength: integer("html_length"),
  isAnonymous: integer("is_anonymous", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at").notNull(),
}, (t) => [
  index("idx_scan_log_page").on(t.pageId),
  index("idx_scan_log_time").on(t.createdAt),
]);

// --- 到期/焚毁事件（KPI 埋点：选用到期分布、一次性占比、焚烧量） ---

export const burnEvent = sqliteTable("burn_event", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  pageId: text("page_id").notNull(),
  userId: text("user_id"),
  event: text("event").notNull(), // created | burned
  expiryPreset: text("expiry_preset"), // permanent|1h|1d|7d|30d|custom
  maxViews: integer("max_views"), // null = ∞
  isOneTime: integer("is_one_time", { mode: "boolean" }).notNull().default(false),
  burnReason: text("burn_reason"), // views|expired|manual
  viewCountAtBurn: integer("view_count_at_burn"),
  createdAt: integer("created_at").notNull(),
}, (t) => [
  index("idx_burn_event_time").on(t.createdAt),
  index("idx_burn_event_page").on(t.pageId),
]);

// --- Delivery Rush 排行榜 ---

export const deliveryRank = sqliteTable("delivery_rank", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  diff: text("diff").notNull(), // normal / hard / extreme
  name: text("name").notNull(),
  score: integer("score").notNull(),
  delivered: integer("delivered").notNull().default(0),
  combo: integer("combo").notNull().default(0),
  playerKey: text("player_key").notNull(), // 设备标识（X-Player-Key）
  createdAt: integer("created_at").notNull(),
}, (t) => [
  index("idx_delivery_rank_diff_score").on(t.diff, t.score),
  index("idx_delivery_rank_player").on(t.playerKey),
]);

// --- Enso (一笔禅圆) 排行榜 ---

export const ensoRank = sqliteTable("enso_rank", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  score: integer("score").notNull(),
  passed: integer("passed").notNull().default(0), // 结业时通过题数
  avg: integer("avg").notNull().default(0), // 结业时平均准确率（整数 %）
  playerKey: text("player_key").notNull(), // 设备标识（X-Player-Key）
  createdAt: integer("created_at").notNull(),
}, (t) => [
  index("idx_enso_rank_score").on(t.score),
  index("idx_enso_rank_player").on(t.playerKey),
]);

// --- Outbreak Delivery 排行榜 ---

export const outbreakRank = sqliteTable("outbreak_rank", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  score: integer("score").notNull(),
  delivered: integer("delivered").notNull().default(0),
  timeSec: integer("time_sec").notNull().default(0),
  playerKey: text("player_key").notNull(), // 设备标识（X-Player-Key）
  createdAt: integer("created_at").notNull(),
}, (t) => [
  index("idx_outbreak_rank_score").on(t.score),
  index("idx_outbreak_rank_player").on(t.playerKey),
]);
