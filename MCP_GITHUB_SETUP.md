# Настройка MCP Server для GitHub в Cursor

## Что такое MCP?

Model Context Protocol (MCP) - это протокол для интеграции AI-ассистентов с внешними сервисами, такими как GitHub, для получения контекста и выполнения действий.

## Настройка в Cursor IDE

MCP servers настраиваются в конфигурационном файле Cursor. Файл конфигурации обычно находится в:

**Windows:**
```
%APPDATA%\Cursor\User\globalStorage\rooveterinaryinc.roo-cline\mcp.json
```

**macOS:**
```
~/Library/Application Support/Cursor/User/globalStorage/rooveterinaryinc.roo-cline/mcp.json
```

**Linux:**
```
~/.config/Cursor/User/globalStorage/rooveterinaryinc.roo-cline/mcp.json
```

## Настройка GitHub MCP Server

### Вариант 1: Использование официального GitHub MCP Server

1. **Создайте Personal Access Token в GitHub:**
   - Перейдите на https://github.com/settings/tokens
   - Нажмите "Generate new token (classic)"
   - Укажите необходимые разрешения:
     - `repo` (для доступа к репозиториям)
     - `read:org` (для доступа к организациям)
     - `read:user` (для чтения информации о пользователе)
   - Скопируйте токен

2. **Добавьте конфигурацию в Cursor:**

   Откройте файл конфигурации MCP и добавьте:

   ```json
   {
     "mcpServers": {
       "github": {
         "command": "npx",
         "args": [
           "-y",
           "@modelcontextprotocol/server-github"
         ],
         "env": {
           "GITHUB_PERSONAL_ACCESS_TOKEN": "ваш_токен_здесь"
         }
       }
     }
   }
   ```

3. **Перезапустите Cursor**

### Вариант 2: Установка через npm (локально)

1. **Установите пакет глобально:**
   ```bash
   npm install -g @modelcontextprotocol/server-github
   ```

2. **Создайте токен GitHub** (см. Вариант 1, шаг 1)

3. **Настройте конфигурацию:**
   ```json
   {
     "mcpServers": {
       "github": {
         "command": "mcp-server-github",
         "env": {
           "GITHUB_PERSONAL_ACCESS_TOKEN": "ваш_токен_здесь"
         }
       }
     }
   }
   ```

### Вариант 3: Использование GitHub App (для Enterprise)

Для более продвинутой настройки с GitHub Enterprise:

1. Создайте GitHub App
2. Установите его в вашу организацию
3. Используйте конфигурацию:
   ```json
   {
     "mcpServers": {
       "github": {
         "command": "npx",
         "args": [
           "-y",
           "@modelcontextprotocol/server-github"
         ],
         "env": {
           "GITHUB_APP_ID": "ваш_app_id",
           "GITHUB_APP_PRIVATE_KEY": "ваш_private_key",
           "GITHUB_APP_INSTALLATION_ID": "ваш_installation_id"
         }
       }
     }
   }
   ```

## Проверка работы

После настройки MCP server должен быть доступен через инструменты:
- `list_mcp_resources` - список доступных ресурсов
- `fetch_mcp_resource` - получение конкретного ресурса

## Безопасность

⚠️ **Важно:**
- Никогда не коммитьте токены в репозиторий
- Используйте переменные окружения
- Регулярно обновляйте токены
- Используйте минимально необходимые разрешения

## Дополнительные ресурсы

- [MCP Documentation](https://modelcontextprotocol.io/)
- [GitHub MCP Server](https://github.com/modelcontextprotocol/servers/tree/main/src/github)
- [GitHub Personal Access Tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)

## Troubleshooting

### MCP server не подключается
- Проверьте, что токен правильный
- Убедитесь, что токен имеет необходимые разрешения
- Проверьте логи Cursor на наличие ошибок

### Нет доступа к ресурсам
- Убедитесь, что токен имеет доступ к нужным репозиториям
- Проверьте, что репозитории не приватные (если токен не имеет доступа)

### Проблемы с путями
- Убедитесь, что `npx` доступен в PATH
- Проверьте, что Node.js установлен

