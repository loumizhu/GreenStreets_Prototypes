#NoEnv
SetWorkingDir %A_ScriptDir%

SourceDir = D:\((_atWork_))\DuneTech\GreenStreets-UI-UX\Prototypes
DestDir = H:\My Drive\GreenStreets-UI-UX\Prototypes
LogFile = %A_Temp%\sync_log.txt

; Custom Sync Logic using AHK's built-in file operations to ensure foolproof copying and verification.
LogText := "Sync Report`r`n=============================`r`n"
SuccessCount := 0
FailCount := 0

PrefixLen := StrLen(SourceDir) + 2

; Loop over all files in the source directory recursively (0 = files only, 1 = recurse)
Loop, %SourceDir%\*.*, 0, 1
{
    RelativePath := SubStr(A_LoopFileFullPath, PrefixLen)
    RelativeDir := SubStr(A_LoopFileDir, PrefixLen)
    
    ; Apply Exclusions
    if (InStr(RelativePath, ".claude") || InStr(RelativePath, "old") || A_LoopFileName = "CLAUDE.md" || A_LoopFileName = "SKILL.md" || A_LoopFileName = "desktop.ini" || A_LoopFileName = A_ScriptName)
    {
        continue
    }

    DestFile := DestDir "\" RelativePath
    DestFolder := RelativeDir = "" ? DestDir : DestDir "\" RelativeDir
    
    ; Create destination directory if it doesn't exist
    if !FileExist(DestFolder)
        FileCreateDir, %DestFolder%
        
    ; Copy file and overwrite if exists
    FileCopy, %A_LoopFileFullPath%, %DestFile%, 1
    
    ; Verify the copy was successful
    if (ErrorLevel) {
        LogText .= "[FAILED] Copy Error: " RelativePath "`r`n"
        FailCount++
    } else {
        if FileExist(DestFile) {
            FileGetSize, srcSize, %A_LoopFileFullPath%
            FileGetSize, dstSize, %DestFile%
            if (srcSize = dstSize) {
                LogText .= "[OK] Copied & Verified: " RelativePath "`r`n"
                SuccessCount++
            } else {
                LogText .= "[FAILED] Size Mismatch: " RelativePath "`r`n"
                FailCount++
            }
        } else {
            LogText .= "[FAILED] File Not Found at Dest: " RelativePath "`r`n"
            FailCount++
        }
    }
}

LogText .= "`r`n=============================`r`nSync Complete.`r`nSuccessfully Copied: " SuccessCount "`r`nFailed: " FailCount "`r`n"

; Write log to file
FileDelete, %LogFile%
FileAppend, %LogText%, %LogFile%

; Create a GUI to show the results
Gui, +Resize +MinSize500x400
Gui, Font, s10, Segoe UI
Gui, Add, Text, x10 y15 w60, Source:
Gui, Add, Edit, x70 y10 w690 ReadOnly vSourceEdit, %SourceDir%
Gui, Add, Text, x10 y45 w60, Dest:
Gui, Add, Edit, x70 y40 w690 ReadOnly vDestEdit, %DestDir%

Gui, Font, s9, Consolas
Gui, Add, Edit, x10 y80 w750 h380 ReadOnly vLogEdit, %LogText%
Gui, Font, s10, Segoe UI
Gui, Add, Button, w150 vBtnOpenTarget gOpenTarget, Open Target Folder
Gui, Add, Button, w100 vBtnClose gGuiClose Default, Close
Gui, Show,, Sync Results
return

GuiSize:
    if (A_EventInfo = 1) ; The window has been minimized
        return
    
    ; Resize width for Source and Dest edits
    NewEditWidth := A_GuiWidth - 80
    GuiControl, Move, SourceEdit, w%NewEditWidth%
    GuiControl, Move, DestEdit, w%NewEditWidth%

    ; Resize LogEdit
    NewWidth := A_GuiWidth - 20
    NewHeight := A_GuiHeight - 130
    if (NewHeight < 50)
        NewHeight := 50
    GuiControl, Move, LogEdit, w%NewWidth% h%NewHeight%
    
    ; Center the two buttons
    TotalButtonWidth := 150 + 10 + 100 ; Button1 + Spacing + Button2
    StartX := (A_GuiWidth - TotalButtonWidth) / 2
    GuiControl, Move, BtnOpenTarget, % "y" (A_GuiHeight - 35) " x" StartX
    GuiControl, Move, BtnClose, % "y" (A_GuiHeight - 35) " x" (StartX + 160)
return

OpenTarget:
    Run, explorer.exe "%DestDir%"
return

GuiClose:
GuiEscape:
    ExitApp
