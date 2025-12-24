# Настройка Email-уведомлений

## Варианты реализации

### Вариант 1: Resend (Рекомендуется)

1. **Регистрация**
   - Перейдите на [resend.com](https://resend.com)
   - Создайте аккаунт
   - Получите API ключ

2. **Настройка домена**
   - Добавьте домен в Resend
   - Настройте DNS записи (SPF, DKIM, DMARC)
   - Подтвердите домен

3. **Переменные окружения**
   ```env
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   EMAIL_FROM=VEOX <noreply@veox.ee>
   ```

4. **Установка**
   ```bash
   npm install resend
   ```

### Вариант 2: EmailJS

1. **Регистрация**
   - Перейдите на [emailjs.com](https://www.emailjs.com)
   - Создайте аккаунт
   - Настройте email сервис (Gmail, Outlook и т.д.)

2. **Переменные окружения**
   ```env
   EMAILJS_SERVICE_ID=your_service_id
   EMAILJS_TEMPLATE_ID=your_template_id
   EMAILJS_PUBLIC_KEY=your_public_key
   ```

3. **Установка**
   ```bash
   npm install @emailjs/browser
   ```

### Вариант 3: Supabase Edge Functions

Используйте встроенные функции Supabase для отправки email через внешний сервис.

---

## Интеграция в код

### Точки отправки уведомлений:

1. **Регистрация заказчика**
   ```typescript
   // app/[locale]/signup/page.tsx
   await fetch('/api/email/send', {
     method: 'POST',
     body: JSON.stringify({
       type: 'customer_registration',
       userId: user.id,
       locale: 'ru'
     })
   });
   ```

2. **Регистрация исполнителя**
   ```typescript
   // app/[locale]/become-performer/page.tsx
   await fetch('/api/email/send', {
     method: 'POST',
     body: JSON.stringify({
       type: 'performer_registration',
       userId: user.id,
       locale: 'ru'
     })
   });
   ```

3. **Новый отклик**
   ```typescript
   // При создании предложения
   await fetch('/api/email/send', {
     method: 'POST',
     body: JSON.stringify({
       type: 'new_offer',
       userId: order.customer_id,
       data: {
         orderTitle: order.title,
         offerPrice: offer.price
       },
       locale: 'ru'
     })
   });
   ```

4. **Покупка контактов**
   ```typescript
   // app/api/stripe/webhook/route.ts
   // Уже интегрировано
   ```

---

## Настройка Edge Function для напоминаний

### 1. Деплой функции

```bash
# Установите Supabase CLI
npm install -g supabase

# Логин
supabase login

# Линк проекта
supabase link --project-ref your-project-ref

# Деплой функции
supabase functions deploy review-reminder
```

### 2. Настройка переменных

В Supabase Dashboard → Edge Functions → review-reminder:
- `RESEND_API_KEY` - ваш API ключ Resend
- `NEXT_PUBLIC_APP_URL` - URL вашего приложения

### 3. Настройка Cron

**Вариант A: pg_cron (Supabase)**

```sql
-- Создайте функцию для вызова Edge Function
CREATE OR REPLACE FUNCTION send_review_reminders()
RETURNS void AS $$
BEGIN
  -- Вызов Edge Function через HTTP
  PERFORM net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/review-reminder',
    headers := '{"Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  );
END;
$$ LANGUAGE plpgsql;

-- Настройка cron (ежедневно в 9:00)
SELECT cron.schedule(
  'send-review-reminders',
  '0 9 * * *',
  $$SELECT send_review_reminders()$$
);
```

**Вариант B: Внешний сервис (Cron-job.org, EasyCron)**

1. Создайте задачу
2. URL: `https://your-project.supabase.co/functions/v1/review-reminder`
3. Метод: POST
4. Headers: `Authorization: Bearer YOUR_ANON_KEY`
5. Расписание: Ежедневно в 9:00

---

## Тестирование

### Локальное тестирование

```bash
# Запустите dev сервер
npm run dev

# Отправьте тестовый email
curl -X POST http://localhost:3000/api/email/send \
  -H "Content-Type: application/json" \
  -d '{
    "type": "customer_registration",
    "userId": "user-id",
    "locale": "ru"
  }'
```

### Проверка шаблонов

Все шаблоны находятся в `lib/email.ts`. Вы можете:
1. Изменить дизайн
2. Добавить новые шаблоны
3. Настроить локализацию

---

## Мониторинг

### Resend Dashboard
- Отслеживание отправленных писем
- Статистика открытий и кликов
- Логи ошибок

### Supabase Logs
- Edge Function логи
- Ошибки выполнения
- Время выполнения

---

## Troubleshooting

### Письма не отправляются

1. Проверьте API ключ
2. Проверьте домен (для Resend)
3. Проверьте логи в Resend Dashboard
4. Убедитесь, что `EMAIL_FROM` настроен правильно

### Edge Function не работает

1. Проверьте переменные окружения
2. Проверьте логи в Supabase Dashboard
3. Убедитесь, что функция задеплоена
4. Проверьте права доступа

### Cron не запускается

1. Проверьте настройки pg_cron
2. Проверьте права доступа к функции
3. Проверьте логи Supabase

---

## Рекомендации

1. **Используйте Resend** - лучший вариант для production
2. **Настройте домен** - повышает доставляемость
3. **Мониторьте статистику** - отслеживайте открытия
4. **Тестируйте шаблоны** - проверяйте на разных клиентах
5. **Настройте SPF/DKIM** - защита от спама

---

## Стоимость

- **Resend**: 3000 писем/месяц бесплатно, затем $20/месяц
- **EmailJS**: 200 писем/месяц бесплатно, затем от $15/месяц
- **Supabase Edge Functions**: Включено в тариф Supabase

