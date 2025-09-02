#!/usr/bin/env node

/**
 * Vercel Build Environment Check Script
 * This script runs during the build process to verify environment variables
 */

const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
]

const optionalVars = [
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'N8N_WEBHOOK_URL',
    'NEXT_PUBLIC_APP_URL'
]

console.log('🔍 Checking environment variables for Vercel build...')

let hasErrors = false
const missing = []
const warnings = []

// Check required variables
for (const varName of requiredVars) {
    if (!process.env[varName]) {
        missing.push(varName)
        hasErrors = true
    }
}

// Check optional variables
for (const varName of optionalVars) {
    if (!process.env[varName]) {
        warnings.push(varName)
    }
}

// Report results
if (missing.length > 0) {
    console.error('❌ Missing required environment variables:')
    missing.forEach(varName => {
        console.error(`   - ${varName}`)
    })
    console.error('\n💡 Please add these variables in your Vercel project settings:')
    console.error('   Settings → Environment Variables')
}

if (warnings.length > 0) {
    console.log('\n⚠️  Missing optional environment variables:')
    warnings.forEach(varName => {
        console.log(`   - ${varName}`)
    })
    console.log('   These are not required for basic functionality but may limit features.')
}

if (hasErrors) {
    console.error('\n🚨 Build cannot proceed without required environment variables!')
    process.exit(1)
} else {
    console.log('\n✅ All required environment variables are set. Build can proceed.')

    if (warnings.length === 0) {
        console.log('🎉 All environment variables are configured!')
    }
}

console.log('\n📋 Environment Variables Summary:')
console.log(`   Required: ${requiredVars.length - missing.length}/${requiredVars.length} set`)
console.log(`   Optional: ${optionalVars.length - warnings.length}/${optionalVars.length} set`)
