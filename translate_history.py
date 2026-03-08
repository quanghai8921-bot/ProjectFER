import codecs

file_path = r'c:\Users\tfong\Documents\Group_5-main\src\app\profile\history\page.tsx'

translations = [
    ('"Tất cả"', '"All"'),
    ("'Tất cả'", "'All'"),
    ('"Đơn hàng"', '"Order"'),
    ("'Hoàn thành'", "'Completed'"),
    ("'Đang giao'", "'Delivering'"),
    ("'Đã Xác Nhận'", "'Confirmed'"),
    ("'Đã xác nhận'", "'Confirmed'"),
    ("'Đã giao'", "'Completed'"),
    ("'Đã hủy'", "'Cancelled'"),
    ('Cá nhân hóa', 'Personalized'),
    ('Lịch sử & Nhật ký Calo', 'History & Calorie Log'),
    ('Theo dõi hành trình ăn uống của bạn. AI của chúng tôi phân tích dinh dưỡng từ lịch sử đặt hàng để giúp bạn sống khỏe hơn mỗi ngày.', 'Track your eating journey. Our AI analyzes nutrition from your order history to help you live healthier every day.'),
    ('>Trung bình / ngày<', '>Average / day<'),
    ('>Đơn hàng tuần này<', '>Orders this week<'),
    ('>đơn<', '>orders<'),
    ('>Tổng tiền<', '>Total amount<'),
    ('>Calo<', '>Calories<'),
    ('>Chi tiết<', '>Details<'),
    ('>Đặt lại<', '>Reorder<'),
    ('Biểu đồ Calo', 'Calorie Chart'),
    ('>Tuần này<', '>This week<'),
    ('>T2<', '>Mon<'),
    ('>T3<', '>Tue<'),
    ('>T4<', '>Wed<'),
    ('>T5<', '>Thu<'),
    ('>T6<', '>Fri<'),
    ('>T7<', '>Sat<'),
    ('>CN<', '>Sun<'),
    ('Mục tiêu: 2000 kcal', 'Goal: 2000 kcal'),
    ('Đạt 85%', 'Reached 85%'),
    ('SmartBite AI Phân Tích', 'SmartBite AI Analysis'),
    ('Lời khuyên tuần này', 'This week\\'s advice'),
    ('Chào bạn! Dựa trên lịch sử ăn uống, tuần này bạn đã tiêu thụ hơi nhiều tinh bột vào buổi tối. Hãy thử thay thế bằng các món Salad hoặc ức gà nướng vào bữa tối hôm nay để cân bằng nhé!', 'Hello! Based on your eating history, you consumed a bit too many carbs at night this week. Try replacing them with Salads or grilled chicken breast for dinner today to balance things out!'),
    ('Xem thực đơn đề xuất', 'View suggested menu'),
    ('Dinh dưỡng đã nạp', 'Nutrition Intake'),
    ('>Protein (Đạm)<', '>Protein<'),
    ('>Carbs (Tinh bột)<', '>Carbs<'),
    ('>Fat (Chất béo)<', '>Fat<')
]

with codecs.open(file_path, 'r', 'utf-8') as f:
    content = f.read()

for vi, en in translations:
    content = content.replace(vi, en)

with codecs.open(file_path, 'w', 'utf-8') as f:
    f.write(content)

print('Translation completed.')
