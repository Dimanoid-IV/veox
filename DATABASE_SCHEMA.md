# Структура базы данных VEOX

## Обзор

База данных построена на PostgreSQL (Supabase) с использованием Row Level Security (RLS) для защиты данных.

## Таблицы

### 1. `profiles` - Профили пользователей

Расширяет `auth.users` из Supabase Auth.

**Поля:**
- `id` (UUID, PK) - Ссылка на `auth.users.id`
- `email` (TEXT) - Email пользователя
- `full_name` (TEXT) - Полное имя
- `phone` (TEXT) - Телефон
- `avatar_url` (TEXT) - URL аватара
- `role` (TEXT) - Роль: `'customer'` или `'performer'`
- `is_verified` (BOOLEAN) - Верификация профиля
- `created_at` (TIMESTAMP) - Дата создания
- `updated_at` (TIMESTAMP) - Дата обновления

**Индексы:**
- `id` (PK)

**RLS:**
- Пользователи могут просматривать все профили
- Пользователи могут обновлять только свой профиль

---

### 2. `categories` - Категории услуг

**Поля:**
- `id` (UUID, PK)
- `slug` (TEXT, UNIQUE) - URL-дружественный идентификатор
- `name_et` (TEXT) - Название на эстонском
- `name_ru` (TEXT) - Название на русском
- `icon` (TEXT) - Иконка категории
- `parent_id` (UUID, FK) - Родительская категория
- `created_at` (TIMESTAMP)

**Индексы:**
- `slug` (UNIQUE)
- `parent_id`

**RLS:**
- Все могут просматривать категории

---

### 3. `orders` - Заказы от клиентов

**Поля:**
- `id` (UUID, PK)
- `customer_id` (UUID, FK → `profiles.id`) - Заказчик
- `category_id` (UUID, FK → `categories.id`) - Категория
- `title` (TEXT) - Краткое описание
- `description` (TEXT) - Детальное описание
- `location` (TEXT) - Местоположение
- `location_lat` (DECIMAL) - Широта
- `location_lng` (DECIMAL) - Долгота
- `budget` (DECIMAL) - Бюджет заказа
- `status` (TEXT) - Статус: `'open'`, `'in_progress'`, `'completed'`, `'cancelled'`
- `images` (TEXT[]) - Массив URL изображений
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Индексы:**
- `customer_id`
- `status`
- `category_id`
- `created_at`

**RLS:**
- Все могут просматривать открытые заказы
- Только заказчик может видеть свои закрытые заказы
- Только заказчик может создавать/обновлять свои заказы

---

### 4. `offers` - Предложения от исполнителей

**Поля:**
- `id` (UUID, PK)
- `order_id` (UUID, FK → `orders.id`)
- `performer_id` (UUID, FK → `profiles.id`)
- `price` (DECIMAL) - Предложенная цена
- `message` (TEXT) - Сообщение исполнителя
- `status` (TEXT) - Статус: `'pending'`, `'accepted'`, `'rejected'`, `'completed'`
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Индексы:**
- `order_id`
- `performer_id`
- `(order_id, performer_id)` (UNIQUE)

**RLS:**
- Заказчик видит предложения на свои заказы
- Исполнитель видит свои предложения
- Только исполнитель может создавать/обновлять свои предложения

---

### 5. `contact_purchases` - Покупки доступа к контактам

**Поля:**
- `id` (UUID, PK)
- `order_id` (UUID, FK → `orders.id`)
- `performer_id` (UUID, FK → `profiles.id`)
- `stripe_checkout_session_id` (TEXT, UNIQUE) - ID сессии Stripe Checkout
- `stripe_payment_intent_id` (TEXT) - ID платежа Stripe
- `amount` (DECIMAL) - Сумма оплаты
- `status` (TEXT) - Статус: `'pending'`, `'completed'`, `'failed'`
- `created_at` (TIMESTAMP)

**Индексы:**
- `order_id`
- `performer_id`
- `stripe_checkout_session_id` (UNIQUE)
- `(order_id, performer_id)` (UNIQUE)

**RLS:**
- Исполнитель видит свои покупки
- Заказчик видит покупки доступа к своим заказам
- Только исполнитель может создавать покупки

**Безопасность:**
- Контакты доступны только после успешной оплаты (`status = 'completed'`)
- Каждый исполнитель должен оплачивать отдельно
- Нельзя получить контакты через API без проверки покупки

---

### 6. `reviews` - Отзывы и рейтинги

