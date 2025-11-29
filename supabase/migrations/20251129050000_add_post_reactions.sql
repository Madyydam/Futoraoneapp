-- Create post_reactions table
CREATE TABLE IF NOT EXISTS public.post_reactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  emoji text NOT NULL CHECK (emoji IN ('👍', '❤️', '🔥', '💡', '🎉')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, post_id, emoji)
);

-- Enable RLS
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Post reactions are viewable by everyone" 
ON public.post_reactions FOR SELECT USING (true);

CREATE POLICY "Users can add reactions" 
ON public.post_reactions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own reactions" 
ON public.post_reactions FOR DELETE 
USING (auth.uid() = user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_reactions;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS post_reactions_post_id_idx ON public.post_reactions(post_id);
CREATE INDEX IF NOT EXISTS post_reactions_user_id_idx ON public.post_reactions(user_id);
