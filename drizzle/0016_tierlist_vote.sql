-- AI Tier List 社区投票：登录用户对固定主题榜逐工具投票
-- 一人一榜一工具一票（唯一约束兜底防刷），改票走 upsert 更新 tier/updated_at。
-- board 与 tool 的合法取值由 service 层按 shared/types/tierlist.ts 白名单校验，
-- 因此这里不加 CHECK 约束（白名单可能随主题扩展，改代码比改表轻）。
CREATE TABLE `tierlist_vote` (
        `id` text PRIMARY KEY NOT NULL,
        `user_id` text NOT NULL,
        `board` text NOT NULL,
        `tool` text NOT NULL,
        `tier` integer DEFAULT 0 NOT NULL,
        `created_at` integer NOT NULL,
        `updated_at` integer NOT NULL,
        FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_tierlist_vote_user_tool` ON `tierlist_vote` (`user_id`,`board`,`tool`);--> statement-breakpoint
CREATE INDEX `idx_tierlist_vote_board` ON `tierlist_vote` (`board`,`tool`);
