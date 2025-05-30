-- Remove the ON DELETE CASCADE from messages.sender_id
ALTER TABLE "public"."messages" 
  DROP CONSTRAINT "messages_sender_id_fkey",
  ADD CONSTRAINT "messages_sender_id_fkey" 
    FOREIGN KEY ("sender_id") 
    REFERENCES "public"."participants"("id") 
    ON DELETE SET NULL;

-- Allow sender_id to be NULL since we're removing the cascade
ALTER TABLE "public"."messages" 
  ALTER COLUMN "sender_id" DROP NOT NULL;

-- Add a comment to explain why sender_id can be null
COMMENT ON COLUMN "public"."messages"."sender_id" IS 'Can be NULL if the sender left the conversation'; 