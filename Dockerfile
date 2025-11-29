# Базовий образ з Node.js
FROM node:20-alpine

# Створюємо робочу директорію в контейнері
WORKDIR /app

# Копіюємо package.json і package-lock.json (якщо є)
COPY package*.json ./

# Встановлюємо залежності
RUN npm install

# Копіюємо весь проєкт
COPY . .

# Створюємо директорію для кешу (якщо її ще немає)
RUN mkdir -p /app/cache

# Виставляємо порт (як у твоєму коді)
EXPOSE 3000

# Команда запуску сервера
CMD ["node", "main.js", "-h", "0.0.0.0", "-p", "3000", "-c", "cache"]
