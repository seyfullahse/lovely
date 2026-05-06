# 💕 Lovely - Romantik Planlama Uygulaması

Sevgilinle birlikte planlarınızı ve yapılacaklarınızı yönetebileceğiniz, romantik temalı bir web uygulaması.

## ✨ Özellikler

- **Romantik Karşılama Sayfası**: Animasyonlu kalpler, sevgi dolu mesaj kartları, timeline
- **Takvim**: Aylık/haftalık/günlük görünüm, renk kodları (planlanan/gerçekleşen/geciken)
- **Yapılacaklar Listesi**: Görev ekleme, silme, güncelleme, duruma göre filtreleme
- **Plan Yönetimi**: Planları oluştur, tamamla, düzenle
- **İstatistikler**: Tamamlanma oranı, geciken görevler, haftalık özet
- **Firebase Auth**: Google ve e-posta ile giriş
- **Gerçek Zamanlı Senkronizasyon**: Firestore ile anlık veri güncelleme

## 🛠 Teknoloji Stack

| Katman | Teknoloji |
|--------|-----------|
| Frontend | React + Vite |
| Stil | Tailwind CSS v4 |
| Animasyon | Framer Motion |
| Backend | Firebase (Firestore + Auth) |
| Takvim | react-big-calendar |
| İkonlar | react-icons |

## 🚀 Kurulum

1. **Bağımlılıkları yükle:**
   ```bash
   npm install
   ```

2. **Firebase yapılandırması:**
   - Firebase Console'dan yeni bir proje oluştur
   - `.env.example` dosyasını `.env` olarak kopyala
   - Firebase bilgilerini `.env` dosyasına ekle

   ```bash
   cp .env.example .env
   ```

3. **Geliştirme sunucusunu başlat:**
   ```bash
   npm run dev
   ```

## 🔥 Firebase Kurulumu

1. [Firebase Console](https://console.firebase.google.com/) → Yeni proje oluştur
2. Authentication → "Email/Password" ve "Google" sağlayıcılarını etkinleştir
3. Firestore Database → Oluştur (test modunda başla)
4. Project Settings → Web app ekle → Config bilgilerini `.env` dosyasına yapıştır

### Firestore Güvenlik Kuralları

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /plans/{planId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
    match /todos/{todoId} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
  }
}
```

### Firestore İndeksler

`plans` koleksiyonu için: `userId` (ASC) + `plannedDate` (ASC)
`todos` koleksiyonu için: `userId` (ASC) + `plannedDate` (ASC)

## 📁 Proje Yapısı

```
src/
├── components/
│   ├── calendar/         # Takvim bileşeni
│   ├── layout/           # Navbar, Layout
│   ├── plans/            # Plan ekleme, düzenleme, kartlar
│   ├── romantic/         # Kalpler, animasyonlar, sevgi kartları
│   ├── stats/            # İstatistik paneli
│   └── todos/            # Yapılacaklar listesi
├── config/
│   └── firebase.js       # Firebase yapılandırması
├── context/
│   ├── AuthContext.jsx    # Kimlik doğrulama
│   └── DataContext.jsx    # Veri yönetimi (CRUD)
├── pages/
│   ├── Dashboard.jsx     # Ana dashboard
│   ├── LandingPage.jsx   # Romantik karşılama
│   └── LoginPage.jsx     # Giriş/Kayıt
├── App.jsx               # Router
├── index.css             # Tailwind + özel stiller
└── main.jsx              # Giriş noktası
```

## 🎨 Renk Paleti

- **Planlanan**: 🔵 Mavi (`#60a5fa`)
- **Tamamlanan**: 🟢 Yeşil (`#34d399`)
- **Geciken**: 🔴 Kırmızı (`#fb7185`)
- **Bekleyen**: 🟡 Sarı (`#fbbf24`)

## 💕 Sevgiyle yapıldı
