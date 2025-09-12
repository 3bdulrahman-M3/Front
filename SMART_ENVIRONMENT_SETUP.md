# إعداد البيئة الذكي 🌐

## النظام الجديد يشتغل بالاتنين تلقائياً!

### ✨ المميزات الجديدة:

1. **الاكتشاف التلقائي**: النظام يختار البيئة المناسبة تلقائياً
2. **التبديل اليدوي**: يمكنك تغيير البيئة يدوياً من الـ Navbar
3. **معلومات البيئة**: عرض معلومات البيئة الحالية
4. **الحفظ التلقائي**: يحفظ اختيارك في localStorage

### 🔄 كيف يعمل:

#### الاكتشاف التلقائي:
- **localhost**: يستخدم الباك إند المحلي
- **Railway**: يستخدم Railway API
- **Netlify**: يستخدم Railway API
- **أي دومين آخر**: يستخدم الإنتاج

#### التبديل اليدوي:
- **Auto Detect**: اكتشاف تلقائي
- **Local Development**: محلي فقط
- **Production**: إنتاج فقط

### 🎯 كيفية الاستخدام:

#### 1. التشغيل التلقائي:
```bash
# الباك إند
cd "Educational-platform/Educational-platform/BackEnd/App"
python manage.py runserver 8000

# الفرونت إند
cd Front
npm run dev
```

#### 2. التبديل اليدوي:
- انقر على زر البيئة في الـ Navbar
- اختر البيئة المطلوبة
- الصفحة ستتحدث تلقائياً

#### 3. مراقبة البيئة:
- انقر على أيقونة البيئة في أسفل يمين الصفحة
- عرض معلومات البيئة الحالية

### 📱 واجهات مختلفة:

#### للمطورين:
- **Local**: http://localhost:5173 (محلي)
- **Production**: https://your-domain.com (إنتاج)

#### للاختبار:
- **Local Backend**: http://localhost:8000/api/
- **Production Backend**: https://educational-platform-production.up.railway.app/api/

### 🔧 الإعدادات المتقدمة:

#### تغيير إعدادات API:
في ملف `src/config/api.js`:
```javascript
const API_CONFIG = {
  LOCAL: "http://localhost:8000/api/",
  PRODUCTION: "https://your-api.com/api/",
  // إضافة بيئات جديدة
};
```

#### إضافة بيئة جديدة:
```javascript
// في detectEnvironment function
if (window.location.hostname.includes('your-domain')) {
  return "YOUR_ENV";
}
```

### 🎉 النتيجة:

الآن يمكنك:
- ✅ العمل محلياً بدون تعديلات
- ✅ النشر للإنتاج بدون تعديلات
- ✅ التبديل بين البيئات بسهولة
- ✅ مراقبة البيئة الحالية
- ✅ الحفظ التلقائي للاختيارات

### 🚀 للبدء:

1. شغل الباك إند: `python manage.py runserver 8000`
2. شغل الفرونت إند: `npm run dev`
3. افتح: http://localhost:5173
4. استمتع بالعمل! 🎊

