#!/usr/bin/env node

const https = require('https');
const http = require('http');

// Get the app URL from environment or use default
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const MIGRATE_URL = `${APP_URL}/api/migrate-users`;

console.log('🚀 Starting user migration...');
console.log('Target URL:', MIGRATE_URL);

const requestLib = MIGRATE_URL.startsWith('https:') ? https : http;

const postData = JSON.stringify({});

const options = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

const req = requestLib.request(MIGRATE_URL, options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const result = JSON.parse(data);

            console.log('\n✅ Migration completed!');
            console.log('📊 Results:');
            console.log(`   • Total auth users: ${result.totalAuthUsers}`);
            console.log(`   • Users to migrate: ${result.usersToMigrate}`);
            console.log(`   • Successfully migrated: ${result.successCount}`);
            console.log(`   • Failed migrations: ${result.failureCount}`);

            if (result.migrations && result.migrations.length > 0) {
                console.log('\n📋 Migration details:');
                result.migrations.forEach((migration, index) => {
                    const status = migration.success ? '✅' : '❌';
                    console.log(`   ${index + 1}. ${status} ${migration.email} (${migration.userId})`);
                    if (!migration.success && migration.error) {
                        console.log(`      Error: ${migration.error}`);
                    }
                });
            }
        } catch (error) {
            console.error('❌ Failed to parse response:', error.message);
            console.log('Raw response:', data);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
});

req.write(postData);
req.end();
