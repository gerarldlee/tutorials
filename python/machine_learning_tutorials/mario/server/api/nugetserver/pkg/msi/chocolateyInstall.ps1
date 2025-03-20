
$ErrorActionPreference = 'Stop';

$packageName= '@packageName'
$toolsDir   = $(Split-Path -parent $MyInvocation.MyCommand.Definition)
$fileName = '@fileName'
$fileLocation = Join-Path $toolsDir $fileName

$packageArgs = @{
  
  packageName  = $packageName  
  fileType = 'MSI'
  file = $fileLocation
  
  silentArgs    = '@silentArgs /qn /norestart'
  validExitCodes = @(0, 3010, 1641)
      
}

Install-ChocolateyInstallPackage @packageArgs