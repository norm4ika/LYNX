/**
 * Environment Variables Check Utility
 * This file helps identify missing environment variables during build and runtime
 */

export interface EnvCheckResult {
    isValid: boolean
    missing: string[]
    warnings: string[]
}

export function checkEnvironmentVariables(): EnvCheckResult {
    const required = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'SUPABASE_SERVICE_ROLE_KEY'
    ]

    const optional = [
        'STRIPE_SECRET_KEY',
        'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
        'STRIPE_WEBHOOK_SECRET',
        'N8N_WEBHOOK_URL',
        'NEXT_PUBLIC_APP_URL'
    ]

    const missing: string[] = []
    const warnings: string[] = []

    // Check required variables
    for (const varName of required) {
        if (!process.env[varName]) {
            missing.push(varName)
        }
    }

    // Check optional variables and warn if missing
    for (const varName of optional) {
        if (!process.env[varName]) {
            warnings.push(varName)
        }
    }

    return {
        isValid: missing.length === 0,
        missing,
        warnings
    }
}

export function logEnvironmentStatus(): void {
    const result = checkEnvironmentVariables()

    if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Environment Variables Check:')

        if (result.isValid) {
            console.log('✅ All required environment variables are set')
        } else {
            console.log('❌ Missing required environment variables:')
            result.missing.forEach(varName => {
                console.log(`   - ${varName}`)
            })
        }

        if (result.warnings.length > 0) {
            console.log('⚠️  Missing optional environment variables:')
            result.warnings.forEach(varName => {
                console.log(`   - ${varName}`)
            })
        }
    }
}

// Auto-check on import in development
if (process.env.NODE_ENV === 'development') {
    logEnvironmentStatus()
}
