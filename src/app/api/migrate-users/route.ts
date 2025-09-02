import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
    try {
        // Get all auth users who don't exist in public.users
        const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()

        if (authError) {
            console.error('Error fetching auth users:', authError)
            return NextResponse.json({ error: 'Failed to fetch auth users' }, { status: 500 })
        }

        // Get existing users in public.users table
        const { data: existingUsers, error: existingError } = await supabaseAdmin
            .from('users')
            .select('id')

        if (existingError) {
            console.error('Error fetching existing users:', existingError)
            return NextResponse.json({ error: 'Failed to fetch existing users' }, { status: 500 })
        }

        const existingUserIds = new Set(existingUsers?.map(u => u.id) || [])

        // Find users who need to be migrated
        const usersToMigrate = authUsers.users.filter(user =>
            !existingUserIds.has(user.id) && user.email
        )

        console.log(`Found ${usersToMigrate.length} users to migrate`)

        // Migrate users
        const migrations: any[] = []
        for (const authUser of usersToMigrate) {
            try {
                const { error: insertError } = await supabaseAdmin
                    .from('users')
                    .insert({
                        id: authUser.id,
                        email: authUser.email!,
                        created_at: authUser.created_at,
                        updated_at: new Date().toISOString()
                    })

                if (insertError) {
                    console.error(`Failed to migrate user ${authUser.id}:`, insertError)
                    migrations.push({
                        userId: authUser.id,
                        email: authUser.email,
                        success: false,
                        error: insertError.message
                    })
                } else {
                    console.log(`Successfully migrated user ${authUser.id}`)
                    migrations.push({
                        userId: authUser.id,
                        email: authUser.email,
                        success: true
                    })
                }
            } catch (error) {
                console.error(`Error migrating user ${authUser.id}:`, error)
                migrations.push({
                    userId: authUser.id,
                    email: authUser.email,
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                })
            }
        }

        const successCount = migrations.filter(m => m.success).length
        const failureCount = migrations.filter(m => !m.success).length

        return NextResponse.json({
            message: 'User migration completed',
            totalAuthUsers: authUsers.users.length,
            usersToMigrate: usersToMigrate.length,
            successCount,
            failureCount,
            migrations
        })

    } catch (error) {
        console.error('Migration error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
