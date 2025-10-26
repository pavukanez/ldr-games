-- Create the game_sessions table
CREATE TABLE IF NOT EXISTS game_sessions (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  game_type TEXT NOT NULL DEFAULT 'battleship',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'finished')),
  current_player INTEGER NOT NULL DEFAULT 1 CHECK (current_player IN (1, 2)),
  player1_board TEXT,
  player2_board TEXT,
  player1_ships TEXT,
  player2_ships TEXT,
  moves TEXT DEFAULT '[]',
  winner INTEGER CHECK (winner IN (1, 2)),
  player1_id TEXT,
  player2_id TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_game_sessions_status ON game_sessions(status);
CREATE INDEX IF NOT EXISTS idx_game_sessions_created_at ON game_sessions(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since we don't have authentication)
CREATE POLICY "Allow public read access" ON game_sessions
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access" ON game_sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access" ON game_sessions
  FOR UPDATE USING (true);

-- Enable Realtime for the game_sessions table
ALTER PUBLICATION supabase_realtime ADD TABLE game_sessions;

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_game_sessions_updated_at
  BEFORE UPDATE ON game_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Migration script to add new columns to existing table
-- Run this if you already have the table created

-- Add the new status value to the check constraint
ALTER TABLE game_sessions DROP CONSTRAINT IF EXISTS game_sessions_status_check;
ALTER TABLE game_sessions ADD CONSTRAINT game_sessions_status_check 
  CHECK (status IN ('waiting', 'ready', 'active', 'finished'));

-- Add the new ready columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'game_sessions' AND column_name = 'player1_ready') THEN
    ALTER TABLE game_sessions ADD COLUMN player1_ready BOOLEAN DEFAULT FALSE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'game_sessions' AND column_name = 'player2_ready') THEN
    ALTER TABLE game_sessions ADD COLUMN player2_ready BOOLEAN DEFAULT FALSE;
  END IF;
END $$;
