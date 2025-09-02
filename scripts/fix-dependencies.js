#!/usr/bin/env node

/**
 * Dependency Resolution Fix Script
 * This script helps resolve dependency conflicts and ensures proper installation
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing dependency conflicts...');

// Check if package-lock.json exists and remove it
if (fs.existsSync('package-lock.json')) {
    console.log('🗑️  Removing package-lock.json...');
    fs.unlinkSync('package-lock.json');
}

// Check if node_modules exists and remove it
if (fs.existsSync('node_modules')) {
    console.log('🗑️  Removing node_modules...');
    fs.rmSync('node_modules', { recursive: true, force: true });
}

console.log('🧹 Clean install starting...');

try {
    // Install with legacy peer deps to resolve conflicts
    console.log('📦 Installing dependencies with --legacy-peer-deps...');
    execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });

    console.log('✅ Dependencies installed successfully!');

    // Verify critical packages
    console.log('🔍 Verifying critical packages...');

    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const nodeModulesPath = path.join(process.cwd(), 'node_modules');

    const criticalPackages = [
        '@supabase/supabase-js',
        '@supabase/ssr',
        'next',
        'react',
        'react-dom'
    ];

    let allGood = true;

    for (const pkg of criticalPackages) {
        const pkgPath = path.join(nodeModulesPath, pkg);
        if (fs.existsSync(pkgPath)) {
            const pkgJsonPath = path.join(pkgPath, 'package.json');
            if (fs.existsSync(pkgJsonPath)) {
                const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
                console.log(`✅ ${pkg}@${pkgJson.version}`);
            } else {
                console.log(`❌ ${pkg} - package.json missing`);
                allGood = false;
            }
        } else {
            console.log(`❌ ${pkg} - not installed`);
            allGood = false;
        }
    }

    if (allGood) {
        console.log('\n🎉 All critical packages are properly installed!');
        console.log('\n💡 Next steps:');
        console.log('   1. Test build: npm run build');
        console.log('   2. Test dev: npm run dev');
        console.log('   3. Commit and push to GitHub');
        console.log('   4. Deploy to Vercel');
    } else {
        console.log('\n⚠️  Some packages have issues. Please check manually.');
        process.exit(1);
    }

} catch (error) {
    console.error('❌ Error during installation:', error.message);
    console.log('\n🆘 Alternative solutions:');
    console.log('   1. Try: npm install --force');
    console.log('   2. Try: npm install --legacy-peer-deps --force');
    console.log('   3. Check Node.js version: node --version');
    console.log('   4. Check npm version: npm --version');
    process.exit(1);
}
