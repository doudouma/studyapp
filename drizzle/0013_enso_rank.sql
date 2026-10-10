CREATE TABLE `enso_rank` (
        `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        `name` text NOT NULL,
        `score` integer NOT NULL,
        `passed` integer DEFAULT 0 NOT NULL,
        `avg` integer DEFAULT 0 NOT NULL,
        `player_key` text NOT NULL,
        `created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_enso_rank_score` ON `enso_rank` (`score`);--> statement-breakpoint
CREATE INDEX `idx_enso_rank_player` ON `enso_rank` (`player_key`);
