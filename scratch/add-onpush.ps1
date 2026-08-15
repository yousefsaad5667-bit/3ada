$paths = @(
    "D:\habit tracker\src\app\features\analytics",
    "D:\habit tracker\src\app\shared\components\charts",
    "D:\habit tracker\src\app\features\dashboard"
)

$files = Get-ChildItem -Path $paths -Filter "*.component.ts" -Recurse

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

foreach ($file in $files) {
    $content = [IO.File]::ReadAllText($file.FullName, $utf8NoBom)

    $modified = $false
    if ($content -notmatch 'ChangeDetectionStrategy\.OnPush') {
        # Import ChangeDetectionStrategy
        if ($content -notmatch 'ChangeDetectionStrategy') {
            $content = [regex]::Replace($content, "(?m)^import\s+\{([^}]+)\}\s+from\s+'@angular/core';", 'import {$1, ChangeDetectionStrategy } from ''@angular/core'';')
            $modified = $true
        }

        # Add to @Component
        if ($content -match '@Component\s*\(\{') {
            $content = [regex]::Replace($content, "@Component\s*\(\{\s*", "$&changeDetection: ChangeDetectionStrategy.OnPush,`n  ")
            $modified = $true
        }

        if ($modified) {
            [IO.File]::WriteAllText($file.FullName, $content, $utf8NoBom)
            Write-Host "Updated $($file.Name)"
        }
    }
}
