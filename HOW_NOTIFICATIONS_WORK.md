# 📱 How FCM Push Notifications Work in FutoraOne

## 🎯 Complete System Overview

This document explains **exactly how the notification system works** from start to finish.

---

## 🔄 The Complete Flow

### **When User Opens the App**

```
1. User opens FutoraOne app on mobile
2. App requests notification permission
3. Firebase generates a unique FCM token for this device
4. Token is saved to Supabase profiles table (fcm_token column)
5. User is now registered to receive notifications
```

### **When Someone Sends a Message**

```
User A sends message to User B
        ↓
1. Message saved to `messages` table in Supabase
        ↓
2. Database trigger `notify_on_new_message()` fires automatically
        ↓
3. Trigger creates notification record in `notifications` table
        ↓
4. Trigger calls Supabase Edge Function `send-fcm-notification`
        ↓
5. Edge Function fetches User B's FCM token from database
        ↓
6. Edge Function calls Google FCM API with User B's token
        ↓
7. Google FCM sends push notification to User B's device
        ↓
8. User B sees notification: "New message from User A"
        ↓
9. User B taps notification → App opens to that conversation
```

---

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     MOBILE APP (User B)                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  1. App loads → FCM initialized                       │   │
│  │  2. Request permission                                │   │
│  │  3. Get FCM token: "dA7fK2x..."                      │   │
│  │  4. Save token to Supabase                           │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE DATABASE││
│  ┌──────────────────────────────────────────────────────┐   │
│  │  profiles table:                                      │   │
│  │  ┌──────────┬─────────────┬──────────────────────┐  │   │
│  │  │ user_id  │ username    │ fcm_token            │  │   │
│  │  ├──────────┼─────────────┼──────────────────────┤  │   │
│  │  │ uuid-123 │ user_b      │ dA7fK2x...           │  │   │
│  │  └──────────┴─────────────┴──────────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────┐
│                  MOBILE APP (User A)                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  User A types: "Hey, how are you?"                   │   │
│  │  Taps Send button                                     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE DATABASE                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  messages table:                                      │   │
│  │  INSERT new row:                                      │   │
│  │  - conversation_id: conv-456                         │   │
│  │  - sender_id: uuid-789 (User A)                      │   │
│  │  - content: "Hey, how are you?"                      │   │
│  │                                                        │   │
│  │  ⚡ TRIGGER FIRES: notify_on_new_message()           │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────┐
│              DATABASE TRIGGER (PostgreSQL)                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  1. Get receiver: User B (uuid-123)                  │   │
│  │  2. Get sender name: "User A"                        │   │
│  │  3. Create notification record:                      │   │
│  │     - user_id: uuid-123                              │   │
│  │     - type: "message"                                │   │
│  │     - title: "New message from User A"               │   │
│  │     - message: "Hey, how are you?"                   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────┐
│          SUPABASE EDGE FUNCTION (Deno Runtime)               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Function: send-fcm-notification                     │   │
│  │                                                        │   │
│  │  1. Fetch User B's FCM token: "dA7fK2x..."          │   │
│  │  2. Check digest_mode (if enabled, skip)             │   │
│  │  3. Prepare FCM payload:                             │   │
│  │     {                                                 │   │
│  │       "to": "dA7fK2x...",                            │   │
│  │       "notification": {                              │   │
│  │         "title": "New message from User A",          │   │
│  │         "body": "Hey, how are you?"                  │   │
│  │       }                                               │   │
│  │     }                                                 │   │
│  │  4. POST to Google FCM API                           │   │
│  │     with FIREBASE_SERVER_KEY                         │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────┐
│              GOOGLE FIREBASE CLOUD MESSAGING                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  1. Validate token "dA7fK2x..."                      │   │
│  │  2. Find User B's device                             │   │
│  │  3. Send push notification to device                 │   │
│  │  4. Return success/failure status                    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────┐
│                  MOBILE APP (User B)                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  📱 NOTIFICATION APPEARS!                            │   │
│  │  ┌────────────────────────────────────────────────┐ │   │
│  │  │  🔵 FutoraOne                                   │ │   │
│  │  │  New message from User A                       │ │   │
│  │  │  Hey, how are you?                             │ │   │
│  │  └────────────────────────────────────────────────┘ │   │
│  │                                                        │   │
│  │  User B taps notification →                          │   │
│  │  App opens to conversation with User A               │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Security: Why This is Secure

### **Problem with OneSignal Exposed Keys**
```
❌ OLD APPROACH (OneSignal):
   - API keys in .env file
   - .env pushed to GitHub
   - Keys visible to anyone
   - OneSignal blocks compromised keys
```

### **Solution with FCM + Edge Functions**
```
✅ NEW APPROACH (FCM):
   - Firebase Server Key stored in Supabase Secrets (server-side only)
   - App calls Edge Function (authenticated request)
   - Edge Function calls FCM API (server-to-server)
   - Server key NEVER exposed to client
   - Even if someone decompiles your APK, they can't get the key
```

---

## 🚀 How Different Notifications Work

### **1. Message Notifications**
```javascript
User A sends message
  ↓
Database: messages table INSERT
  ↓
Trigger: notify_on_new_message()
  ↓
Edge Function: send-fcm-notification
  ↓
User B gets: "New message from [User A name]"
```

### **2. Follow Notifications**
```javascript
User A follows User B
  ↓
Database: follows table INSERT
  ↓
Trigger: notify_on_new_follow()
  ↓
Edge Function: send-fcm-notification
  ↓
User B gets: "[User A] started following you"
```

