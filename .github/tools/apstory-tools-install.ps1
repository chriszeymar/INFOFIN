param(
    [string]$ConfigFile = "./auth.config"
)

if (-not (Test-Path $ConfigFile)) {
    Write-Warning "auth.config not found at '$ConfigFile'."
    Write-Host "Copy .github/tools/auth.config.template to auth.config and fill credentials, then rerun." -ForegroundColor Yellow
    exit 1
}

Write-Host "Installing Apstory scaffold tool..." -ForegroundColor Cyan
dotnet tool install Apstory.Scaffold.App --global --configfile $ConfigFile -v d
if ($LASTEXITCODE -ne 0) {
    Write-Host "Tool may already exist. Trying update..." -ForegroundColor Yellow
    dotnet tool update Apstory.Scaffold.App --global --configfile $ConfigFile -v d
}

Write-Host "Installing Apstory TypeScript codegen tool..." -ForegroundColor Cyan
dotnet tool install Apstory.TypescriptCodeGen.Swagger --global --configfile $ConfigFile -v d
if ($LASTEXITCODE -ne 0) {
    Write-Host "Tool may already exist. Trying update..." -ForegroundColor Yellow
    dotnet tool update Apstory.TypescriptCodeGen.Swagger --global --configfile $ConfigFile -v d
}

Write-Host "Installed global tools:" -ForegroundColor Green
dotnet tool list -g
