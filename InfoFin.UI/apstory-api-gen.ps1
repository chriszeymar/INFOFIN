param(
    [string]$ConfigFilePath = ""
)

$repoScript = Join-Path $PSScriptRoot "..\.github\tools\apstory-api-gen.ps1"
if (-not (Test-Path $repoScript)) {
    Write-Error "Cannot find repo script: $repoScript"
    exit 1
}

$cfg = if ([string]::IsNullOrWhiteSpace($ConfigFilePath)) {
    Join-Path $PSScriptRoot "apstory-api-gen-config.json"
} else {
    $ConfigFilePath
}

& $repoScript -ConfigFilePath $cfg
