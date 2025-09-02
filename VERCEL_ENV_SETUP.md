# 🔧 Vercel Environment Variables Setup

## ❌ პრობლემა
Vercel-ზე დეპლოიმენტისას მოდის შეცდომა:
```
Environment Variable "NEXT_PUBLIC_SUPABASE_URL" references Secret "supabase_url", which does not exist.
```

## ✅ გადაწყვეტა
Environment variables უნდა დაემატოს **პირდაპირ Vercel Dashboard-ზე**, არა `vercel.json` ფაილში.

## 🚀 ნაბიჯები

### 1. Vercel Dashboard-ზე გადასვლა
1. გადადით [Vercel Dashboard](https://vercel.com/dashboard)
2. აირჩიეთ თქვენი პროექტი

### 2. Environment Variables-ის დამატება
1. გადადით **Settings** ტაბზე
2. აირჩიეთ **Environment Variables** მენიუში
3. დააჭირეთ **Add New** ღილაკს

### 3. Required Variables (შეიყვანეთ თქვენი რეალური მნიშვნელობები)

#### 🔑 Supabase Configuration
```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://your-project-id.supabase.co
Environment: Production, Preview, Development

Name: NEXT_PUBLIC_SUPABASE_ANON_KEY  
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Environment: Production, Preview, Development

Name: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Environment: Production, Preview, Development
```

#### 💳 Optional Variables
```
Name: STRIPE_SECRET_KEY
Value: sk_test_...
Environment: Production, Preview, Development

Name: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
Value: pk_test_...
Environment: Production, Preview, Development

Name: STRIPE_WEBHOOK_SECRET
Value: whsec_...
Environment: Production, Preview, Development

Name: N8N_WEBHOOK_URL
Value: https://your-n8n-instance.com/webhook/...
Environment: Production, Preview, Development

Name: NEXT_PUBLIC_APP_URL
Value: https://your-project-name.vercel.app
Environment: Production, Preview, Development
```

### 4. Environment Selection
**მნიშვნელოვანი**: აირჩიეთ ყველა environment:
- ✅ Production
- ✅ Preview  
- ✅ Development

### 5. Save და Redeploy
1. დააჭირეთ **Save** ღილაკს
2. გადადით **Deployments** ტაბზე
3. დააჭირეთ **Redeploy** ღილაკს

## 📱 Supabase Keys-ის მიღება

### 1. Supabase Dashboard
1. გადადით [Supabase Dashboard](https://supabase.com/dashboard)
2. აირჩიეთ თქვენი პროექტი

### 2. API Settings
1. გადადით **Settings** → **API**
2. დააკოპირეთ:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

## 🔍 შემოწმება

### Build Logs
Build logs-ში უნდა ნახოთ:
```
✅ All required environment variables are set. Build can proceed.
```

### Runtime
App უნდა მუშაობდეს Supabase-თან კავშირში.

## ❗ მნიშვნელოვანი შენიშვნები

1. **არ დაამატოთ environment variables `vercel.json` ფაილში**
2. **გამოიყენეთ მხოლოდ Vercel Dashboard**
3. **Environment variables case-sensitive არის**
4. **ყველა environment-ში უნდა იყოს დამატებული**
5. **ცვლილებების შემდეგ საჭიროა redeploy**

## 🆘 Troubleshooting

### Error: "Secret does not exist"
- დარწმუნდით რომ environment variable დამატებულია Vercel Dashboard-ზე
- არ გამოიყენოთ `@variable_name` ფორმატი

### Build Fails
- შეამოწმეთ რომ ყველა required variable დამატებულია
- დარწმუნდით რომ environment selection სწორია

### App Not Working
- შეამოწმეთ რომ Supabase keys სწორია
- დარწმუნდით რომ Supabase project active არის

---
**💡 Tip**: Environment variables დამატების შემდეგ ყოველთვის გააკეთეთ redeploy!
