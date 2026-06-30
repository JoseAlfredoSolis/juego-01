# Servidor web estatico simple para probar la version movil (PWA) del juego.
# Uso:  powershell -ExecutionPolicy Bypass -File serve.ps1   [puerto]
# Luego abre  http://localhost:8080/  en el navegador.

param([int]$Port = 8080)

$root = $PSScriptRoot
$prefix = "http://localhost:$Port/"

$mime = @{
  ".html"        = "text/html; charset=utf-8"
  ".js"          = "text/javascript; charset=utf-8"
  ".css"         = "text/css; charset=utf-8"
  ".json"        = "application/json; charset=utf-8"
  ".webmanifest" = "application/manifest+json; charset=utf-8"
  ".svg"         = "image/svg+xml"
  ".png"         = "image/png"
  ".jpg"         = "image/jpeg"
  ".ico"         = "image/x-icon"
}

$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add($prefix)

try {
  $listener.Start()
} catch {
  Write-Host "ERROR: no se pudo iniciar el servidor en $prefix" -ForegroundColor Red
  Write-Host $_.Exception.Message
  exit 1
}

Write-Host "Servidor iniciado en $prefix" -ForegroundColor Green
Write-Host "Abre en el navegador:  ${prefix}index.html"
Write-Host "Pulsa Ctrl+C para detenerlo."

while ($listener.IsListening) {
  try {
    $ctx = $listener.GetContext()
  } catch { break }

  $rel = [System.Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath).TrimStart('/')
  if ([string]::IsNullOrWhiteSpace($rel)) { $rel = "index.html" }

  $path = Join-Path $root $rel
  $full = [System.IO.Path]::GetFullPath($path)

  # Evita salir de la carpeta raiz
  if (-not $full.StartsWith([System.IO.Path]::GetFullPath($root))) {
    $ctx.Response.StatusCode = 403
    $ctx.Response.Close()
    continue
  }

  if (Test-Path $full -PathType Leaf) {
    $ext = [System.IO.Path]::GetExtension($full).ToLower()
    $ct = $mime[$ext]; if (-not $ct) { $ct = "application/octet-stream" }
    $bytes = [System.IO.File]::ReadAllBytes($full)
    $ctx.Response.ContentType = $ct
    $ctx.Response.ContentLength64 = $bytes.Length
    $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    Write-Host ("200  /{0}" -f $rel)
  } else {
    $ctx.Response.StatusCode = 404
    $msg = [System.Text.Encoding]::UTF8.GetBytes("404 - No encontrado: /$rel")
    $ctx.Response.OutputStream.Write($msg, 0, $msg.Length)
    Write-Host ("404  /{0}" -f $rel) -ForegroundColor Yellow
  }
  $ctx.Response.Close()
}
