CREATE TABLE `document_chunks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`embedding` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `document_chunks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vector_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`metadata` text NOT NULL,
	`category` varchar(64) NOT NULL,
	`embedding` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `vector_items_id` PRIMARY KEY(`id`)
);
