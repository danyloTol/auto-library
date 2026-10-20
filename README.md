# 🚗 AutoLibrary — Каталог та маркетплейс автомобілів

Повнофункціональний веб-додаток «Бібліотека/Каталог автомобілів» із функціоналом маркетплейсу, модерацією контенту через адмін-панель, системою відгуків і лайків, гнучкими фільтрами та вбудованим чатом між покупцем і продавцем у реальному часі.

---

## 🛠 Технологічний стек

### Backend:
- **Платформа:** .NET 9 (C#)
- **Архітектура:** Clean Architecture:
  - `Domain`: Сутності (`User`, `Car`, `CarImage`, `Review`, `Favorite`, `ChatMessage`, `ChatRoom`), переліки (`CarStatus`, `FuelType`, `Transmission`, `UserRole`), базові класи.
  - `Application`: MediatR (CQRS), FluentValidation, DTOs, інтерфейси (`IApplicationDbContext`, `IFileStorageService`, `ICurrentUserService`).
  - `Infrastructure`: EF Core + Npgsql (PostgreSQL), BCrypt.Net для паролів, JWT генерація токенів, `LocalFileStorageService` (збереження у `wwwroot/uploads`).
  - `WebApi`: REST API контролери, SignalR Hub (`ChatHub`), обробка помилок, Swagger з підтримкою Bearer JWT, роздача статики.
- **База даних:** PostgreSQL (NeonDB).
- **Збереження фото:** Локально в папці `wwwroot/uploads` на бекенді.
- **Real-Time:** SignalR для чату в реальному часі.

### Frontend:
- **Фреймворк:** React 18+ (TypeScript + Vite).
- **Стилізація:** Tailwind CSS із підтримкою світлої (м'яко-зелена шавлієва тема) та темної теми.
- **Роутинг та стан:** `react-router-dom`, React Context (Auth, Theme).
- **Мережа та Real-Time:** `axios`, `@microsoft/signalr`.
- **Іконки:** `lucide-react`.

---

## 🚀 Швидкий старт

### 1. Налаштування бази даних (NeonDB)
Відкрийте файл `backend/src/WebApi/appsettings.json` і замініть значення `ConnectionStrings:DefaultConnection` на ваш рядок підключення NeonDB:

```json
"ConnectionStrings": {
  "DefaultConnection": "Host=ep-xyz.eu-central-1.aws.neon.tech;Database=neondb;Username=your_user;Password=your_password;SSL Mode=Require;Trust Server Certificate=true"
}
```

### 2. Запуск Backend (.NET 9)
```bash
cd backend/src/WebApi
dotnet run
```
API буде доступне за адресою: `http://localhost:5000` або `https://localhost:5001`.
Документація Swagger: `http://localhost:5000/swagger`.

### 3. Запуск Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Фронтенд буде доступний за адресою: `http://localhost:5173`.

---

## 🌐 Деплой одним сервісом (All-in-One Docker — 100% Безкоштовно)

Проєкт налаштовано так, що **і Frontend, і Backend збираються в один єдиний Docker-контейнер**.
Бекенд на ASP.NET Core автоматично роздає скомпільований React SPA, API контролери на `/api` та SignalR хаб на `/chatHub`.

### Розгортання на [Render.com](https://render.com) за 2 хвилини:
1. Запушіть репозиторій на GitHub.
2. Зайдіть на Render.com ➔ **New +** ➔ **Web Service**.
3. Підключіть ваш репозиторій.
4. Render автоматично побачить `Dockerfile` в корені.
5. Задайте змінні середовища (Environment Variables):
   - `ConnectionStrings__DefaultConnection` = *ваш connection string з NeonDB*
6. Натисніть **Deploy Web Service** — і ви отримаєте одне робоче посилання на весь проєкт!
