
$ErrorActionPreference = 'Stop';

$packageName= '@packageName'
$toolsDir   = $(Split-Path -parent $MyInvocation.MyCommand.Definition)
$fileName = '@fileName'
$fileLocation = Join-Path $toolsDir $fileName

$packageArgs = @{
  
  packageName  = $packageName  
  fileType = 'exe'
  file = $fileLocation
  
  silentArgs    = '@silentArgs'
  validExitCodes = @(0)
      
}

Install-ChocolateyInstallPackage @packageArgs  