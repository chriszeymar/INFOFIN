# Apstory Codegen Setup (InfoFin)

This folder contains deterministic scripts aligned with the internal wiki and adapted for this repository.

## 1) Optional private-feed install/update (wiki style)

If your environment requires Azure DevOps private feed auth:

1. Copy `auth.config.template` to `auth.config`.
2. Fill `Username` and `PAT` (Packaging scope).
3. Run:

```powershell
cd C:\repos\InfoFin
.\.github\tools\apstory-tools-install.ps1 -ConfigFile .\.github\tools\auth.config
```

If tools are already installed globally, this step can be skipped.

## 2) Run scaffold generation

Run from repo root:

```powershell
cd C:\repos\InfoFin
.\.github\tools\apstory-scaffold.ps1 -Namespace InfoFin -Schema dbo
```

Notes:
- Script uses `Apstory.Scaffold.App` from PATH (version-agnostic).
- `DB/InfoFin.DB/InfoFin.DB.sqlproj` is used for table discovery.

## 3) Post-generation compatibility patch (current tool issue)

Current generator version may emit invalid foreign-key interface signatures for this schema. Apply this one-liner after generation:

```powershell
Get-ChildItem C:\repos\InfoFin\Domain\InfoFin.Domain.Interface\Gen -Filter *.Gen.cs | ForEach-Object { (Get-Content $_.FullName) | Where-Object { $_ -notmatch 'IncludeForeignKeys' } | Set-Content $_.FullName }
```

## 4) Validate build

```powershell
dotnet build C:\repos\InfoFin\InfoFin.slnx -v minimal
```

## 5) TypeScript Swagger codegen

Ensure API is running first, then:

```powershell
cd C:\repos\InfoFin
.\.github\tools\apstory-api-gen.ps1
```

Config file: `.github/tools/apstory-api-gen-config.json`

Supports wiki options: `-u`, `-v`, `-o`, `-e`, `-c`, plus `-g`.
