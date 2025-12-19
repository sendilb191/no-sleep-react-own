# Android Build Helpers

If Gradle wrapper cannot download the distribution due to network/SSL issues, use the helper scripts to pre-download and unpack the distribution.

Bash:

```bash
# downloads and unpacks gradle-8.9-all into android/gradle/wrapper/dists
./scripts/install-gradle-wrapper.sh 8.9

cd android
./gradlew clean assembleRelease
```

PowerShell (Windows):

```powershell
# downloads and unpacks gradle-8.9-all into android/gradle/wrapper/dists
.\scripts\install-gradle-wrapper.ps1 -Version 8.9

cd android
.\gradlew clean assembleRelease
```

These scripts are intended for developer machines that cannot download Gradle via the wrapper due to corporate proxies or SSL interception.
