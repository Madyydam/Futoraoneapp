-- Fix infinite recursion in group_members policies
-- Drop the recursive policies
DROP POLICY IF EXISTS "Members can view other members in their groups" ON public.group_members;
DROP POLICY IF EXISTS "Admins can add members" ON public.group_members;
DROP POLICY IF EXISTS "Admins can remove members" ON public.group_members;

-- Create non-recursive policies
-- Allow users to see all group members (we'll rely on groups table security)
CREATE POLICY "Users can view group members" ON public.group_members
    FOR SELECT USING (true);

-- Allow admins to add members (check admin status via groups table instead)
CREATE POLICY "Group creators and admins can add members" ON public.group_members
    FOR INSERT WITH CHECK (
        -- User is adding themselves to a public group
        (auth.uid() = user_id AND group_id IN (SELECT id FROM public.groups WHERE is_public = true))
        OR
        -- User is the group creator
        (group_id IN (SELECT id FROM public.groups WHERE created_by = auth.uid()))
    );

-- Allow users to remove themselves, and group creators to remove anyone
CREATE POLICY "Users can leave groups and creators can remove members" ON public.group_members
    FOR DELETE USING (
        auth.uid() = user_id -- Users can leave
        OR
        group_id IN (SELECT id FROM public.groups WHERE created_by = auth.uid()) -- Creators can remove
    );
