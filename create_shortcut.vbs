Set WshShell = CreateObject("WScript.Shell")
strDesktop = WshShell.SpecialFolders("Desktop")

' Create the shortcut
Set oShellLink = WshShell.CreateShortcut(strDesktop & "\Quick Quote.lnk")
oShellLink.TargetPath = WshShell.CurrentDirectory & "\start.bat"
oShellLink.WorkingDirectory = WshShell.CurrentDirectory
oShellLink.IconLocation = WshShell.CurrentDirectory & "\public\favicon.ico"
oShellLink.Description = "Quick Quote Application"
oShellLink.Save 