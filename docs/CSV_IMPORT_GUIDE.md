# CSV Import Guide for Profiles

## The Problem
The `profiles` table has a foreign key constraint to `auth.users`. You can't insert profiles without corresponding authentication users.

## Solution Steps

### 1. Prepare Your CSV
Your CSV should have these columns (at minimum):
```
email,username,full_name,bio,avatar_url
user1@example.com,user1,User One,Bio text,https://...
user2@example.com,user2,User Two,Bio text,https://...
```

### 2. Get Your Service Role Key
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/sbzsgeokspmkewrmuqgi/settings/api)
2. Copy the **service_role** key (NOT the anon public key)
3. ⚠️ **IMPORTANT**: Never commit this key to Git!

### 3. Install Dependencies
```bash
npm install @supabase/supabase-js csv-parser
```

### 4. Update the Script
1. Open `import-profiles.js`
2. Replace `YOUR_SERVICE_ROLE_KEY_HERE` with your actual service role key
3. Adjust the profile fields to match your CSV columns

### 5. Run the Import
```bash
node import-profiles.js path/to/your/profiles.csv
```

## Alternative: Manual Import via SQL
If you have a small dataset, you can also use SQL directly:

```sql
-- For each user in your CSV:
-- 1. Create auth user (run this with your service role key via API)
-- 2. Then insert profile:

INSERT INTO public.profiles (id, username, full_name, bio, avatar_url)
VALUES (
  'user-id-from-auth-creation',
  'username',
  'Full Name',
  'Bio text',
  'https://avatar-url'
);
```

## Notes
- All imported users will have a temporary password (`TempPassword123!`)
- Send them a password reset email after import
- The script will skip duplicates and log errors
