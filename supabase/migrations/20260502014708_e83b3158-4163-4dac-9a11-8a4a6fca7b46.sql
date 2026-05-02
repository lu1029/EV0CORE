-- Create user_blocks table
CREATE TABLE public.user_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(blocker_id, blocked_id)
);

-- Enable RLS on user_blocks
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;

-- Policies for user_blocks
CREATE POLICY "Users can view their own blocks"
    ON public.user_blocks FOR SELECT
    USING (auth.uid() = blocker_id);

CREATE POLICY "Users can block others"
    ON public.user_blocks FOR INSERT
    WITH CHECK (auth.uid() = blocker_id);

CREATE POLICY "Users can unblock others"
    ON public.user_blocks FOR DELETE
    USING (auth.uid() = blocker_id);

-- Create content_reports table
CREATE TABLE public.content_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content_type TEXT NOT NULL, -- 'message', 'post', 'comment', 'moment'
    content_id UUID NOT NULL,
    reason TEXT NOT NULL,
    details TEXT,
    status TEXT DEFAULT 'pending' NOT NULL, -- 'pending', 'reviewed', 'resolved'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on content_reports
ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;

-- Policies for content_reports
CREATE POLICY "Users can create reports"
    ON public.content_reports FOR INSERT
    WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports"
    ON public.content_reports FOR SELECT
    USING (auth.uid() = reporter_id);

-- Add check to prevent messaging between blocked users
-- Using a function and trigger on direct_messages
CREATE OR REPLACE FUNCTION public.check_message_block()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM public.user_blocks
        WHERE (blocker_id = NEW.sender_id AND blocked_id = NEW.receiver_id)
           OR (blocker_id = NEW.receiver_id AND blocked_id = NEW.sender_id)
    ) THEN
        RAISE EXCEPTION 'Ação bloqueada: Usuários bloqueados não podem trocar mensagens.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_block_before_message
BEFORE INSERT ON public.direct_messages
FOR EACH ROW
EXECUTE FUNCTION public.check_message_block();
