param(
    [string]$Namespace = "InfoFin",
    [string]$SqlProjectPath = "",
    [string]$Schema = "dbo"
)

$toolCheck = Get-Command Apstory.Scaffold.App -ErrorAction SilentlyContinue
if (-not $toolCheck) {
    Write-Error "Apstory.Scaffold.App not found in PATH."
    Write-Error "Install it using: dotnet tool install -g apstory.scaffold.app"
    exit 1
}

$args = @("-regen", $Schema, "-namespace", $Namespace)
if (-not [string]::IsNullOrWhiteSpace($SqlProjectPath)) {
    $args += @("-sqlproj", $SqlProjectPath)
}

Write-Host "Running scaffold with namespace '$Namespace' and schema '$Schema'..." -ForegroundColor Cyan
if (-not [string]::IsNullOrWhiteSpace($SqlProjectPath)) {
    Write-Host "Using SQL project path: $SqlProjectPath" -ForegroundColor DarkCyan
}

Apstory.Scaffold.App @args
