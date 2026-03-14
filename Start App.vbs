Set objShell = CreateObject("WScript.Shell")
strScriptPath = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
strCommand = "powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -File """ & strScriptPath & "\Launch.ps1"" -ScriptDir """ & strScriptPath & """"
objShell.Run strCommand, 0, False
