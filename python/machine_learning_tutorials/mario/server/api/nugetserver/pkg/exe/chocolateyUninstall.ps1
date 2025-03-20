$ErrorActionPreference = 'Stop'; 

$packageName = '@packageName'
$softwareName = '@packageTitle*'
$installerType = 'exe' 
$validExitCodes = @(0, 1614)
   
[array]$key = Get-UninstallRegistryKey -SoftwareName $softwareName

if ($key.Count -eq 1) 
{

    $file = $key.UninstallString;

	if(($key.UninstallString.ToLower().Contains(".msi")) -or ($key.UninstallString.ToLower().Contains("msiexec.exe")))
	{
        
		$installerType ='msi'
	}                

    if ($installerType -eq 'msi') {
      $silentArgs = $key.PSChildName + " /quiet /norestart"
      $file = ''
    }
	else
	{
		$silentArgs = '/s /S /q /Q /quiet /silent /SILENT /VERYSILENT'
	}
       

    Uninstall-ChocolateyPackage -PackageName $packageName `
                              -FileType $installerType `
                            -SilentArgs "$silentArgs" `
                          -ValidExitCodes $validExitCodes `
                        -File "$file"
  
  
} 
elseif ($key.Count -eq 0) 
{
   Write-Warning "$packageName has already been uninstalled by other means or could not be found."
} 
elseif ($key.Count -gt 1) 
{
   Write-Warning  ($key.Count.ToString() + " matches found.")
   Write-Warning "To prevent accidental data loss, no programs will be uninstalled."
   Write-Warning "Please alert package maintainer the following keys were matched:"
   
   $key | % {
    Write-Warning -    
    Write-Warning $_.DisplayName 
    Write-Warning $_.UninstallString 
    Write-Warning $_.DisplayVersion 
    } 
}



