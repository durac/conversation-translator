-- Enable RLS
ALTER TABLE IF EXISTS "public"."rooms" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."participants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."translations" ENABLE ROW LEVEL SECURITY;

-- Create rooms table
CREATE TABLE IF NOT EXISTS "public"."rooms" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "created_by" TEXT NOT NULL,
  PRIMARY KEY ("id"),
  UNIQUE ("code")
);

-- Create participants table
CREATE TABLE IF NOT EXISTS "public"."participants" (
  "id" TEXT NOT NULL,
  "room_id" TEXT NOT NULL REFERENCES "public"."rooms"("id") ON DELETE CASCADE,
  "user_name" TEXT NOT NULL,
  "language" TEXT NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY ("id")
);

-- Create messages table
CREATE TABLE IF NOT EXISTS "public"."messages" (
  "id" TEXT NOT NULL,
  "room_id" TEXT NOT NULL REFERENCES "public"."rooms"("id") ON DELETE CASCADE,
  "sender_id" TEXT NOT NULL REFERENCES "public"."participants"("id") ON DELETE CASCADE,
  "original_text" TEXT NOT NULL,
  "original_language" TEXT NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY ("id")
);

-- Create translations table
CREATE TABLE IF NOT EXISTS "public"."translations" (
  "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4(),
  "message_id" TEXT NOT NULL REFERENCES "public"."messages"("id") ON DELETE CASCADE,
  "language" TEXT NOT NULL,
  "translated_text" TEXT NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE ("message_id", "language")
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "room_code_idx" ON "public"."rooms" ("code");
CREATE INDEX IF NOT EXISTS "participant_room_idx" ON "public"."participants" ("room_id");
CREATE INDEX IF NOT EXISTS "message_room_idx" ON "public"."messages" ("room_id");
CREATE INDEX IF NOT EXISTS "message_sender_idx" ON "public"."messages" ("sender_id");
CREATE INDEX IF NOT EXISTS "translation_message_idx" ON "public"."translations" ("message_id");
CREATE INDEX IF NOT EXISTS "translation_language_idx" ON "public"."translations" ("language");

-- Create policies for public access (in a real app, you'd want more restrictive policies)

-- Rooms policies
CREATE POLICY "Allow public read access to rooms" ON "public"."rooms"
  FOR SELECT USING (true);
  
CREATE POLICY "Allow public insert access to rooms" ON "public"."rooms"
  FOR INSERT WITH CHECK (true);

-- Participants policies
CREATE POLICY "Allow public read access to participants" ON "public"."participants"
  FOR SELECT USING (true);
  
CREATE POLICY "Allow public insert access to participants" ON "public"."participants"
  FOR INSERT WITH CHECK (true);
  
CREATE POLICY "Allow public delete access to participants" ON "public"."participants"
  FOR DELETE USING (true);

-- Messages policies
CREATE POLICY "Allow public read access to messages" ON "public"."messages"
  FOR SELECT USING (true);
  
CREATE POLICY "Allow public insert access to messages" ON "public"."messages"
  FOR INSERT WITH CHECK (true);

-- Translations policies
CREATE POLICY "Allow public read access to translations" ON "public"."translations"
  FOR SELECT USING (true);
  
CREATE POLICY "Allow public insert access to translations" ON "public"."translations"
  FOR INSERT WITH CHECK (true);

-- Enable real-time for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE participants;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE translations;