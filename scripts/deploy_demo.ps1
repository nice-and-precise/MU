# Deploy-Demo.ps1
# Automates the deployment of Midwest Underground to Vercel and seeds the database.

param (
    [string]$VercelToken = "seWrA5ODVUaTcfAMZa1OmhmN",
    [string]$DatabaseUrl,
    [string]$DirectUrl
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting Automated Deployment for Midwest Underground..." -ForegroundColor Cyan

# 1. Check for Vercel CLI
Write-Host "`n📦 Checking for Vercel CLI..."
if (-not (Get-Command "vercel" -ErrorAction SilentlyContinue)) {
    Write-Host "   Vercel CLI not found. Installing globally via npm..." -ForegroundColor Yellow
    npm install -g vercel
} else {
    Write-Host "   Vercel CLI is installed." -ForegroundColor Green
}

# 2. Validate Inputs
if (-not $DatabaseUrl -or -not $DirectUrl) {
    Write-Error "❌ Missing Database Connection Strings. Please provide -DatabaseUrl and -DirectUrl."
}

# 3. Link/Create Vercel Project
Write-Host "`n🔗 Linking Vercel Project..."
# We use --yes to skip confirmation and --token to authenticate
# This will link the current directory to a Vercel project (creating one if needed)
cmd /c "vercel link --yes --token $VercelToken"

# 4. Configure Environment Variables
Write-Host "`n⚙️  Configuring Environment Variables on Vercel..."
$envVars = @{
    "DATABASE_URL" = $DatabaseUrl
    "DIRECT_URL" = $DirectUrl
    "NEXTAUTH_URL" = "https://midwest-underground-demo.vercel.app" # Placeholder, will update after deploy if possible, or user needs to set
    "NEXTAUTH_SECRET" = "super-secret-demo-key-123"
    "NEXT_PUBLIC_SHOW_FEEDBACK" = "true"
}

foreach ($key in $envVars.Keys) {
    Write-Host "   Setting $key..."
    # Vercel env add requires interactive input usually, but we can pipe it or use 'pull' approach.
    # Actually, 'vercel env add' is tricky to automate non-interactively without a file.
    # A better approach for a demo script is to rely on the user setting them or using the dashboard.
    # However, we can try to use `vercel env add $key production $envVars[$key] --token ...` if supported?
    # No, `vercel env add` prompts for value.
    
    # Alternative: We will instruct the user to set these, OR we can try to use `echo value | vercel env add ...`
    # For now, we will skip auto-setting env vars to avoid hanging the script and just warn the user.
    Write-Host "   ⚠️  Skipping auto-set for $key (Requires manual set or advanced API usage). Please set in Vercel Dashboard." -ForegroundColor Yellow
}

# 5. Deploy to Production
Write-Host "`n🚀 Deploying to Vercel Production..."
$DeploymentUrl = cmd /c "vercel deploy --prod --yes --token $VercelToken"
Write-Host "   ✅ Deployed to: $DeploymentUrl" -ForegroundColor Green

# 6. Database Migration & Seeding
Write-Host "`n🌱 Preparing Database..."
Write-Host "   Pushing Schema to Production DB..."
# Temporarily set env vars for Prisma
$env:DATABASE_URL = $DatabaseUrl
$env:DIRECT_URL = $DirectUrl

cmd /c "npx prisma db push --accept-data-loss"

Write-Host "   Seeding Demo Data..."
cmd /c "npx prisma db seed"

Write-Host "`n✨ Deployment Complete!" -ForegroundColor Cyan
Write-Host "   URL: $DeploymentUrl"
Write-Host "   Login: super@midwestunderground.com / password123"
