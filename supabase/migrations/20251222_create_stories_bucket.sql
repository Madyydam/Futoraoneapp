
-- Create storage bucket for stories
INSERT INTO storage.buckets (id, name, public)
VALUES ('stories', 'stories', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for stories
CREATE POLICY "Stories are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'stories');

CREATE POLICY "Authenticated users can upload stories"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'stories' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own stories"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'stories' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own stories"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'stories' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create stories table if it doesn't exist (though error was bucket related, good to ensure)
CREATE TABLE IF NOT EXISTS public.stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  media_url text NOT NULL,
  media_type text NOT NULL CHECK (media_type IN ('image', 'video')),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours')
);

-- Enable RLS
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- Stories RLS policies
CREATE POLICY "Stories are viewable by everyone"
  ON public.stories FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own stories"
  ON public.stories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stories"
  ON public.stories FOR DELETE
  USING (auth.uid() = user_id);

-- Add stories to realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.stories;
