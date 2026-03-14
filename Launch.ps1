param([string]$ScriptDir)

Set-Location $ScriptDir

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$form = New-Object System.Windows.Forms.Form
$form.FormBorderStyle = 'None'
$form.StartPosition = 'CenterScreen'
$form.TopMost = $true
$form.ShowInTaskbar = $false
$form.BackColor = 'White'

$imgPath = Join-Path $ScriptDir "startup.png"
if (Test-Path $imgPath) {
    try {
        $img = [System.Drawing.Image]::FromFile($imgPath)
        $maxWidth = 600
        $maxHeight = 400
        $width = $img.Width
        $height = $img.Height

        if ($width -gt $maxWidth -or $height -gt $maxHeight) {
            $ratioX = $maxWidth / $width
            $ratioY = $maxHeight / $height
            $ratio = if ($ratioX -lt $ratioY) { $ratioX } else { $ratioY }
            $width = [math]::Floor($width * $ratio)
            $height = [math]::Floor($height * $ratio)
        }

        $form.Width = $width
        $form.Height = $height
        $form.BackgroundImage = $img
        $form.BackgroundImageLayout = 'Zoom'
    }
    catch {
        $form.Width = 400
        $form.Height = 300
    }
}
else {
    $form.Width = 400
    $form.Height = 300
    $label = New-Object System.Windows.Forms.Label
    $label.Text = "Starting Unique Pack..."
    $label.AutoSize = $true
    $label.Location = New-Object System.Drawing.Point(130, 130)
    $form.Controls.Add($label)
}

$timer = New-Object System.Windows.Forms.Timer
$timer.Interval = 1000
$timer.Add_Tick({
        $timer.Stop()
        $form.Close()
    })

$form.Add_Shown({
        $form.Refresh()
    
        # Start Node directly without PM2 to avoid background service context issues
        Start-Process -FilePath "node" -ArgumentList "dist/index.cjs" -WindowStyle Hidden

        # Open Browser
        Start-Process "http://localhost:5000"

        $timer.Start()
    })

[System.Windows.Forms.Application]::Run($form)
