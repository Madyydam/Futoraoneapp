# 🚀 Quick Setup Checklist

Use this checklist to implement FCM notifications step-by-step.

## ☑️ Prerequisites (Complete First)

- [ ] Firebase account created
- [ ] Supabase CLI installed
- [ ] Node.js and NPM installed
- [ ] APK build environment set up

---

## 📋 Implementation Steps

### **Phase 1: Firebase Setup** (15 minutes)

- [ ] **1.1** Go to https://console.firebase.google.com/
- [ ] **1.2** Create new project: "FutoraOne"
- [ ] **1.3** Add Android app with your package name
- [ ] **1.4** Download `google-services.json`
- [ ] **1.5** Go to Project Settings → Cloud Messaging
- [ ] **1.6** Copy **Server Key** (save it somewhere safe)
- [ ] **1.7** Copy **Sender ID**
- [ ] **1.8** Go to Project Settings → General
- [ ] **1.9** Copy all config values:
   - API Key
   - Auth Domain
   - Project ID
   - Storage Bucket
   - Messaging Sender ID
   - App ID
- [ ] **1.10** Go to Cloud Messaging → Web configuration
- [ ] **1.11** Generate **VAPID key** (if not exists)
- [ ] **1.12** Copy VAPID key

---

### **Phase 2: Install Dependencies** (5 minutes)

- [ ] **2.1** Open terminal in project directory
- [ ] **2.2** Run: `npm install firebase`
- [ ] **2.3** Verify installation successful

---

### **Phase 3: Configure Environment** (5 minutes)

