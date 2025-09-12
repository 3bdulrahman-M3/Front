# إصلاح صفحة الإدارة - خطوات سريعة 🚀

## المشكلة:
- المحادثات لا تظهر في صفحة الإدارة
- الرسائل لا تظهر عند اختيار محادثة

## الحل السريع:

### 1. تأكد من أن السيرفر يعمل:
```bash
# في terminal جديد
cd "Educational-platform/Educational-platform/BackEnd/App"
python manage.py runserver 8000
```

### 2. أنشئ البيانات التجريبية:
```bash
# في terminal آخر
cd "Educational-platform/Educational-platform/BackEnd/App"
python -c "
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'App.settings')
django.setup()

from authentication.models import User
from chat.models import Conversation, Message

print('Creating test data...')

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
    print('✅ Admin user created')

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
    print('✅ Student user created')

# Create conversation
conversation, created = Conversation.objects.get_or_create(
    user=student_user,
    defaults={'is_active': True}
)
if created:
    print('✅ Conversation created')

# Create messages
if not Message.objects.filter(conversation=conversation).exists():
    Message.objects.create(
        conversation=conversation,
        sender=student_user,
        content='Hello admin, I need help with my course!',
        message_type='text'
    )
    Message.objects.create(
        conversation=conversation,
        sender=admin_user,
        content='Hi! I am here to help. What is the issue?',
        message_type='text'
    )
    Message.objects.create(
        conversation=conversation,
        sender=student_user,
        content='I cannot access the video lessons. It shows an error.',
        message_type='text'
    )
    print('✅ Messages created')

print(f'Total users: {User.objects.count()}')
print(f'Total conversations: {Conversation.objects.count()}')
print(f'Total messages: {Message.objects.count()}')
"
```

### 3. شغل الفرونت إند:
```bash
# في terminal جديد
cd Front
npm run dev
```

### 4. اختبر النظام:
1. اذهب إلى: http://localhost:5173/admin/chat
2. سجل دخول كـ admin: admin@test.com / admin123
3. انقر على "Test Connection" أولاً
4. انقر على "Run Tests" لاختبار الـ API

### 5. تحقق من النتائج:
- **Connection Status**: يجب أن يكون ✅ Connected
- **API Tests**: يجب أن تنجح جميع الاختبارات
- **Conversations**: يجب أن تظهر المحادثة في الشريط الجانبي
- **Messages**: يجب أن تظهر الرسائل عند اختيار المحادثة

## إذا لم تعمل:

### تحقق من Console:
1. افتح Developer Tools (F12)
2. اذهب إلى Console tab
3. ابحث عن أخطاء

### تحقق من Network:
1. اذهب إلى Network tab
2. انقر على "Test Connection"
3. تحقق من الطلبات

### تحقق من البيانات:
```bash
python manage.py shell
```

```python
from authentication.models import User
from chat.models import Conversation, Message

print(f'Users: {User.objects.count()}')
print(f'Conversations: {Conversation.objects.count()}')
print(f'Messages: {Message.objects.count()}')
```

## النتيجة المتوقعة:
- صفحة الإدارة تعرض المحادثات ✅
- الرسائل تظهر عند اختيار محادثة ✅
- يمكن إرسال واستقبال الرسائل ✅
- عداد الرسائل غير المقروءة يعمل ✅

## بيانات الدخول:
- **Admin**: admin@test.com / admin123
- **Student**: student@test.com / student123

جرب الآن! 🎉

