CREATE TABLE `api_key` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`key_hash` text NOT NULL,
	`prefix` text NOT NULL,
	`created_at` integer NOT NULL,
	`last_used_at` integer,
	`revoked_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `api_key_key_hash_unique` ON `api_key` (`key_hash`);--> statement-breakpoint
CREATE TABLE `upload_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text,
	`page_id` text NOT NULL,
	`event` text NOT NULL,
	`content_type` text,
	`is_anonymous` integer DEFAULT false NOT NULL,
	`ip` text,
	`file_size` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_upload_log_user` ON `upload_log` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_upload_log_time` ON `upload_log` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_upload_log_event` ON `upload_log` (`event`);--> statement-breakpoint
CREATE TABLE `wardrobe_outfit` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`occasion` text,
	`item_ids` text NOT NULL,
	`image_url` text,
	`status` text DEFAULT 'planned' NOT NULL,
	`error` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `user` ADD `points` integer DEFAULT 50 NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `links_limit_bonus` integer DEFAULT 0 NOT NULL;