-- Create conversations table
create table if not exists public.conversations (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create conversation_participants table to link users to conversations
create table if not exists public.conversation_participants (
    conversation_id uuid references public.conversations(id) on delete cascade not null,
    user_id uuid references auth.users(id) on delete cascade not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    primary key (conversation_id, user_id)
);

-- Create messages table
create table if not exists public.messages (
    id uuid default gen_random_uuid() primary key,
    conversation_id uuid references public.conversations(id) on delete cascade not null,
    sender_id uuid references auth.users(id) on delete cascade not null,
    content text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    read_at timestamp with time zone
);

-- Enable RLS
alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;

-- Policies for conversations
create policy "Users can view conversations they are part of"
    on public.conversations for select
    using (
        exists (
            select 1 from public.conversation_participants
            where conversation_id = id
            and user_id = auth.uid()
        )
    );

create policy "Users can create conversations"
    on public.conversations for insert
    with check (true);

-- Policies for conversation_participants
create policy "Users can view participants of their conversations"
    on public.conversation_participants for select
    using (
        exists (
            select 1 from public.conversation_participants cp
            where cp.conversation_id = conversation_id
            and cp.user_id = auth.uid()
        )
    );

create policy "Users can add participants"
    on public.conversation_participants for insert
    with check (true);

-- Policies for messages
create policy "Users can view messages in their conversations"
    on public.messages for select
    using (
        exists (
            select 1 from public.conversation_participants
            where conversation_id = messages.conversation_id
            and user_id = auth.uid()
        )
    );

create policy "Users can insert messages in their conversations"
    on public.messages for insert
    with check (
        auth.uid() = sender_id and
        exists (
            select 1 from public.conversation_participants
            where conversation_id = messages.conversation_id
            and user_id = auth.uid()
        )
    );

create policy "Users can update read status of messages in their conversations"
    on public.messages for update
    using (
        exists (
            select 1 from public.conversation_participants
            where conversation_id = messages.conversation_id
            and user_id = auth.uid()
        )
    );

-- Enable Realtime
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.conversations;
