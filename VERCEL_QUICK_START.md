# 🚀 Vercel Quick Start Guide

## ⚡ Fast Deployment Steps

### 1. Connect Your Repository
- Push your code to GitHub/GitLab/Bitbucket
- Connect your repository to Vercel
- Vercel will automatically detect Next.js

### 2. Add Environment Variables (CRITICAL!)
Go to **Project Settings** → **Environment Variables** and add:

#### 🔑 Required Variables
```
NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY = your_service_role_key_here
```

#### 💳 Optional Variables (for full functionality)
```
STRIPE_SECRET_KEY = sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_test_...
STRIPE_WEBHOOK_SECRET = whsec_...
N8N_WEBHOOK_URL = https://your-n8n.com/webhook/...
NEXT_PUBLIC_APP_URL = https://your-domain.vercel.app
```

### 3. Deploy! 🎉
- Click **Deploy** button
- Wait for build to complete
- Your app will be live!

## 🔧 Troubleshooting

### Build Fails with "Missing environment variable"
**Solution**: Add the missing variable in Vercel Settings → Environment Variables

### Supabase Connection Error
**Solution**: Verify your Supabase URL and keys are correct

### App Crashes on Load
**Solution**: Check that all required environment variables are set

## 📱 Get Your Supabase Keys

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`

## 🌐 Your App URL
After deployment, your app will be available at:
`https://your-project-name.vercel.app`

## 📞 Need Help?
- Check build logs in Vercel dashboard
- Verify all environment variables are set
- Ensure Supabase project is active
- Check that keys are copied correctly (no extra spaces)

---
**Remember**: Environment variables are case-sensitive! Copy exactly as shown.
