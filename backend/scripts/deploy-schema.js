#!/usr/bin/env node

/**
 * Local Schema Deployment Script
 * 
 * Dette script kører schema operationer lokalt med direkte database forbindelse,
 * hvilket undgår timeout problemer med pooled forbindelser under deployment.
 * 
 * Kør dette script lokalt før deployment for at sikre at schema'et er opdateret.
 */

const { execSync } = require('child_process');
const path = require('path');

// Sørg for at vi er i backend directory
process.chdir(path.join(__dirname, '..'));

console.log('🚀 Starting local schema deployment...\n');

// Check om DIRECT_URL er tilgængelig
const directUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!directUrl) {
    console.error('❌ Error: DIRECT_URL or DATABASE_URL environment variable is required');
    process.exit(1);
}

console.log('📊 Database URL length:', directUrl.length);
console.log('🔗 Using direct connection for schema operations\n');

try {
    // 1. Generate Prisma Client
    console.log('🔧 Generating Prisma Client...');
    execSync('npx prisma generate', { 
        stdio: 'inherit',
        env: { ...process.env, DATABASE_URL: directUrl }
    });
    console.log('✅ Prisma Client generated successfully\n');

    // 2. Check migration status
    console.log('📋 Checking migration status...');
    try {
        execSync('npx prisma migrate status', { 
            stdio: 'inherit',
            env: { ...process.env, DATABASE_URL: directUrl }
        });
    } catch (error) {
        console.log('ℹ️  Migration status check completed (some pending migrations are normal)\n');
    }

    // 3. Deploy migrations
    console.log('📦 Deploying migrations...');
    execSync('npx prisma migrate deploy', { 
        stdio: 'inherit',
        env: { ...process.env, DATABASE_URL: directUrl },
        timeout: 60000 // 60 sekunder timeout
    });
    console.log('✅ Migrations deployed successfully\n');

    // 4. Optional: Check database connection
    console.log('🏥 Testing database connection...');
    execSync('node -e "const { PrismaClient } = require(\'@prisma/client\'); const prisma = new PrismaClient(); prisma.salon.count().then(count => { console.log(\'Salons in database:\', count); process.exit(0); }).catch(err => { console.error(\'Connection test failed:\', err.message); process.exit(1); });"', {
        stdio: 'inherit',
        env: { ...process.env, DATABASE_URL: directUrl }
    });

    console.log('\n🎉 Schema deployment completed successfully!');
    console.log('💡 You can now deploy your application without schema operations.');

} catch (error) {
    console.error('\n❌ Schema deployment failed:', error.message);
    console.error('\n💡 Tips:');
    console.error('  - Ensure DIRECT_URL points to direct database connection (port 5432)');
    console.error('  - Check that database is accessible from your local machine');
    console.error('  - Verify database credentials are correct');
    process.exit(1);
}