# تشخيص مشاكل صفحة الإدارة 💬

## المشاكل الشائعة والحلول:

### 1. المحادثات لا تظهر في صفحة الإدارة

#### السبب:
- لا توجد بيانات في قاعدة البيانات
- مشكلة في الاتصال بقاعدة البيانات
- مشكلة في الـ API endpoints

#### الحل:
```bash
# 1. تأكد من أن السيرفر يعمل
python manage.py runserver 8000

# 2. أنشئ البيانات التجريبية
python -c "
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'App.settings')
django.setup()

from authentication.models import User
from chat.models import Conversation, Message

# Create admin user
admin_user, created = User.objects.get_or_create(
    email='admin@test.com',
    defaults={
        'username': 'testadmin',
        'first_name': 'Admin',
        'last_name': 'User',
        'role': 'admin',
    }
)
if created:
    admin_user.set_password('admin123')
    admin_user.save()

# Create student user
student_user, created = User.objects.get_or_create(
    email='student@test.com',
    defaults={
        'username': 'teststudent',
        'first_name': 'Test',
        'last_name': 'Student',
        'role': 'student',
    }
)
if created:
    student_user.set_password('student123')
    student_user.save()

# Create conversation
conversation, created = Conversation.objects.get_or_create(
    user=student_user,
    defaults={'is_active': True}
)

# Create messages
if not Message.objects.filter(conversation=conversation).exists():
    Message.objects.create(
        conversation=conversation,
        sender=student_user,
        content='Hello admin, I need help!',
        message_type='text'
    )
    Message.objects.create(
        conversation=conversation,
        sender=admin_user,
        content='Hi! How can I help?',
        message_type='text'
    )

print(f'Users: {User.objects.count()}')
print(f'Conversations: {Conversation.objects.count()}')
print(f'Messages: {Message.objects.count()}')
"
```

### 2. الرسائل لا تظهر عند اختيار محادثة

#### السبب:
- مشكلة في تحميل الرسائل
- مشكلة في الـ API response
- مشكلة في عرض البيانات

#### الحل:
1. افتح Developer Tools (F12)
2. اذهب إلى Console tab
3. ابحث عن أخطاء JavaScript
4. اذهب إلى Network tab
5. انقر على محادثة
6. تحقق من طلبات الـ API

### 3. رسائل الخطأ في Console

#### `net::ERR_CONNECTION_REFUSED`:
- السيرفر لا يعمل
- الحل: `python manage.py runserver 8000`

#### `401 Unauthorized`:
- مشكلة في الـ authentication
- الحل: تأكد من تسجيل الدخول كـ admin

#### `404 Not Found`:
- مشكلة في الـ API endpoints
- الحل: تحقق من الـ URLs في `chat/urls.py`

### 4. اختبار الـ API مباشرة

#### اختبار الاتصال:
```bash
curl http://localhost:8000/api/health/
```

#### اختبار المحادثات (مع token):
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/chat/conversations/
```

### 5. تحقق من البيانات في قاعدة البيانات

```bash
python manage.py shell
```

```python
from authentication.models import User
from chat.models import Conversation, Message

# تحقق من المستخدمين
print(f'Users: {User.objects.count()}')
for user in User.objects.all():
    print(f'- {user.email} ({user.role})')

# تحقق من المحادثات
print(f'Conversations: {Conversation.objects.count()}')
for conv in Conversation.objects.all():
    print(f'- ID: {conv.id}, User: {conv.user.email}')

# تحقق من الرسائل
print(f'Messages: {Message.objects.count()}')
for msg in Message.objects.all():
    print(f'- ID: {msg.id}, Sender: {msg.sender.email}, Content: {msg.content[:30]}...')
```

### 6. إعادة تعيين النظام

```bash
# 1. احذف قاعدة البيانات
rm db.sqlite3

# 2. أعد إنشاء المايجريشن
python manage.py makemigrations
python manage.py migrate

# 3. أنشئ superuser
python manage.py createsuperuser

# 4. أنشئ البيانات التجريبية
python create_test_data.py
```

### 7. تحقق من الإعدادات

#### في `settings.py`:
```python
INSTALLED_APPS = [
    # ... other apps
    'chat',  # يجب أن يكون موجود
]

AUTH_USER_MODEL = 'authentication.User'  # يجب أن يكون صحيح
```

#### في `urls.py`:
```python
urlpatterns = [
    # ... other patterns
    path('api/chat/', include('chat.urls')),  # يجب أن يكون موجود
]
```

### 8. اختبار سريع

1. **افتح صفحة الإدارة**: http://localhost:5173/admin/chat
2. **سجل دخول**: admin@test.com / admin123
3. **انقر على "Test Connection"**
4. **انقر على "Run Tests"**
5. **تحقق من النتائج**

### 9. إذا لم تعمل بعد كل هذا

1. تحقق من Console للأخطاء
2. تحقق من Network للطلبات الفاشلة
3. تأكد من أن السيرفر يعمل
4. تأكد من البيانات في قاعدة البيانات
5. أعد تشغيل السيرفر

## النتيجة المتوقعة:
- صفحة الإدارة تعرض المحادثات ✅
- الرسائل تظهر عند اختيار محادثة ✅
- يمكن إرسال واستقبال الرسائل ✅
- عداد الرسائل غير المقروءة يعمل ✅

جرب الآن! 🎉