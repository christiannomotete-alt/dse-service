param(
    [string]$SiteRoot = "https://www.dse-service.com"
)

$ErrorActionPreference = "Stop"
$root = Get-Location
$errors = @()
$warnings = @()

function Add-Error {
    param([string]$Message)
    $script:errors += $Message
}

function Add-Warning {
    param([string]$Message)
    $script:warnings += $Message
}

function Get-LinksFromHtml {
    param([string]$Content)
    $pattern = '(?i)(?:href|src)\s*=\s*"([^"]+)"'
    $matches = [regex]::Matches($Content, $pattern)
    return $matches | ForEach-Object { $_.Groups[1].Value }
}

function Resolve-LocalPath {
    param(
        [string]$BaseFile,
        [string]$Ref
    )

    $clean = ($Ref -split '#')[0]
    $clean = ($clean -split '\?')[0]

    if ([string]::IsNullOrWhiteSpace($clean)) {
        return $null
    }

    if ($clean.StartsWith('/')) {
        $relative = $clean.TrimStart('/')
        return Join-Path -Path $root -ChildPath $relative
    }

    $baseDir = Split-Path -Parent $BaseFile
    return Join-Path -Path $baseDir -ChildPath $clean
}

$htmlFiles = Get-ChildItem -Path $root -Filter *.html -File | Where-Object {
    $_.Name -notmatch '^google[a-z0-9]+\.html$'
}

foreach ($file in $htmlFiles) {
    $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8

    if ($content -notmatch '<title>.+</title>') {
        Add-Error "Missing <title>: $($file.Name)"
    }

    if ($content -notmatch '<meta\s+name="description"\s+content="[^"]+') {
        Add-Error "Missing meta description: $($file.Name)"
    }

    if ($content -notmatch '<link\s+rel="canonical"\s+href="https://www\.dse-service\.com/[^"]*"') {
        Add-Error "Missing canonical link: $($file.Name)"
    }

    $links = Get-LinksFromHtml -Content $content
    foreach ($link in $links) {
        if ($link -match '^(https?:|mailto:|tel:|data:|javascript:|#)') {
            continue
        }

        $resolved = Resolve-LocalPath -BaseFile $file.FullName -Ref $link
        if (-not $resolved) {
            continue
        }

        if ($resolved.EndsWith('\')) {
            $resolved = Join-Path -Path $resolved -ChildPath 'index.html'
        }

        if (-not (Test-Path -LiteralPath $resolved)) {
            Add-Error "Broken local link in $($file.Name): $link"
        }
    }
}

$sitemapPath = Join-Path -Path $root -ChildPath 'sitemap.xml'
if (-not (Test-Path -LiteralPath $sitemapPath)) {
    Add-Error "Missing sitemap.xml"
} else {
    $sitemap = Get-Content -Path $sitemapPath -Raw -Encoding UTF8
    $locMatches = [regex]::Matches($sitemap, '<loc>([^<]+)</loc>')
    foreach ($match in $locMatches) {
        $url = $match.Groups[1].Value.Trim()
        if (-not $url.StartsWith($SiteRoot)) {
            Add-Warning "Sitemap URL outside expected root: $url"
            continue
        }

        $path = $url.Replace($SiteRoot, '').TrimStart('/')
        if ([string]::IsNullOrWhiteSpace($path)) {
            $path = 'index.html'
        }

        $local = Join-Path -Path $root -ChildPath $path
        if (-not (Test-Path -LiteralPath $local)) {
            Add-Error "Sitemap points to missing file: $url"
        }
    }
}

$robotsPath = Join-Path -Path $root -ChildPath 'robots.txt'
if (-not (Test-Path -LiteralPath $robotsPath)) {
    Add-Error "Missing robots.txt"
} else {
    $robots = Get-Content -Path $robotsPath -Raw -Encoding UTF8
    if ($robots -notmatch [regex]::Escape("Sitemap: $SiteRoot/sitemap.xml")) {
        Add-Error "robots.txt missing expected sitemap directive"
    }
}

$legalPath = Join-Path -Path $root -ChildPath 'mentions-legales.html'
if (Test-Path -LiteralPath $legalPath) {
    $legalContent = Get-Content -Path $legalPath -Raw -Encoding UTF8
    if ($legalContent -match 'Non communiqué') {
        Add-Warning "Legal identifiers still marked 'Non communiqué' in mentions-legales.html"
    }
}

Write-Output "=== Predeploy Check Summary ==="
Write-Output "HTML files checked: $($htmlFiles.Count)"
Write-Output "Errors: $($errors.Count)"
Write-Output "Warnings: $($warnings.Count)"

if ($warnings.Count -gt 0) {
    Write-Output ""
    Write-Output "Warnings:"
    $warnings | ForEach-Object { Write-Output "- $_" }
}

if ($errors.Count -gt 0) {
    Write-Output ""
    Write-Output "Errors:"
    $errors | ForEach-Object { Write-Output "- $_" }
    exit 1
}

Write-Output "All critical checks passed."
exit 0
