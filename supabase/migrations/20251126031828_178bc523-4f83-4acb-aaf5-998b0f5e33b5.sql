-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  tech_stack text[],
  image_url text,
  github_url text,
  live_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create follows table
CREATE TABLE IF NOT EXISTS public.follows (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- Create saves table for saved posts
CREATE TABLE IF NOT EXISTS public.saves (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- Create tags table
CREATE TABLE IF NOT EXISTS public.tags (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create post_tags junction table
CREATE TABLE IF NOT EXISTS public.post_tags (
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- Create project_likes table
CREATE TABLE IF NOT EXISTS public.project_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, project_id)
);

-- Add social links and location to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS github_url text,
ADD COLUMN IF NOT EXISTS linkedin_url text,
ADD COLUMN IF NOT EXISTS portfolio_url text,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS tech_skills text[];

-- Add video support to posts
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS video_url text,
ADD COLUMN IF NOT EXISTS is_project_update boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE;

-- Enable RLS on all tables
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects
CREATE POLICY "Projects are viewable by everyone" 
ON public.projects FOR SELECT USING (true);

CREATE POLICY "Users can create their own projects" 
ON public.projects FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" 
ON public.projects FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" 
ON public.projects FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for follows
CREATE POLICY "Follows are viewable by everyone" 
ON public.follows FOR SELECT USING (true);

CREATE POLICY "Users can follow others" 
ON public.follows FOR INSERT 
WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow" 
ON public.follows FOR DELETE 
USING (auth.uid() = follower_id);

-- RLS Policies for saves
CREATE POLICY "Users can view their own saves" 
ON public.saves FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can save posts" 
ON public.saves FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave posts" 
ON public.saves FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for tags
CREATE POLICY "Tags are viewable by everyone" 
ON public.tags FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create tags" 
ON public.tags FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for post_tags
CREATE POLICY "Post tags are viewable by everyone" 
ON public.post_tags FOR SELECT USING (true);

CREATE POLICY "Authenticated users can add post tags" 
ON public.post_tags FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can remove post tags" 
ON public.post_tags FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- RLS Policies for project_likes
CREATE POLICY "Project likes are viewable by everyone" 
ON public.project_likes FOR SELECT USING (true);

CREATE POLICY "Users can like projects" 
ON public.project_likes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike projects" 
ON public.project_likes FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for projects updated_at
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.follows;
ALTER PUBLICATION supabase_realtime ADD TABLE public.saves;
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_likes;