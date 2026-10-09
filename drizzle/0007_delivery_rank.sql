CREATE TABLE `delivery_rank` (
        `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        `diff` text NOT NULL,
        `name` text NOT NULL,
        `score` integer NOT NULL,
        `delivered` integer DEFAULT 0 NOT NULL,
        `combo` integer DEFAULT 0 NOT NULL,
        `player_key` text NOT NULL,
        `created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_delivery_rank_diff_score` ON `delivery_rank` (`diff`,`score`);--> statement-breakpoint
CREATE INDEX `idx_delivery_rank_player` ON `delivery_rank` (`player_key`);
