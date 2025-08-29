# 🗄️ Database Setup Instructions

## პრობლემის გადაწყვეტა

თქვენი `/api/callback` ენდფოინთი აბრუნებს 500 შეცდომას იმიტომ, რომ:

1. **Database Schema**: ბაზაში არ არის ახალი კოლუმები (`quality_score`, `processing_time`, და ა.შ.)
2. **RLS Policies**: Row Level Security ბლოკავს service role-ის წვდომას
3. **Data Type Conversion**: N8N აგზავნის ყველაფერს string-ად, მაგრამ ბაზა ელოდება რიცხვებს

## 🔧 გადაწყვეტის ნაბიჯები

### 1. Database Migration (კრიტიკული!)

გაუშვით შემდეგი SQL კოდი Supabase Dashboard → SQL Editor-ში:

```sql
-- Copy და paste მთელი შინაარსი database/migration-add-advanced-columns.sql ფაილიდან
```

ან უბრალოდ copy/paste ყველაფერი `database/migration-add-advanced-columns.sql` ფაილიდან.

### 2. Environment Variables შემოწმება

დარწმუნდით, რომ `.env.local` ფაილში გაქვთ:

```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **მნიშვნელოვანი**: Service Role Key აუცილებელია callback ენდფოინთისთვის!

### 3. Vercel Environment Variables

Vercel Dashboard-ში დაამატეთ:
- `SUPABASE_SERVICE_ROLE_KEY` (იგივე, რაც .env.local-ში)

### 4. Deploy და Test

```bash
git add .
git commit -m "Fix callback endpoint with proper database schema and RLS policies"
git push
```

## ✅ რა მოხდა ახლა?

### Database Changes:
- ✅ **ახალი კოლუმები**: `quality_score`, `processing_time`, `commercial_style`, და ა.შ.
- ✅ **RLS Policy**: Service Role-ს შეუძლია ნებისმიერი generation-ის განახლება
- ✅ **Indexes**: Performance-ისთვის

### Code Changes:
- ✅ **Type Conversion**: String → Number კონვერტაცია
- ✅ **Error Handling**: დეტალური error logging
- ✅ **TypeScript Types**: განახლებული interface-ები

## 🧪 Testing

N8N workflow-ის callback-ის შემდეგ:

1. **Success Response**:
```json
{
  "success": true,
  "message": "Ultra-realistic generation updated successfully",
  "data": {
    "generationId": "...",
    "status": "completed",
    "qualityScore": 9.5,
    "processingTime": 45000
  }
}
```

2. **Detailed Logging**: Console-ში ნახავთ:
```
Update data: {
  "quality_score": 9.5,
  "processing_time": 45000,
  "status": "completed",
  ...
}
```

## 🚨 Common Issues

### Issue 1: "column does not exist"
**გადაწყვეტა**: გაუშვით migration SQL

### Issue 2: "RLS policy violation"  
**გადაწყვეტა**: დარწმუნდით, რომ `SUPABASE_SERVICE_ROLE_KEY` სწორადაა დაყენებული

### Issue 3: "Generation not found"
**გადაწყვეტა**: შეამოწმეთ, რომ N8N აგზავნის სწორ `generationId`-ს

## 📞 Debug Commands

```bash
# Check environment variables
echo $SUPABASE_SERVICE_ROLE_KEY

# Test callback endpoint locally
curl -X POST http://localhost:3000/api/callback \
  -H "Content-Type: application/json" \
  -d '{"generationId":"test-id","status":"completed","qualityScore":"9.5"}'
```

## 🎉 Expected Result

N8N callback უნდა დაბრუნდეს წარმატებით და Supabase-ში generation ჩანაწერი განახლდეს ყველა ახალი მონაცემით!
