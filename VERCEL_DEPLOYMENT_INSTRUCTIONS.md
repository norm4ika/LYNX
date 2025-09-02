# Vercel Deployment Instructions

## პრობლემის აღწერა
Vercel-ზე დეპლოიმენტისას მოდის შეცდომა რომ Supabase API key არ არის მოწოდებული. ეს ხდება იმიტომ რომ environment variables არ არის სწორად დაყენებული.

## გადაწყვეტა

### 1. Vercel Dashboard-ზე Environment Variables-ის დამატება

1. გადადით [Vercel Dashboard](https://vercel.com/dashboard)
2. აირჩიეთ თქვენი პროექტი
3. გადადით **Settings** ტაბზე
4. აირჩიეთ **Environment Variables** მენიუში

### 2. Environment Variables-ის დამატება

დაამატეთ შემდეგი environment variables:

#### Supabase Configuration
```
NEXT_PUBLIC_SUPABASE_URL = your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY = your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY = your_supabase_service_role_key
```

#### Stripe Configuration
```
STRIPE_SECRET_KEY = your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET = your_stripe_webhook_secret
```

#### N8N Configuration
```
N8N_WEBHOOK_URL = your_n8n_webhook_url
```

#### App Configuration
```
NEXT_PUBLIC_APP_URL = https://your-vercel-domain.vercel.app
```

### 3. Environment Variables-ის მნიშვნელობების მიღება

#### Supabase-დან:
1. გადადით [Supabase Dashboard](https://supabase.com/dashboard)
2. აირჩიეთ თქვენი პროექტი
3. გადადით **Settings** → **API**
4. დააკოპირეთ:
   - Project URL
   - anon/public key
   - service_role key

#### Stripe-დან:
1. გადადით [Stripe Dashboard](https://dashboard.stripe.com)
2. გადადით **Developers** → **API keys**
3. დააკოპირეთ:
   - Secret key
   - Publishable key
4. Webhook secret-ისთვის:
   - გადადით **Developers** → **Webhooks**
   - დაამატეთ endpoint: `https://your-domain.vercel.app/api/webhooks/stripe`
   - დააკოპირეთ webhook secret

### 4. Vercel-ზე დეპლოიმენტი

1. დარწმუნდით რომ ყველა environment variable დამატებულია
2. გადადით **Deployments** ტაბზე
3. დააჭირეთ **Redeploy** ღილაკს
4. ან გააკეთეთ ახალი commit და push GitHub-ზე

### 5. შემოწმება

დეპლოიმენტის შემდეგ შეამოწმეთ:

1. **Build Logs**: დარწმუნდით რომ build წარმატებით დასრულდა
2. **Runtime Logs**: შეამოწმეთ რომ environment variables სწორად იკითხება
3. **API Endpoints**: შეამოწმეთ რომ API endpoints მუშაობს

### 6. Troubleshooting

#### Build Error: "Missing environment variable"
- დარწმუნდით რომ environment variable დამატებულია Vercel-ზე
- დარწმუნდით რომ variable-ის სახელი სწორია (case-sensitive)

#### Runtime Error: "Environment variable not found"
- დარწმუნდით რომ environment variable დამატებულია production environment-ში
- შეამოწმეთ რომ variable-ის სახელი ემთხვევა კოდში გამოყენებულს

#### Supabase Connection Error
- შეამოწმეთ რომ `NEXT_PUBLIC_SUPABASE_URL` და `NEXT_PUBLIC_SUPABASE_ANON_KEY` სწორია
- დარწმუნდით რომ Supabase project არის active

## მნიშვნელოვანი შენიშვნები

1. **NEXT_PUBLIC_** პრეფიქსით დაწყებული variables ხელმისაწვდომია client-side-ზე
2. **NEXT_PUBLIC_** პრეფიქსის გარეშე variables მხოლოდ server-side-ზეა ხელმისაწვდომი
3. Environment variables ცვლილებების შემდეგ საჭიროა redeploy
4. დარწმუნდით რომ sensitive keys არ არის exposed client-side-ზე

## დამატებითი რესურსები

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Supabase Environment Variables](https://supabase.com/docs/guides/getting-started/environment-variables)
