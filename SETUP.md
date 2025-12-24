# Инструкция по настройке VEOX

## Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка Supabase

**📖 Подробная инструкция:** См. `SUPABASE_SETUP.md`

**Кратко:**
1. Создайте проект на [supabase.com](https://supabase.com)
2. Перейдите в SQL Editor
3. Выполните SQL скрипт из `supabase/schema.sql`
4. В Settings > API скопируйте:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Настройка Google OAuth

1. В Supabase Dashboard: Authentication > Providers > Google
2. Включите Google provider
3. Добавьте Client ID и Client Secret из Google Cloud Console
4. В Google Cloud Console добавьте redirect URI:
   - `https://your-project.supabase.co/auth/v1/callback`

### 4. Настройка Stripe

1. Создайте аккаунт на [stripe.com](https://stripe.com)
2. В Dashboard > Developers > API keys скопируйте:
   - Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Secret key → `STRIPE_SECRET_KEY`
3. Настройте Webhook:
   - Endpoint URL: `https://your-domain.com/api/stripe/webhook`
   - События: `payment_intent.succeeded`
   - Скопируйте Signing secret → `STRIPE_WEBHOOK_SECRET`

### 5. Создание .env.local

Создайте файл `.env.local` в корне проекта:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 6. Запуск

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000)

## Структура базы данных

### Основные таблицы:

- `profiles` - Профили пользователей
- `orders` - Заказы от клиентов
- `offers` - Предложения от исполнителей
- `contact_purchases` - Покупки доступа к контактам
- `reviews` - Отзывы и рейтинги
- `performer_profiles` - Профили исполнителей
- `notifications` - Уведомления

## Тестирование платежей

Для тестирования Stripe используйте тестовые карты:
- Успешный платеж: `4242 4242 4242 4242`
- Отклоненный платеж: `4000 0000 0000 0002`

## Деплой

### Vercel

1. Подключите GitHub репозиторий
2. Добавьте переменные окружения
3. Настройте Stripe webhook на production URL
4. Деплой автоматический

### Настройка домена

После деплоя обновите:
- Supabase redirect URLs
- Stripe webhook endpoint
- Google OAuth redirect URI

## Дополнительные настройки

### Email уведомления

Для отправки email можно использовать:
- Resend (рекомендуется)
- EmailJS
- Supabase Edge Functions

Пример интеграции с Resend в `lib/email.ts` (создайте при необходимости).

### Хранение изображений

Используйте Supabase Storage:
1. Создайте bucket `order-images`
2. Настройте RLS политики
3. Используйте `supabase.storage.from('order-images').upload()`

## Поддержка

При возникновении проблем проверьте:
1. Все переменные окружения установлены
2. SQL схема выполнена полностью
3. Stripe webhook настроен правильно
4. Google OAuth настроен корректно

