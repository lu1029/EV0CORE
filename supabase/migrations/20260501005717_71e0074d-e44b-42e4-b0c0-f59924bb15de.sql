-- Add font column to clubs
ALTER TABLE public.clubs ADD COLUMN font TEXT DEFAULT 'sans-serif';

-- Create reminders table for notifications
CREATE TABLE public.reminders (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'nutrition', 'running', 'workout'
    time TIME NOT NULL,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, type)
);

ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own reminders"
    ON public.reminders
    FOR ALL
    USING (auth.uid() = user_id);
