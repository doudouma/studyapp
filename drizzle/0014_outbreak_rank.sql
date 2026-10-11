CREATE TABLE `outbreak_rank` (
        `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        `name` text NOT NULL,
        `score` integer NOT NULL,
        `delivered` integer DEFAULT 0 NOT NULL,
        `time_sec` integer DEFAULT 0 NOT NULL,
        `player_key` text NOT NULL,
        `created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_outbreak_rank_score` ON `outbreak_rank` (`score`);--> statement-breakpoint
CREATE INDEX `idx_outbreak_rank_player` ON `outbreak_rank` (`player_key`);
