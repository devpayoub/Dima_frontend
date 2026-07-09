param(
  [string]$SourceDir = "C:\Users\THEGOAT\Desktop\stampee-main\front\components",
  [string]$TargetRoot = "C:\Users\THEGOAT\Desktop\stampee-main\front\features",
  [string]$AppFile = "C:\Users\THEGOAT\Desktop\stampee-main\front\App.tsx"
)

$MAP = @{
  "DashboardPage.tsx"      = "dashboard"
  "SettingsPage.tsx"       = "settings"
  "AnalyticsPage.tsx"      = "analytics"
  "TransactionsPage.tsx"   = "transactions"
  "CustomerDirectory.tsx"  = "customers"
  "IssuedCardsPage.tsx"    = "cards"
  "RequestsPage.tsx"       = "requests"
  "MyCards.tsx"            = "campaigns"
  "CardEditor.tsx"         = "campaigns"
  "LandingPage.tsx"        = "public"
  "ContactPage.tsx"        = "public"

}

function Convert-Imports($content) {
  # Each replacement uses a capturing group to preserve the import prefix
  # Order: more specific patterns first

  # ./ui/X -> @/components/ui/X
  $content = $content -replace "(from\s+['""])\./ui/([^'""]+)", '$1@/components/ui/$2'

  # ./skeletons/X -> @/components/skeletons/X
  $content = $content -replace "(from\s+['""])\./skeletons/([^'""]+)", '$1@/components/skeletons/$2'

  # ./shared/X -> @/components/shared/X
  $content = $content -replace "(from\s+['""])\./shared/([^'""]+)", '$1@/components/shared/$2'

  # ../lib/X -> @/lib/X
  $content = $content -replace "(from\s+['""])\.\./lib/([^'""]+)", '$1@/lib/$2'

  # ../types -> @/types
  $content = $content -replace "(from\s+['""])\.\./types([^'""]*)", '$1@/types$2'

  # ../store/X -> @/store/X
  $content = $content -replace "(from\s+['""])\.\./store/([^'""]+)", '$1@/store/$2'

  # ../services/X -> @/services/X
  $content = $content -replace "(from\s+['""])\.\./services/([^'""]+)", '$1@/services/$2'

  # ../data/X -> @/data/X
  $content = $content -replace "(from\s+['""])\.\./data/([^'""]+)", '$1@/data/$2'

  # ../hooks/X -> @/hooks/X
  $content = $content -replace "(from\s+['""])\.\./hooks/([^'""]+)", '$1@/hooks/$2'

  # ../api/X -> @/api/X
  $content = $content -replace "(from\s+['""])\.\./api/([^'""]+)", '$1@/api/$2'

  # ../db/X -> @/db/X
  $content = $content -replace "(from\s+['""])\.\./db/([^'""]+)", '$1@/db/$2'

  # ../storage/X -> @/storage/X
  $content = $content -replace "(from\s+['""])\.\./storage/([^'""]+)", '$1@/storage/$2'

  # ../slug -> @/slug
  $content = $content -replace "(from\s+['""])\.\./slug([^'""]*)", '$1@/slug$2'

  # ../siteConfig -> @/siteConfig
  $content = $content -replace "(from\s+['""])\.\./siteConfig([^'""]*)", '$1@/siteConfig$2'

  # ../templateSerialization -> @/templateSerialization
  $content = $content -replace "(from\s+['""])\.\./templateSerialization([^'""]*)", '$1@/templateSerialization$2'

  # ../transactionHelpers -> @/transactionHelpers
  $content = $content -replace "(from\s+['""])\.\./transactionHelpers([^'""]*)", '$1@/transactionHelpers$2'

  # ../links -> @/links
  $content = $content -replace "(from\s+['""])\.\./links([^'""]*)", '$1@/links$2'

  # ../analytics -> @/analytics
  $content = $content -replace "(from\s+['""])\.\./analytics([^'""]*)", '$1@/analytics$2'

  # ../iconRegistry -> @/iconRegistry
  $content = $content -replace "(from\s+['""])\.\./iconRegistry([^'""]*)", '$1@/iconRegistry$2'

  # ../format -> @/format
  $content = $content -replace "(from\s+['""])\.\./format([^'""]*)", '$1@/format$2'

  # ./AnyComponentName (starts with uppercase) -> @/components/ComponentName
  $content = $content -replace "(from\s+['""])\./([A-Z][^'""]*)", '$1@/components/$2'

  return $content
}

$moved = @()
$failed = @()

foreach ($file in $MAP.Keys) {
  $srcPath = Join-Path $SourceDir $file
  $targetSubdir = $MAP[$file]
  $targetDir = Join-Path $TargetRoot $targetSubdir
  $targetPath = Join-Path $targetDir $file

  if (-not (Test-Path $srcPath)) {
    Write-Warning "Source not found: $srcPath"
    $failed += $file
    continue
  }

  try {
    $content = Get-Content -LiteralPath $srcPath -Raw -ErrorAction Stop
    $converted = Convert-Imports $content
    if (-not (Test-Path $targetDir)) {
      New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    }
    Set-Content -LiteralPath $targetPath -Value $converted -NoNewLine -Encoding UTF8 -ErrorAction Stop
    $moved += $file
    Write-Host "OK $file -> features/$targetSubdir/"
  } catch {
    Write-Error "FAIL $file : $_"
    $failed += $file
  }
}

Write-Host "`n=== Migration: $($moved.Count) moved, $($failed.Count) failed ==="

# Update App.tsx lazy imports
Write-Host "`n=== Updating App.tsx lazy imports ==="
$appContent = Get-Content -LiteralPath $AppFile -Raw -Encoding UTF8
$changed = 0

$importMap = @{
  "DashboardPage"      = "features/dashboard/DashboardPage"
  "SettingsPage"       = "features/settings/SettingsPage"
  "AnalyticsPage"      = "features/analytics/AnalyticsPage"
  "TransactionsPage"   = "features/transactions/TransactionsPage"
  "CustomerDirectory"  = "features/customers/CustomerDirectory"
  "IssuedCardsPage"    = "features/cards/IssuedCardsPage"
  "RequestsPage"       = "features/requests/RequestsPage"
  "MyCards"            = "features/campaigns/MyCards"
  "CardEditor"         = "features/campaigns/CardEditor"
  "LandingPage"        = "features/public/LandingPage"
  "ContactPage"        = "features/public/ContactPage"
}

foreach ($name in $importMap.Keys) {
  $old = "'./components/$name'"
  $new = "'./$($importMap[$name])'"
  $appContent = $appContent.Replace($old, $new)
  Write-Host "  App.tsx: $old -> $new"
}

Set-Content -LiteralPath $AppFile -Value $appContent -NoNewLine -Encoding UTF8
Write-Host "App.tsx updated."

# Delete originals
Write-Host "`n=== Deleting originals ==="
$moved | ForEach-Object {
  $srcPath = Join-Path $SourceDir $_
  try {
    Remove-Item -LiteralPath $srcPath -Force -ErrorAction Stop
    Write-Host "OK deleted $_"
  } catch {
    Write-Warning "SKIP delete $_ (may have already been moved)"
  }
}

Write-Host "`nDONE. Run 'npm run build' to verify."
