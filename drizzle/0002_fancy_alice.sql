ALTER TABLE `page` ADD `is_shared_to_square` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `page` ADD `shared_at` integer;--> statement-breakpoint
ALTER TABLE `page` ADD `preview_path` text;