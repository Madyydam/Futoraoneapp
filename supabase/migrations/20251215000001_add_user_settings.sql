-- Add settings jsonb column to profiles for storing preferences
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{
  "privacy": {
    "read_receipts": true,
    "online_status": true
  },
  "notifications": {
    "push": true,
    "email": true,
    "marketing": false
  },
  "theme": {
    "accent_color": "default"
  }
}'::jsonb;
