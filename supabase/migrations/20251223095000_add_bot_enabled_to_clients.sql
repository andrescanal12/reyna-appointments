
-- Add bot_enabled column to clients table
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS bot_enabled BOOLEAN DEFAULT TRUE;
