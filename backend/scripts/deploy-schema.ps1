#!/bin/bash

# PowerShell equivalent: deploy-schema.ps1
# Local Schema Deployment Script for Windows

Write-Host "🚀 Starting local schema deployment..." -ForegroundColor Green

# Check om DIRECT_URL er tilgængelig
$directUrl = $env:DIRECT_URL
if (-not $directUrl) {
    $directUrl = $env:DATABASE_URL
}

if (-not $directUrl) {
    Write-Host "❌ Error: DIRECT_URL or DATABASE_URL environment variable is required" -ForegroundColor Red
    exit 1
}

Write-Host "📊 Database URL length: $($directUrl.Length)" -ForegroundColor Yellow
Write-Host "🔗 Using direct connection for schema operations" -ForegroundColor Yellow
Write-Host ""

# Set environment for alle kommandoer
$env:DATABASE_URL = $directUrl

try {
    # 1. Generate Prisma Client
    Write-Host "🔧 Generating Prisma Client..." -ForegroundColor Cyan
    npx prisma generate
    if ($LASTEXITCODE -ne 0) { throw "Prisma generate failed" }
    Write-Host "✅ Prisma Client generated successfully" -ForegroundColor Green
    Write-Host ""

    # 2. Check migration status
    Write-Host "📋 Checking migration status..." -ForegroundColor Cyan
    npx prisma migrate status
    # Ignore exit code for status check
    Write-Host "ℹ️  Migration status check completed" -ForegroundColor Yellow
    Write-Host ""

    # 3. Deploy migrations
    Write-Host "📦 Deploying migrations..." -ForegroundColor Cyan
    npx prisma migrate deploy
    if ($LASTEXITCODE -ne 0) { throw "Migration deploy failed" }
    Write-Host "✅ Migrations deployed successfully" -ForegroundColor Green
    Write-Host ""

    # 4. Test database connection
    Write-Host "🏥 Testing database connection..." -ForegroundColor Cyan
    $testScript = @"
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.salon.count()
    .then(count => {
        console.log('Salons in database:', count);
        process.exit(0);
    })
    .catch(err => {
        console.error('Connection test failed:', err.message);
        process.exit(1);
    });
"@
    $testScript | node
    if ($LASTEXITCODE -ne 0) { throw "Database connection test failed" }

    Write-Host ""
    Write-Host "🎉 Schema deployment completed successfully!" -ForegroundColor Green
    Write-Host "💡 You can now deploy your application without schema operations." -ForegroundColor Yellow

} catch {
    Write-Host ""
    Write-Host "❌ Schema deployment failed: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Tips:" -ForegroundColor Yellow
    Write-Host "  - Ensure DIRECT_URL points to direct database connection (port 5432)" -ForegroundColor Yellow
    Write-Host "  - Check that database is accessible from your local machine" -ForegroundColor Yellow
    Write-Host "  - Verify database credentials are correct" -ForegroundColor Yellow
    exit 1
}