### **3. Like Notifications**
```javascript
User A likes User B's post
  ↓
Database: post_reactions table INSERT
  ↓
Trigger: notify_on_new_like()
  ↓
Edge Function: send-fcm-notification
  ↓
User B gets: "[User A] liked your post"
```

### **4. Comment Notifications**
```javascript
User A comments on User B's post
  ↓
Database: comments table INSERT
  ↓
Trigger: notify_on_new_comment()
  ↓
Edge Function: send-fcm-notification
  ↓
User B gets: "[User A] commented: [comment text]"
```

---

## 📲 Mobile App Token Registration

### **First Time User Opens App**

```javascript
// In src/hooks/useFCM.ts
// Called automatically when user logs in

1. Request notification permission from user
   ↓
2. User taps "Allow"
   ↓
3. Firebase generates unique token: "dA7fK2xPq9R..."
   ↓
4. Save token to Supabase:
   UPDATE profiles 
   SET fcm_token = "dA7fK2xPq9R..."
   WHERE id = [user_id]
   ↓
5. User is now registered!
```

---

## 🎛️ Features Included

### **✅ Digest Mode**
```
If user enables digest_mode:
- Individual notifications are skipped
- Notifications are batched
- User gets one daily digest instead of many notifications
```

### **✅ Bulk Notifications**
```javascript
// Send to multiple users at once (like group messages)
sendBulkNotifications({
  userIds: ['user1', 'user2', 'user3'],
  title: 'Group: Tech Enthusiasts',
  body: 'John: Hey everyone!'
})
```

### **✅ Foreground Notifications**
```
App is open:
- Custom in-app notification appears
- Uses browser Notification API
- Shows even when app is in foreground
```

### **✅ Background Notifications**
```
App is closed or in background:
- Service worker handles notification
- Shows OS-level notification
- User can tap to open app
```

---

## 🛠️ What You Need to Do

### **Step 1: Create Firebase Project** (5 minutes)
1. Go to https://console.firebase.google.com/
2. Click "Add Project"
3. Name: "FutoraOne"
4. Create project

### **Step 2: Add Android App** (5 minutes)
1. In Firebase Console, click Android icon
2. Enter package name (from your APK)
3. Download `google-services.json`
4. Save it (you'll need it when rebuilding APK)

### **Step 3: Get Firebase Credentials** (2 minutes)
1. Project Settings → General
2. Copy all the config values
3. Paste into `.env` file

### **Step 4: Get Server Key** (2 minutes)
1. Project Settings → Cloud Messaging
2. Copy "Server Key"
3. You'll add this to Supabase secrets

### **Step 5: Install Dependencies** (1 minute)
```bash
npm install firebase
```

### **Step 6: Deploy Edge Function** (3 minutes)
```bash
supabase functions deploy send-fcm-notification --no-verify-jwt
```

### **Step 7: Set Supabase Secret** (1 minute)
```bash
supabase secrets set FIREBASE_SERVER_KEY=your_server_key_here
```

### **Step 8: Run Database Migration** (1 minute)
- Go to Supabase Dashboard → SQL Editor
- Copy contents of `007_add_fcm_support.sql`
- Run the script

### **Step 9: Update Your .env** (2 minutes)
- Add all Firebase credentials
- Remove OneSignal credentials

### **Step 10: Rebuild APK** (10 minutes)
- Rebuild your app with new FCM code
- Include `google-services.json` in Android project
- Install new APK on devices

---

## ✅ Testing the System

### **Test 1: Token Registration**
```
1. Install new APK
2. Open app and login
3. Allow notification permission
4. Check Supabase profiles table
5. Your fcm_token column should have a long token
```

### **Test 2: Send Test Message**
```
1. From Device A, send message to Device B
2. Device B should get notification within 1-2 seconds
3. Tap notification → should open to that conversation
```

### **Test 3: Background Notifications**
```
1. Close app completely on Device B
2. From Device A, send message
3. Device B should still get notification
4. Tap to open app
```

---

## 🔍 Troubleshooting

### **"No notification received"**
✅ Check: FCM token saved in database?
✅ Check: Notification permission granted?
✅ Check: Edge function deployed?
✅ Check: Firebase server key set in Supabase secrets?
✅ Check: Internet connection on both devices?

### **"Error: fcm_token does not exist"**
✅ Solution: Run the migration `007_add_fcm_support.sql`

### **"Firebase not defined"**
✅ Solution: Run `npm install firebase`

### **"Permission denied"**
✅ Solution: User must grant notification permission in app

---

## 📈 Scalability

This system handles:
- ✅ **Unlimited notifications** (FCM is free)
- ✅ **Bulk sending** (thousands at once)
- ✅ **High delivery rate** (99%+ with FCM)
- ✅ **Global reach** (works worldwide)
- ✅ **Automatic retries** (FCM handles failed deliveries)

---

## 🎉 Benefits Over OneSignal

| Feature | OneSignal | FCM (This System) |
|---------|-----------|-------------------|
| Cost | Free (limited), then paid | **100% Free forever** |
| Security | Keys exposed | **Server-side only** |
| Control | Limited | **Full control** |
| Customization | Basic | **Unlimited** |
| Privacy | Data shared with OneSignal | **Your data only** |
| Integration | Third-party dependency | **Direct Google integration** |

---

## 📝 Summary

**What happens when you send a message:**

1. Message saved to database
2. Database trigger automatically fires
3. Trigger gets receiver's FCM token
4. Trigger calls Edge Function
5. Edge Function calls Google FCM
6. Google delivers notification to device
7. Receiver sees notification
8. Receiver taps → app opens

**All automatic. No manual code required after setup!**

---

Need help with any step? Let me know!