- [ ] **3.1** Open `.env` file
- [ ] **3.2** Add Firebase credentials you copied:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_VAPID_KEY=your_vapid_key
```
- [ ] **3.3** Remove old OneSignal credentials from `.env`
- [ ] **3.4** Save `.env` file
- [ ] **3.5** Verify `.env` is in `.gitignore`

---

### **Phase 4: Update Service Worker** (2 minutes)

- [ ] **4.1** Open `public/firebase-messaging-sw.js`
- [ ] **4.2** Replace `YOUR_FIREBASE_API_KEY` etc. with your actual values
- [ ] **4.3** Save file

---

### **Phase 5: Deploy Edge Function** (10 minutes)

- [ ] **5.1** Open terminal
- [ ] **5.2** Login to Supabase: `supabase login`
- [ ] **5.3** Link project: `supabase link --project-ref forxnefbbsqwhdfadvkk`
- [ ] **5.4** Deploy function:
```bash
supabase functions deploy send-fcm-notification --no-verify-jwt
```
- [ ] **5.5** Verify deployment successful in output
- [ ] **5.6** Set Firebase Server Key as secret:
```bash
supabase secrets set FIREBASE_SERVER_KEY=your_firebase_server_key
```
- [ ] **5.7** Verify secret set successfully

---

### **Phase 6: Run Database Migration** (5 minutes)

- [ ] **6.1** Go to Supabase Dashboard: https://supabase.com/dashboard
- [ ] **6.2** Select your project: "forxnefbbsqwhdfadvkk"
- [ ] **6.3** Go to **SQL Editor**
- [ ] **6.4** Create new query
- [ ] **6.5** Open `supabase/migrations/007_add_fcm_support.sql`
- [ ] **6.6** Copy all contents
- [ ] **6.7** Paste into SQL Editor
- [ ] **6.8** Click **Run**
- [ ] **6.9** Verify success message appears
- [ ] **6.10** Go to **Table Editor** → **profiles**
- [ ] **6.11** Verify `fcm_token` column exists

---

### **Phase 7: Test in Browser** (10 minutes)

- [ ] **7.1** Run: `npm run dev`
- [ ] **7.2** Open browser: http://localhost:5173
- [ ] **7.3** Login to your account
- [ ] **7.4** Check browser console for FCM initialization
- [ ] **7.5** Allow notification permission when prompted
- [ ] **7.6** Check console for "FCM Token obtained"
- [ ] **7.7** Go to Supabase → **Table Editor** → **profiles**
- [ ] **7.8** Find your user row
- [ ] **7.9** Verify `fcm_token` column has a long token value
- [ ] **7.10** Open second browser tab/incognito with different user
- [ ] **7.11** Send message from second user to first
- [ ] **7.12** Verify notification appears in first tab

---

### **Phase 8: Prepare for Mobile** (15 minutes)

#### If using Capacitor:

- [ ] **8.1** Install Capacitor Push: `npm install @capacitor/push-notifications`
- [ ] **8.2** Copy `google-services.json` to `android/app/`
- [ ] **8.3** Update `android/app/build.gradle`:
```gradle
apply plugin: 'com.google.gms.google-services'
```
- [ ] **8.4** Update `android/build.gradle`:
```gradle
dependencies {
    classpath 'com.google.gms:google-services:4.3.15'
}
```
- [ ] **8.5** Sync Capacitor: `npx cap sync android`

#### If using React Native:

- [ ] **8.1** Install: `npm install @react-native-firebase/app @react-native-firebase/messaging`
- [ ] **8.2** Copy `google-services.json` to `android/app/`
- [ ] **8.3** Follow React Native Firebase setup docs

---

### **Phase 9: Build and Test APK** (20 minutes)

- [ ] **9.1** Run build command (e.g., `npm run build`)
- [ ] **9.2** Build Android APK
- [ ] **9.3** Install APK on test device
- [ ] **9.4** Open app and login
- [ ] **9.5** Grant notification permission when prompted
- [ ] **9.6** Verify in Supabase that `fcm_token` is saved
- [ ] **9.7** From another device, send a message
- [ ] **9.8** Verify notification appears on first device
- [ ] **9.9** Tap notification
- [ ] **9.10** Verify app opens to correct conversation
- [ ] **9.11** Close app completely
- [ ] **9.12** Send another message
- [ ] **9.13** Verify notification appears even when app is closed
- [ ] **9.14** Test with app in background
- [ ] **9.15** Test with no internet, then reconnect

---

### **Phase 10: Production Deployment** (10 minutes)

- [ ] **10.1** Verify all Firebase credentials in `.env`
- [ ] **10.2** Build production APK: `npm run build`
- [ ] **10.3** Sign APK (if publishing to Play Store)
- [ ] **10.4** Test signed APK on multiple devices
- [ ] **10.5** Deploy to Google Play Store or distribute APK
- [ ] **10.6** Monitor Supabase Edge Function logs
- [ ] **10.7** Monitor Firebase Cloud Messaging console
- [ ] **10.8** Set up error alerts (optional)

---

## ✅ Verification Checklist

After setup, verify these all work:

- [ ] Token registration (check Supabase profiles table)
- [ ] Message notifications (sender to receiver)
- [ ] Follow notifications
- [ ] Like notifications
- [ ] Comment notifications
- [ ] Bulk notifications (groups)
- [ ] Foreground notifications (app open)
- [ ] Background notifications (app closed)
- [ ] Notification tap opens correct screen
- [ ] Digest mode (if enabled, notifications are skipped)

---

## 🐛 Troubleshooting

### Firebase not installed
**Error:** `Cannot find module 'firebase/app'`  
**Solution:** Run `npm install firebase`

### FCM token not saved
**Error:** `fcm_token does not exist`  
**Solution:** Run migration `007_add_fcm_support.sql`

### Permission denied
**Error:** Notifications don't show  
**Solution:** Grant notification permission in app

### Edge function not working
**Error:** `send-fcm-notification not found`  
**Solution:** Re-deploy: `supabase functions deploy send-fcm-notification`

### Server key not set
**Error:** `FIREBASE_SERVER_KEY not configured`  
**Solution:** `supabase secrets set FIREBASE_SERVER_KEY=your_key`

---

## 📊 Success Criteria

**You'll know it's working when:**

1. ✅ Users can grant notification permission
2. ✅ FCM tokens are saved in database
3. ✅ Messages trigger notifications automatically
4. ✅ Notifications appear even when app is closed
5. ✅ Tapping notification opens the app
6. ✅ No errors in console/logs
7. ✅ Works on multiple devices

---

## 🎉 Done!

Once all checkboxes are checked, your notification system is fully functional!

**Estimated Total Time:** 90 minutes

**Time Saved vs OneSignal:** The system is now secure and you have full control!

---

## 📞 Need Help?

If you get stuck on any step:
1. Check the error message
2. Look in `HOW_NOTIFICATIONS_WORK.md` for explanations
3. Check Firebase Console logs
4. Check Supabase Edge Function logs
5. Ask for help with specific error messages

Good luck! 🚀
