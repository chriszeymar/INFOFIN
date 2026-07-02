param(
    [string]$ConfigFilePath = ""
)

# Configuration file path
$configFile = if ([string]::IsNullOrWhiteSpace($ConfigFilePath)) {
    Join-Path $PSScriptRoot "apstory-api-gen-config.json"
} else {
    $ConfigFilePath
}

if (-not (Test-Path $configFile)) {
    Write-Error "Config file not found: $configFile"
    exit 1
}

$config = Get-Content $configFile | ConvertFrom-Json

# Verify the global tool is available
$toolCheck = Get-Command Apstory.TypescriptCodeGen.Swagger -ErrorAction SilentlyContinue
if (-not $toolCheck) {
    Write-Error "Apstory.TypescriptCodeGen.Swagger not found."
    Write-Error "Please ensure the tool is installed: dotnet tool install -g apstory.typescriptcodegen.swagger"
    exit 1
}

Write-Host "Generating TypeScript code from Swagger..." -ForegroundColor Cyan
Write-Host "Generating for API Version $($config.ApiVersion) from $($config.ApiUrl)..." -ForegroundColor Yellow

if ([string]::IsNullOrWhiteSpace($config.ExportFile)) {
    Write-Error "ExportFile is required in config."
    exit 1
}

Apstory.TypescriptCodeGen.Swagger -u $config.ApiUrl -v $config.ApiVersion -o $config.OutputPath -e $config.ExportFile -g $config.GroupName -c $config.CachingInstructions

Write-Host "TypeScript code generation completed!" -ForegroundColor Green
