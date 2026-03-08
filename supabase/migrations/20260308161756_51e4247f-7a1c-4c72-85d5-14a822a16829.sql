
-- Guestbook messages table for MSN Messenger style persistent comments
CREATE TABLE public.guestbook_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nickname TEXT NOT NULL,
  status TEXT DEFAULT '',
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.guestbook_messages ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read messages (public guestbook)
CREATE POLICY "Anyone can read guestbook messages"
  ON public.guestbook_messages
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow anyone to insert messages (no auth required)
CREATE POLICY "Anyone can insert guestbook messages"
  ON public.guestbook_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(nickname) <= 30
    AND char_length(message) <= 500
    AND char_length(COALESCE(status, '')) <= 50
  );

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.guestbook_messages;
