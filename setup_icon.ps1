<<<<<<< HEAD
# Download icon from icons8
$iconUrl = "https://img.icons8.com/fluency/96/paper-plane.png"
$outputPath = "public\paper-plane.png"
$icoPath = "public\favicon.ico"

# Create WebClient object
$webClient = New-Object System.Net.WebClient

# Download the icon
Write-Host "Downloading plane icon..."
$webClient.DownloadFile($iconUrl, $outputPath)

# Convert PNG to ICO using ImageMagick if available
if (Get-Command magick -ErrorAction SilentlyContinue) {
    Write-Host "Converting to ICO format..."
    magick convert $outputPath -define icon:auto-resize=64,32,24,16 $icoPath
} else {
    Write-Host "ImageMagick not found. Please install it to convert the icon."
    Write-Host "You can download it from: https://imagemagick.org/script/download.php"
    Write-Host "For now, we'll copy the PNG file as is."
    Copy-Item $outputPath $icoPath
}

# Update the shortcut
Write-Host "Updating desktop shortcut..."
$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut([System.Environment]::GetFolderPath("Desktop") + "\Quick Quote.lnk")
$Shortcut.IconLocation = "$pwd\$icoPath"
$Shortcut.Save()

Write-Host "Icon updated successfully!"
=======
# Download icon from icons8
$iconUrl = "https://img.icons8.com/fluency/96/paper-plane.png"
$outputPath = "public\paper-plane.png"
$icoPath = "public\favicon.ico"

# Create WebClient object
$webClient = New-Object System.Net.WebClient

# Download the icon
Write-Host "Downloading plane icon..."
$webClient.DownloadFile($iconUrl, $outputPath)

# Convert PNG to ICO using ImageMagick if available
if (Get-Command magick -ErrorAction SilentlyContinue) {
    Write-Host "Converting to ICO format..."
    magick convert $outputPath -define icon:auto-resize=64,32,24,16 $icoPath
} else {
    Write-Host "ImageMagick not found. Please install it to convert the icon."
    Write-Host "You can download it from: https://imagemagick.org/script/download.php"
    Write-Host "For now, we'll copy the PNG file as is."
    Copy-Item $outputPath $icoPath
}

# Update the shortcut
Write-Host "Updating desktop shortcut..."
$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut([System.Environment]::GetFolderPath("Desktop") + "\Quick Quote.lnk")
$Shortcut.IconLocation = "$pwd\$icoPath"
$Shortcut.Save()

Write-Host "Icon updated successfully!"
>>>>>>> e2d6ad99590ef73bbed0ebfb5a23a5bf5349bac5
pause 