**Поля:**
- `id` (UUID, PK)
- `order_id` (UUID, FK → `orders.id`)
- `reviewer_id` (UUID, FK → `profiles.id`) - Кто оставил отзыв (заказчик)
- `reviewee_id` (UUID, FK → `profiles.id`) - О ком отзыв (исполнитель)
- `rating` (INTEGER) - Рейтинг от 1 до 5
- `comment` (TEXT) - Текст отзыва
- `created_at` (TIMESTAMP)

**Индексы:**
- `order_id`
- `reviewer_id`
- `reviewee_id`
- `(order_id, reviewer_id)` (UNIQUE)

**RLS:**
- Все могут просматривать отзывы
- Только заказчик может оставлять отзывы на свои заказы

**Триггеры:**
- Автоматическое обновление рейтинга исполнителя при создании/обновлении отзыва

---

### 7. `performer_profiles` - Профили исполнителей

**Поля:**
- `id` (UUID, PK)
- `performer_id` (UUID, FK → `profiles.id`, UNIQUE)
- `company_name` (TEXT) - Название компании
- `description` (TEXT) - Описание услуг
- `work_examples` (TEXT[]) - Массив URL примеров работ
- `price_per_hour` (DECIMAL) - Цена за час
- `is_pro` (BOOLEAN) - PRO статус
- `rating` (DECIMAL) - Средний рейтинг (автоматически)
- `total_reviews` (INTEGER) - Количество отзывов (автоматически)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Индексы:**
- `performer_id` (UNIQUE)

**RLS:**
- Все могут просматривать профили исполнителей
- Только исполнитель может обновлять свой профиль

---

### 8. `notifications` - Уведомления

**Поля:**
- `id` (UUID, PK)
- `user_id` (UUID, FK → `profiles.id`)
- `type` (TEXT) - Тип уведомления
- `title` (TEXT) - Заголовок
- `message` (TEXT) - Сообщение
- `link` (TEXT) - Ссылка
- `is_read` (BOOLEAN) - Прочитано
- `created_at` (TIMESTAMP)

**Индексы:**
- `user_id`
- `is_read`
- `created_at`

**RLS:**
- Пользователи видят только свои уведомления
- Пользователи могут обновлять только свои уведомления

---

## Связи между таблицами

```
profiles (1) ──< (N) orders
profiles (1) ──< (N) offers
profiles (1) ──< (N) contact_purchases
profiles (1) ──< (N) reviews (as reviewer)
profiles (1) ──< (N) reviews (as reviewee)
profiles (1) ──< (1) performer_profiles
profiles (1) ──< (N) notifications

categories (1) ──< (N) orders
orders (1) ──< (N) offers
orders (1) ──< (N) contact_purchases
orders (1) ──< (1) reviews
```

---

## Функции и триггеры

### 1. `handle_new_user()`
Автоматически создает профиль при регистрации пользователя.

### 2. `update_updated_at_column()`
Автоматически обновляет `updated_at` при изменении записи.

### 3. `update_performer_rating()`
Автоматически пересчитывает рейтинг исполнителя при создании/обновлении отзыва.

---

## Правила безопасности (RLS)

### Принципы:
1. **Контакты защищены**: Доступ только после оплаты через `contact_purchases`
2. **Изоляция данных**: Пользователи видят только свои данные и публичные
3. **Валидация ролей**: Проверка роли пользователя для доступа к функциям
4. **Уникальность**: Предотвращение дублирования (один отзыв на заказ, одна покупка на заказ)

### Примеры политик:

**Просмотр контактов:**
```sql
-- Контакты видны только:
-- 1. Самому заказчику
-- 2. Исполнителю, который оплатил доступ (status = 'completed')
```

**Создание отзывов:**
```sql
-- Отзыв может оставить только:
-- 1. Заказчик заказа
-- 2. На заказ со статусом 'completed'
-- 3. Один раз на заказ
```

---

## Миграции

Все изменения схемы должны выполняться через SQL миграции в Supabase:
1. Создайте файл миграции
2. Выполните в SQL Editor
3. Проверьте RLS политики
4. Обновите типы TypeScript (если используется)

---

## Оптимизация

### Индексы для производительности:
- Все внешние ключи проиндексированы
- Часто используемые поля (`status`, `created_at`)
- Составные индексы для частых запросов

### Рекомендации:
- Используйте пагинацию для больших списков
- Кэшируйте рейтинги исполнителей
- Регулярно очищайте старые уведомления

---

## Бэкапы

Supabase автоматически создает бэкапы. Рекомендуется:
- Ежедневные бэкапы (автоматически)
- Экспорт схемы перед крупными изменениями
- Тестирование миграций на staging окружении




