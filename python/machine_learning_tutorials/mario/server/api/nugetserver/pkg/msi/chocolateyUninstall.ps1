
$ErrorActionPreference = 'Stop';

$packageName= '@packageName'
$toolsDir   = $(Split-Path -parent $MyInvocation.MyCommand.Definition)
$fileName = '@fileName'
$fileLocation = Join-Path $toolsDir $fileName

$packageArgs = @{
  
  packageName  = $packageName  
  fileType = 'MSI'  
  silentArgs    =  $fileLocation + ' /quiet /norestart'
  validExitCodes = @(0, 3010, 1605, 1614, 1641)
  
}

Uninstall-ChocolateyPackage @packageArgs