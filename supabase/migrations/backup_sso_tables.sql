-- Backup Script: backup_sso_tables.sql
-- Run this BEFORE executing 20260202_cleanup_sso_tables.sql
-- This creates a backup of SSO data for audit purposes
-- Create backup schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS archived;
-- Backup sso_codes table
CREATE TABLE IF NOT EXISTS archived.sso_codes_backup_20260202 AS
SELECT *
FROM sso_codes;
-- Backup sso_clients table  
CREATE TABLE IF NOT EXISTS archived.sso_clients_backup_20260202 AS
SELECT *
FROM sso_clients;
-- Verification
DO $$
DECLARE codes_count INTEGER;
clients_count INTEGER;
BEGIN
SELECT COUNT(*) INTO codes_count
FROM archived.sso_codes_backup_20260202;
SELECT COUNT(*) INTO clients_count
FROM archived.sso_clients_backup_20260202;
RAISE NOTICE 'Backup completed:';
RAISE NOTICE '  - sso_codes: % records backed up',
codes_count;
RAISE NOTICE '  - sso_clients: % records backed up',
clients_count;
RAISE NOTICE 'Backup tables created in schema: archived';
END $$;