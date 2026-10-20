# Simple HTTP server for IT Giant Simulator
# Run: powershell -ExecutionPolicy Bypass -File serve.ps1

$port = 8080
$root = $PSScriptRoot

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()

Write-Host "==================================" -ForegroundColor Cyan
Write-Host " IT Giant Simulator Dev Server" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host " Open: http://localhost:$port" -ForegroundColor Green
Write-Host " Stop: Ctrl+C" -ForegroundColor Gray
Write-Host ""

$mimeTypes = @{
    '.html' = 'text/html; charset=utf-8'
    '.css'  = 'text/css; charset=utf-8'
    '.js'   = 'application/javascript; charset=utf-8'
    '.png'  = 'image/png'
    '.jpg'  = 'image/jpeg'
    '.ico'  = 'image/x-icon'
    '.json' = 'application/json'
}

while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $req = $ctx.Request
    $res = $ctx.Response

    $localPath = $req.Url.LocalPath
    if ($localPath -eq '/') { $localPath = '/index.html' }

    $filePath = Join-Path $root ($localPath.TrimStart('/').Replace('/', [char]92))
    $filePath = [System.IO.Path]::GetFullPath($filePath)

    Write-Host "$($req.HttpMethod) $localPath" -ForegroundColor DarkGray

    if (Test-Path $filePath -PathType Leaf) {
        $ext  = [System.IO.Path]::GetExtension($filePath)
        $mime = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { 'application/octet-stream' }
        $bytes = [System.IO.File]::ReadAllBytes($filePath)
        $res.ContentType     = $mime
        $res.ContentLength64 = $bytes.Length
        $res.StatusCode      = 200
        $res.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
        $res.StatusCode = 404
        $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
        $res.ContentLength64 = $msg.Length
        $res.OutputStream.Write($msg, 0, $msg.Length)
    }

    $res.OutputStream.Close()
}
