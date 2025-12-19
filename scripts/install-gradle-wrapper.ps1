param(
  [string]$Version = '8.9'
)
$Dist = "gradle-$Version-all"
$Url = "https://services.gradle.org/distributions/$Dist.zip"
$Dest = Join-Path -Path (Join-Path (Get-Location) 'android/gradle/wrapper/dists') -ChildPath $Dist
Write-Host "Installing Gradle distribution $Dist into $Dest"
New-Item -ItemType Directory -Force -Path $Dest | Out-Null
$Tmp = [System.IO.Path]::GetTempFileName()

Write-Host "Downloading $Url ..."
Invoke-WebRequest -Uri $Url -OutFile $Tmp -UseBasicParsing

Write-Host "Unzipping..."
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::ExtractToDirectory($Tmp, $Dest)
Remove-Item $Tmp -Force

Write-Host "Gradle $Version installed to $Dest"
Write-Host "You can now run: cd android; .\gradlew clean assembleRelease"