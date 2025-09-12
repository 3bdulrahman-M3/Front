# إعداد العمل المحلي 🏠

## كيفية تشغيل المشروع محلياً

### 1. تشغيل الباك إند
```bash
# انتقل لمجلد الباك إند
cd "Educational-platform/Educational-platform/BackEnd/App"

# شغل السيرفر
python manage.py runserver 8000
```

### 2. تشغيل الفرونت إند
```bash
# انتقل لمجلد الفرونت
cd Front

# شغل السيرفر
npm run dev
```

### 3. اختبار النظام
- الباك إند: http://localhost:8000/api/health/
- الفرونت إند: http://localhost:5173/
- صفحة الشات: http://localhost:5173/contact

## تبديل بين المحلي والإنتاج

في ملف `src/config/api.js`:
```javascript
// للعمل المحلي
CURRENT: "LOCAL"

// للإنتاج
CURRENT: "PRODUCTION"
```

## مشاكل شائعة وحلولها

### مشكلة whitenoise
```bash
pip install whitenoise
```

### مشكلة CORS
تأكد من أن الباك إند يسمح بـ localhost:5173

### مشكلة الاتصال
تأكد من أن الباك إند يعمل على المنفذ 8000

