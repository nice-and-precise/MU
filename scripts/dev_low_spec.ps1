# Low-Spec Development Mode Script
Write-Host "🚀 Starting Low-Spec Development Mode..." -ForegroundColor Cyan

# 1. Check and Stop Docker (Save RAM)
if (Get-Process "Docker Desktop" -ErrorAction SilentlyContinue) {
    Write-Host "⚠️  Docker Desktop is running. Stopping it to save RAM..." -ForegroundColor Yellow
    Stop-Process -Name "Docker Desktop" -Force -ErrorAction SilentlyContinue
    Stop-Process -Name "com.docker.backend" -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Docker stopped." -ForegroundColor Green
} else {
    Write-Host "✅ Docker is not running (Good)." -ForegroundColor Green
}

# 2. Kill Lingering Node Processes
Write-Host "🧹 Cleaning up lingering Node.js processes..." -ForegroundColor Cyan
taskkill /F /IM node.exe /T 2>$null
Write-Host "✅ Cleanup complete." -ForegroundColor Green

# 3. Set Memory Limits for Node
$env:NODE_OPTIONS="--max-old-space-size=4096"
Write-Host "🧠 Node memory limit set to 4GB." -ForegroundColor Green

# 4. Start Next.js (Standard Webpack - More Stable)
Write-Host "⚡ Starting Next.js..." -ForegroundColor Cyan
npm run dev
