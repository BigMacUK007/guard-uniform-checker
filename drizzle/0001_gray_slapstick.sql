CREATE TABLE `companies` (
	`id` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	`ownerId` varchar(64) NOT NULL,
	CONSTRAINT `companies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `complianceStandards` (
	`id` varchar(64) NOT NULL,
	`companyId` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`requirements` text NOT NULL,
	`isActive` enum('true','false') NOT NULL DEFAULT 'true',
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `complianceStandards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `officers` (
	`id` varchar(64) NOT NULL,
	`companyId` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320),
	`badgeNumber` varchar(100),
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `officers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `uniformChecks` (
	`id` varchar(64) NOT NULL,
	`officerId` varchar(64) NOT NULL,
	`companyId` varchar(64) NOT NULL,
	`standardId` varchar(64) NOT NULL,
	`imageUrl` text NOT NULL,
	`status` enum('pending','compliant','non_compliant') NOT NULL DEFAULT 'pending',
	`aiAnalysis` text,
	`submittedAt` timestamp DEFAULT (now()),
	`location` varchar(500),
	CONSTRAINT `uniformChecks_id` PRIMARY KEY(`id`)
);
