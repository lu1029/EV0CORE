-- Create direct_messages table
CREATE TABLE IF NOT EXISTS public.direct_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID REFERENCES auth.users(id) NOT NULL,
    receiver_id UUID REFERENCES auth.users(id) NOT NULL,
    content TEXT,
    image_url TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

-- Policies for direct_messages
CREATE POLICY "Users can view their own sent/received messages"
ON public.direct_messages FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
ON public.direct_messages FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- Create indexes for performance
CREATE INDEX idx_direct_messages_sender ON public.direct_messages(sender_id);
CREATE INDEX idx_direct_messages_receiver ON public.direct_messages(receiver_id);
CREATE INDEX idx_direct_messages_conversation ON public.direct_messages(sender_id, receiver_id);

-- User follows table (already exists in some versions, ensuring it's here with correct policies)
-- Note: The table might already exist, so we use IF NOT EXISTS or verify.
-- According to previous scan, 'user_follows' exists. Let's ensure policies.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_follows') THEN
        ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Everyone can see follows"
        ON public.user_follows FOR SELECT
        USING (true);

        CREATE POLICY "Users can follow others"
        ON public.user_follows FOR INSERT
        WITH CHECK (auth.uid() = follower_id);

        CREATE POLICY "Users can unfollow"
        ON public.user_follows FOR DELETE
        USING (auth.uid() = follower_id);
    END IF;
END
$$;
