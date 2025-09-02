# 🔧 Build Script Fix Guide

## ❌ პრობლემა
Vercel-ზე build-ისას მოდის შეცდომა:
```
Error: Cannot find module '/vercel/path0/scripts/vercel-build-check.js'
```

## 🔍 პრობლემის მიზეზი
- `package.json`-ში build script იყენებდა `scripts/vercel-build-check.js` ფაილს
- Vercel environment-ში path resolution არ მუშაობდა სწორად
- Script ფაილი ვერ მოიძებნა build process-ისას

## ✅ გადაწყვეტა

### 1. შექმნილია ახალი build script
- `vercel-build.js` - Vercel-ისთვის განკუთვნილი build script
- `package.json`-ში დამატებულია `build:vercel` script
- `vercel.json`-ში buildCommand განახლებულია

### 2. Script Structure
```json
{
  "scripts": {
    "build": "next build",           // Local development
    "build:vercel": "node vercel-build.js && next build"  // Vercel deployment
  }
}
```

### 3. Vercel Configuration
```json
{
  "buildCommand": "npm run build:vercel"
}
```

## 🚀 როგორ მუშაობს

### Local Development
```bash
npm run build
# უბრალოდ next build, ყოველთვის წარმატებით
```

### Vercel Deployment
```bash
npm run build:vercel
# 1. ჯერ vercel-build.js script
# 2. შემდეგ next build
```

## 🔍 Build Script Features

### 1. Environment Detection
- ამოიცნობს Vercel vs Local environment
- აჩვენებს სად მუშაობს

### 2. Node.js Version Check
- ამოწმებს Node.js 22.x
- აფუძნებს build-ს თუ version სწორია

### 3. Environment Variables Check
- ამოწმებს required variables
- აფუძნებს build-ს თუ ყველა დაყენებულია

### 4. Detailed Logging
- აჩვენებს build process-ის status
- აფრთხილებს missing variables-ის შესახებ

## 📁 ფაილები რომლებიც შეიქმნა/შეასწორა

### New Files
- `vercel-build.js` - Vercel build script

### Modified Files
- `package.json` - Added build:vercel script
- `vercel.json` - Updated buildCommand

## 🔧 Script Commands

### Available Commands
```bash
npm run build          # Local build (simple)
npm run build:vercel   # Vercel build (with checks)
npm run fix-deps       # Fix dependencies
npm run clean-install  # Clean install
```

### Build Process
1. **Environment Check** - Vercel vs Local
2. **Node.js Version** - Must be 22.x
3. **Environment Variables** - Required variables check
4. **Next.js Build** - Standard build process

## ⚠️ მნიშვნელოვანი შენიშვნები

1. **Local Development**: `npm run build` ყოველთვის მუშაობს
2. **Vercel Deployment**: `npm run build:vercel` ამოწმებს ყველაფერს
3. **Path Resolution**: `vercel-build.js` root directory-შია
4. **Environment Variables**: Script ამოწმებს ყველა required variable-ს

## 🆘 Troubleshooting

### Script Not Found
- დარწმუნდით რომ `vercel-build.js` root directory-შია
- შეამოწმეთ რომ `vercel.json` სწორად არის configured

### Build Still Fails
- შეამოწმეთ environment variables Vercel Dashboard-ზე
- დარწმუნდით რომ Node.js 22.x გამოიყენება

### Local vs Vercel
- Local: `npm run build` (simple)
- Vercel: `npm run build:vercel` (with checks)

## 🎯 Expected Result

Build script fix-ის შემდეგ:
- ✅ Local build მუშაობს უპრობლემოდ
- ✅ Vercel build მუშაობს უპრობლემოდ
- ✅ Environment variables ამოწმება build process-ში
- ✅ Node.js version ამოწმება build process-ში
- ✅ Detailed logging build process-ისას

## 📋 Verification Steps

- [ ] `vercel-build.js` ფაილი root directory-შია
- [ ] `package.json`-ში `build:vercel` script დამატებულია
- [ ] `vercel.json`-ში `buildCommand` განახლებულია
- [ ] Local build მუშაობს: `npm run build`
- [ ] Vercel build script მუშაობს: `npm run build:vercel`

---
**💡 Tip**: ყოველთვის test-გააკეთეთ locally `npm run build:vercel` Vercel deployment-ის წინ!
