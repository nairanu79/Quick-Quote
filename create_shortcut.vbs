<<<<<<< HEAD
Set WshShell = CreateObject("WScript.Shell")
strDesktop = WshShell.SpecialFolders("Desktop")

' Create the shortcut
Set oShellLink = WshShell.CreateShortcut(strDesktop & "\Quick Quote.lnk")
oShellLink.TargetPath = WshShell.CurrentDirectory & "\start.bat"
oShellLink.WorkingDirectory = WshShell.CurrentDirectory
oShellLink.IconLocation = WshShell.CurrentDirectory & "\public\favicon.ico"
oShellLink.Description = "Quick Quote Application"
=======
Set WshShell = CreateObject("WScript.Shell")
strDesktop = WshShell.SpecialFolders("Desktop")

' Create the shortcut
Set oShellLink = WshShell.CreateShortcut(strDesktop & "\Quick Quote.lnk")
oShellLink.TargetPath = WshShell.CurrentDirectory & "\start.bat"
oShellLink.WorkingDirectory = WshShell.CurrentDirectory
oShellLink.IconLocation = WshShell.CurrentDirectory & "\public\favicon.ico"
oShellLink.Description = "Quick Quote Application"
>>>>>>> e2d6ad99590ef73bbed0ebfb5a23a5bf5349bac5
oShellLink.Save 