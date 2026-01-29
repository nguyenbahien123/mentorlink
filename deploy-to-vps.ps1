# Script tự động zip code và upload lên VPS
# Sử dụng: .\deploy-to-vps.ps1

param(
    [string]$VpsIp = "103.118.28.130",
    [string]$VpsUser = "root",
    [string]$VpsPassword = "Hien25170604@",
    [switch]$SkipZip = $false,
    [switch]$SkipUpload = $false
)

# Colors
$Green = @{ ForegroundColor = "Green" }
$Yellow = @{ ForegroundColor = "Yellow" }
$Red = @{ ForegroundColor = "Red" }

Write-Host "========================================" @Yellow
Write-Host "🚀 MentorLink Deploy to VPS (No GitHub)" @Yellow
Write-Host "========================================" @Yellow
Write-Host ""

# Get current directory
$ProjectDir = Get-Location
Write-Host "📁 Project Directory: $ProjectDir" @Green

# Step 1: Zip project
if (-not $SkipZip) {
    Write-Host "Step 1: Zipping project..." @Yellow
    
    $ZipFile = "$ProjectDir\mentor-code.zip"
    
    # Remove old zip if exists
    if (Test-Path $ZipFile) {
        Remove-Item $ZipFile -Force
        Write-Host "  (Removed old zip)" @Green
    }
    
    # Create zip (exclude unnecessary folders)
    Get-ChildItem $ProjectDir | Where-Object {
        $_.Name -notin @(
            'mentor-code.zip',
            '.git',
            'node_modules',
            'backend/target',
            'frontend/dist',
            '.vscode',
            '.idea'
        )
    } | Compress-Archive -DestinationPath $ZipFile -Update
    
    $ZipSize = (Get-Item $ZipFile).Length / 1MB
    Write-Host "✓ Zip created: mentor-code.zip ($([math]::Round($ZipSize, 2)) MB)" @Green
} else {
    Write-Host "Step 1: Skipped (using existing zip)" @Yellow
}

# Step 2: Upload to VPS
if (-not $SkipUpload) {
    Write-Host ""
    Write-Host "Step 2: Uploading to VPS..." @Yellow
    
    $ZipFile = "$ProjectDir\mentor-code.zip"
    
    if (-not (Test-Path $ZipFile)) {
        Write-Host "✗ Zip file not found!" @Red
        exit 1
    }
    
    try {
        # Using scp (available in Windows 10+)
        # If scp not available, use plink + pscp from PuTTY
        
        $ScpCommand = "scp -P 22 `"$ZipFile`" ${VpsUser}@${VpsIp}:/tmp/"
        Write-Host "Running: scp ..." @Green
        
        # Try built-in scp first
        if (Get-Command scp -ErrorAction SilentlyContinue) {
            Invoke-Expression $ScpCommand 2>&1 | Tee-Object -Variable ScpOutput
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✓ Upload successful!" @Green
            } else {
                Write-Host "✗ Upload failed!" @Red
                Write-Host $ScpOutput @Red
                exit 1
            }
        } else {
            Write-Host "⚠️  scp command not found. Using alternative method..." @Yellow
            Write-Host "Please upload mentor-code.zip manually using WinSCP:" @Yellow
            Write-Host "  Host: $VpsIp" @Yellow
            Write-Host "  User: $VpsUser" @Yellow
            Write-Host "  Password: (saved)" @Yellow
            Write-Host "  Destination: /tmp/mentor-code.zip" @Yellow
            exit 0
        }
    } catch {
        Write-Host "✗ Error: $_" @Red
        exit 1
    }
} else {
    Write-Host "Step 2: Skipped (already uploaded)" @Yellow
}

# Step 3: Show next steps
Write-Host ""
Write-Host "========================================" @Green
Write-Host "✓ Upload Complete!" @Green
Write-Host "========================================" @Green
Write-Host ""
Write-Host "Next steps on VPS:" @Yellow
Write-Host "1. SSH to VPS:" @Green
Write-Host "   ssh $VpsUser@$VpsIp" @Green
Write-Host "   Password: (your password)"
Write-Host ""
Write-Host "2. Unzip and deploy:" @Green
Write-Host "   cd /var/www" @Green
Write-Host "   unzip /tmp/mentor-code.zip -d Group02_MentorLink" @Green
Write-Host "   cd Group02_MentorLink" @Green
Write-Host ""
Write-Host "3. Setup (first time only):" @Green
Write-Host "   bash scripts/setup-vps.sh" @Green
Write-Host ""
Write-Host "4. Configure environment:" @Green
Write-Host "   cp .env.production .env" @Green
Write-Host "   nano .env" @Green
Write-Host "   (Edit and save: Ctrl+O, Enter, Ctrl+X)" @Green
Write-Host ""
Write-Host "5. Deploy:" @Green
Write-Host "   docker compose up -d --build" @Green
Write-Host "   docker compose logs -f" @Green
Write-Host ""
Write-Host "Website will be at: http://$VpsIp" @Green
Write-Host ""
