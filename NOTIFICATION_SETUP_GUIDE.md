# 🔔 Push Notification Setup Guide for FutoraOne

## Problem Statement
You have an APK installed on mobile devices but push notifications aren't working because:
1. OneSignal API key was exposed on GitHub and is now blocked
2. No automatic notification trigger when users send messages
3. Need a secure, scalable solution for bulk notifications

## Solution: Firebase Cloud Messaging (FCM)

### Why FCM over OneSignal?
- ✅ **Free forever** with unlimited notifications
- ✅ **More secure** - credentials stay on backend
- ✅ **Better mobile support** for Android/iOS
- ✅ **Reliable delivery** with Google's infrastructure
- ✅ **Easy integration** with React and mobile apps

---

## 🚀 Setup Instructions

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Enter project name: `FutoraOne`
4. Disable Google Analytics (optional)
5. Click "Create Project"

### Step 2: Add Android App to Firebase

1. In Firebase Console, click the Android icon
2. Enter your Android package name from `capacitor.config.json` or your APK
   - Usually something like: `com.futoraone.app`
3. Download `google-services.json` file
4. Add Firebase SDK (we'll handle this in code)

### Step 3: Get Server Key

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Go to **Cloud Messaging** tab
3. Find **Server Key** and **Sender ID**
4. Copy these values (we'll use them securely)

### Step 4: Setup Supabase Edge Function

We'll create a secure Supabase Edge Function to send notifications (API keys never exposed):

1. The Edge Function will:
   - Receive notification requests from your app
   - Securely call FCM API with server key
   - Send bulk notifications to multiple users

### Step 5: Update Your App

We'll:
1. Install FCM in your React app
2. Request notification permission on mobile
3. Save FCM tokens to Supabase
4. Trigger notifications when messages are sent

---

## 📱 Implementation Steps

### Step 1: Install Required Packages

```bash
npm install firebase
npm install @capacitor/push-notifications
```

### Step 2: Configure Firebase in Your App

Create `src/lib/firebase-config.ts` with your Firebase credentials.

### Step 3: Create FCM Service

We'll create:
- `src/services/fcm.service.ts` - Handle FCM token registration
- `src/services/notification.service.ts` - Send notifications

### Step 4: Create Supabase Edge Function

Create a secure edge function to send FCM notifications without exposing credentials.

### Step 5: Add Database Trigger

Create a PostgreSQL trigger that automatically sends notifications when new messages are inserted.

### Step 6: Update Your APK

After implementation:
1. Rebuild your APK with new FCM code
2. Reinstall on devices
3. Request notification permission on first launch

---

## 🔐 Security Best Practices

1. **Never commit Firebase credentials to Git**
   - Add to `.env` file
   - Add `.env` to `.gitignore`
   
2. **Use Supabase Edge Functions**
   - Keep server keys on backend only
   - Your app calls edge function, not FCM directly

3. **Validate requests**
   - Edge function validates user authentication
   - Only authenticated users can send notifications

---

## 📊 How It Works

```
User A sends message to User B
        ↓
Message saved to Supabase
        ↓
Database trigger fires
        ↓
Calls Supabase Edge Function
        ↓
Edge Function calls FCM API
        ↓
FCM sends push notification to User B's device
        ↓
User B sees notification on mobile
```

---

## 🛠️ Next Steps

I'll now create all the necessary code files for you:

1. ✅ Firebase configuration
2. ✅ FCM service for token management
3. ✅ Notification service
4. ✅ Supabase Edge Function
5. ✅ Database trigger
6. ✅ Update Chat component to trigger notifications
7. ✅ Migration guide from OneSignal to FCM

---

## ⚡ Quick Start (After Setup)

1. Get your Firebase Server Key
2. Set it as Supabase secret: `FIREBASE_SERVER_KEY`
3. Deploy the Edge Function
4. Run the database migration
5. Rebuild and reinstall your APK
6. Test by sending a message!

---

## 📞 Troubleshooting

### Notifications not working?
1. Check notification permission granted on device
2. Verify FCM token saved in Supabase `profiles` table
3. Check Supabase Edge Function logs
4. Test FCM token using Firebase Console

### APK issues?
1. Ensure `google-services.json` is in your Android project
2. Rebuild APK after adding FCM code
3. Update `capacitor.config.json` with Firebase app ID

---

Ready to implement? Let me know and I'll create all the code files!
