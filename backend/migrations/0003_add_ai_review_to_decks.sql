-- Add AI review columns to inception_decks table
ALTER TABLE inception_decks ADD COLUMN ai_review TEXT;
ALTER TABLE inception_decks ADD COLUMN ai_reviewed_at TEXT;
