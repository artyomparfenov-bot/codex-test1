CREATE TABLE IF NOT EXISTS `companies` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `project` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `website` varchar(191) NULL,
  `source` varchar(191) NULL,
  `status` enum('new','enriched','lpr_found','intro_generated') NOT NULL DEFAULT 'new',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `contacts` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `company_id` char(36) NOT NULL,
  `name` varchar(191) NULL,
  `role` varchar(191) NULL,
  `email` varchar(191) NULL,
  `telegram` varchar(191) NULL,
  `linkedin` varchar(191) NULL,
  `url` varchar(191) NULL,
  `confidence` int NOT NULL DEFAULT 0,
  `notes` text NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `contacts_company_email_unique` (`company_id`,`email`),
  UNIQUE KEY `contacts_company_url_unique` (`company_id`,`url`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `settings` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `project` varchar(191) NOT NULL,
  `key` varchar(191) NOT NULL,
  `value` text NOT NULL,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `settings_project_key_idx` (`project`,`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `enrichment_logs` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `company_id` char(36) NOT NULL,
  `action` enum('enrich','find_lpr','generate_intro') NOT NULL,
  `status` enum('queued','running','succeeded','failed','partial') NOT NULL,
  `payload_in` json NOT NULL,
  `payload_out` json NULL,
  `error` text NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `enrichment_logs_company_action_created_idx` (`company_id`,`action`,`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
