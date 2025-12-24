# Скрипт для настройки GitHub MCP в Cursor
# Запуск: .\setup-mcp-github.ps1

Write-Host "🔧 Настройка GitHub MCP для Cursor" -ForegroundColor Cyan
Write-Host ""

$mcpPath = "$env:APPDATA\Cursor\User\globalStorage\rooveterinaryinc.roo-cline\mcp.json"

# Проверяем существование файла
if (Test-Path $mcpPath) {
    Write-Host "✅ Файл конфигурации найден: $mcpPath" -ForegroundColor Green
} else {
    Write-Host "❌ Файл конфигурации не найден. Создаю..." -ForegroundColor Yellow
    
    $dir = Split-Path $mcpPath
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
    
    $config = @{
        mcpServers = @{
            github = @{
                command = "npx"
                args = @("-y", "@modelcontextprotocol/server-github")
                env = @{
                    GITHUB_PERSONAL_ACCESS_TOKEN = "YOUR_GITHUB_TOKEN_HERE"
                }
            }
        }
    }
    
    $config | ConvertTo-Json -Depth 10 | Set-Content -Path $mcpPath -Encoding UTF8
    Write-Host "✅ Файл создан" -ForegroundColor Green
}

Write-Host ""
Write-Host "📝 Следующие шаги:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Создайте GitHub Personal Access Token:" -ForegroundColor Yellow
Write-Host "   → https://github.com/settings/tokens" -ForegroundColor White
Write-Host ""
Write-Host "2. Откройте файл конфигурации:" -ForegroundColor Yellow
Write-Host "   → $mcpPath" -ForegroundColor White
Write-Host ""
Write-Host "3. Замените 'YOUR_GITHUB_TOKEN_HERE' на ваш токен" -ForegroundColor Yellow
Write-Host ""
Write-Host "4. Перезапустите Cursor IDE" -ForegroundColor Yellow
Write-Host ""

$open = Read-Host "Открыть файл конфигурации сейчас? (y/n)"
if ($open -eq "y" -or $open -eq "Y") {
    notepad $mcpPath
}

Write-Host ""
Write-Host "✅ Настройка завершена!" -ForegroundColor Green



