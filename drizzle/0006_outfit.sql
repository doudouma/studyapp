CREATE TABLE `wardrobe_outfit` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`occasion` text,
	`item_ids` text NOT NULL,
	`image_url` text,
	`status` text NOT NULL DEFAULT 'planned',
	`error` text,
	`created_at` integer NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` integer NOT NULL DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `wardrobe_outfit_user_id_idx` ON `wardrobe_outfit` (`user_id`);
