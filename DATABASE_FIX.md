# 🔧 Database Fix - User Migration

## პრობლემა
Vercel deployment-ზე ვიღებთ შეცდომას:
```
Database error: Key (user_id)=(f573b72a-20bd-46f1-a238-d39e2ec11290) is not present in table "users"
```

ეს ხდება იმიტომ, რომ Supabase Auth ქმნის users-ს `auth.users` table-ში, მაგრამ ჩვენი `generations` table ცდილობს reference-ს `public.users` table-ზე.

## 🔧 გადაწყვეტა

### 1. Database Setup (Supabase Dashboard-ში)

გაუშვით შემდეგი SQL კოდი Supabase SQL Editor-ში:

```sql
-- Run the entire database/setup.sql file content
```

ან copy/paste `database/setup.sql` ფაილის მთელი შინაარსი.

### 2. Existing Users Migration

#### Option A: Manual Migration (Production-ისთვის)

1. Deploy ახალი კოდი Vercel-ზე
2. გაუშვით migration endpoint:

```bash
curl -X POST https://your-domain.vercel.app/api/migrate-users
```

#### Option B: Local Migration (Development)

```bash
npm run migrate-users
```

### 3. რა ხდება ახლა?

✅ **ახალი users**: ავტომატურად იქმნება `public.users` table-ში registration-ისას (database trigger)

✅ **Existing users**: `/api/generate` endpoint ავტომატურად შექმნის user record-ს თუ არ არსებობს

✅ **Migration**: შეგიძლიათ ყველა existing user-ის migration ერთბაშად

## 🚀 Deployment Steps

1. **Git Push:**
```bash
git add .
git commit -m "Fix database user migration issue"
git push
```

2. **Database Setup:**
   - Supabase Dashboard → SQL Editor
   - Copy/paste `database/setup.sql` content
   - Run SQL

3. **Migration:**
```bash
curl -X POST https://saagento.vercel.app/api/migrate-users
```

4. **Test:** სცადეთ ახლა image upload + generate

## ⚡ Quick Fix

თუ სწრაფი fix გჭირდებათ, უბრალოდ:

1. Push ახალი კოდი
2. გაუშვით migration endpoint
3. ყველაფერი უნდა იმუშაოს! 🎉
