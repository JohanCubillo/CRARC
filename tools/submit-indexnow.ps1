$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$indexNowKey = (Get-Content -LiteralPath (Join-Path $projectRoot 'indexnow-key.txt') -Raw).Trim()
$keyLocation = 'https://fundacioncrarc.org/indexnow-key.txt'
$published = Invoke-WebRequest -Uri $keyLocation -TimeoutSec 20
if ($published.Content.Trim() -ne $indexNowKey) { throw 'La clave de IndexNow todavía no está publicada. Espera a GitHub Pages y vuelve a intentar.' }
[xml]$sitemap = Get-Content -LiteralPath (Join-Path $projectRoot 'sitemap.xml') -Raw
$urls = @($sitemap.urlset.url | ForEach-Object { [string]$_.loc })
foreach ($url in $urls) { if (([uri]$url).Host -ne 'fundacioncrarc.org') { throw 'El sitemap contiene un dominio diferente.' } }
$body = @{host='fundacioncrarc.org';key=$indexNowKey;keyLocation=$keyLocation;urlList=$urls} | ConvertTo-Json -Depth 3
$result = Invoke-WebRequest -Uri 'https://api.indexnow.org/indexnow' -Method Post -ContentType 'application/json; charset=utf-8' -Body $body -TimeoutSec 30
Write-Output ('IndexNow: HTTP '+$result.StatusCode+'; '+$urls.Count+' URLs enviadas. Esto confirma recepción, no indexación.')
