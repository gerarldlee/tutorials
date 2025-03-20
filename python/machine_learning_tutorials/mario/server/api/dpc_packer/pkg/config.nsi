# define installer name
!include ..\..\..\nsis\Include\MUI2.nsh
!include ..\..\..\nsis\Include\LogicLib.nsh
!include ..\..\..\nsis\Include\x64.nsh
!include ..\..\..\nsis\Include\DotNetChecker.nsh
!addplugindir "..\..\..\nsis\Plugins"

!define MUI_ABORTWARNING
!define MUI_ICON "..\..\icon.ico"

;
!insertmacro MUI_PAGE_LICENSE "..\..\License.txt"
 
!insertmacro MUI_PAGE_COMPONENTS


!insertmacro MUI_PAGE_INSTFILES

!insertmacro MUI_LANGUAGE "English"

;



VIProductVersion                 "@Version"
VIAddVersionKey ProductName      "Deployment client"
VIAddVersionKey Comments         ""
VIAddVersionKey CompanyName      "JAHA IT"
VIAddVersionKey LegalCopyright   ""
VIAddVersionKey FileDescription  ""
VIAddVersionKey FileVersion      1
VIAddVersionKey ProductVersion   1
VIAddVersionKey InternalName     "JAHA IT"
VIAddVersionKey LegalTrademarks  "JAHA IT"
VIAddVersionKey OriginalFilename "Deployment_Client.exe"
Name "Deployment client setup"


OutFile "Deployment_Client.exe"

Function .onInit
${If} $InstDir == "" ; Don't override setup.exe /D=c:\custom\dir
    ${If} ${RunningX64}
        StrCpy $InstDir "$ProgramFiles64\JAHA IT\Deployment Client"
    ${Else}
        StrCpy $InstDir "$ProgramFiles32\JAHA IT\Deployment Client"
    ${EndIf}
${EndIf}
FunctionEnd


#Page license
LicenseData ..\..\license.txt
LicenseForceSelection radiobuttons "Agree" "Disagree"
#Page components
#Page instfiles
 

Section "Copy files"
 
# define output path
SetOutPath $INSTDIR
 
!insertmacro CheckNetFramework 452 

 
# specify file to go in output path
File "..\..\icon.ico"
File "..\..\DeploymentClient.exe"
File "..\..\DeploymentClientHelper.exe"
File "..\..\Newtonsoft.Json.dll"
File "pairingKey"
File "domainKey"
File "domainName"
 
# define uninstaller name
WriteUninstaller $INSTDIR\uninstaller.exe

SectionEnd


Section "Write registry"

WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\DeploymentClient" \
                 "DisplayName" "Deployment Client"
WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\DeploymentClient" \
				 "Publisher" "JAHA IT"				 
WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\DeploymentClient" \				 
			     "DisplayVersion" "@Version"				 
WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\DeploymentClient" \				 
			     "DisplayIcon" "$\"$INSTDIR\icon.ico$\""				 

				 
				 
WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\DeploymentClient" \
                 "UninstallString" "$\"$INSTDIR\uninstaller.exe$\""

WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\DeploymentClient" \
                 "QuietUninstallString" "$\"$INSTDIR\uninstaller.exe$\" /S"
 
SectionEnd 


Section "Install service"
#SimpleSC::InstallService "DeploymentClient" "DeploymentClient" "16" "2" "$INSTDIR\DeploymentClient.exe" "" "" ""
SimpleSC::StopService "DeploymentClient" 1 30
nsExec::Exec '"C:\Windows\Microsoft.NET\Framework\v4.0.30319\InstallUtil.exe" -u "$InstDir\DeploymentClient.exe"'
nsExec::Exec '"C:\Windows\Microsoft.NET\Framework\v4.0.30319\InstallUtil.exe" "$InstDir\DeploymentClient.exe"'
SectionEnd

Section "Start service" 
SimpleSC::StartService "DeploymentClient" "" 15
SectionEnd





# create a section to define what the uninstaller does.
# the section will always be named "Uninstall"
Section "Uninstall"

# delete uninstaller first
Delete $INSTDIR\uninstaller.exe

SimpleSC::StopService "DeploymentClient" 1 30

# remove service
nsExec::Exec '"C:\Windows\Microsoft.NET\Framework\v4.0.30319\InstallUtil.exe" -u "$InstDir\DeploymentClient.exe"'

# kill helper process
nsExec::Exec 'taskkill /IM DeploymentClientHelper.exe' 

# remove schedule
nsExec::Exec '"$InstDir\DeploymentClientHelper.exe" uninstall' 
 
# delete installed file
RMDir /R /REBOOTOK "$INSTDIR\" 

DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\DeploymentClient"

SectionEnd


