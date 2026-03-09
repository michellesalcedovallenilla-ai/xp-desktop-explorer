ALTER TABLE guestbook_messages ADD COLUMN device_id text;

ALTER TABLE guestbook_messages ADD CONSTRAINT unique_device_id UNIQUE (device_id);

DROP POLICY "Anyone can insert guestbook messages" ON guestbook_messages;

CREATE POLICY "Anyone can insert guestbook messages once per device"
ON guestbook_messages
FOR INSERT
WITH CHECK (
  (char_length(nickname) <= 30)
  AND (char_length(message) <= 500)
  AND (char_length(COALESCE(status, ''::text)) <= 50)
  AND (device_id IS NOT NULL)
  AND (NOT EXISTS (
    SELECT 1 FROM guestbook_messages gm WHERE gm.device_id = device_id
  ))
);