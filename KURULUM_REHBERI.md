# Etkinlik Platformu Kurulum Rehberi

## Gereksinimler
- Node.js (v14 veya üstü)
- MongoDB (yerel veya cloud)
- npm

## Kurulum Adımları

### 1. Backend Kurulumu
```bash
cd server
npm install
cp .env.example .env
# .env dosyasını düzenleyerek MongoDB bağlantı bilgilerinizi girin
npm run dev