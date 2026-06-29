
-- Lock down SECURITY DEFINER functions: only triggers / RLS need them, not the public API
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.refresh_provider_rating() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;
-- has_role is used inside policies; keep authenticated execute only
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;

-- Seed Iraq governorates
INSERT INTO public.governorates (id, name_ar, name_en) VALUES
 (1,'بغداد','Baghdad'),
 (2,'البصرة','Basra'),
 (3,'نينوى','Nineveh'),
 (4,'أربيل','Erbil'),
 (5,'النجف','Najaf'),
 (6,'كربلاء','Karbala'),
 (7,'بابل','Babil'),
 (8,'الأنبار','Anbar'),
 (9,'ذي قار','Dhi Qar'),
 (10,'ديالى','Diyala'),
 (11,'كركوك','Kirkuk'),
 (12,'صلاح الدين','Salah ad-Din'),
 (13,'واسط','Wasit'),
 (14,'القادسية','Al-Qadisiyyah'),
 (15,'المثنى','Al-Muthanna'),
 (16,'ميسان','Maysan'),
 (17,'دهوك','Duhok'),
 (18,'السليمانية','Sulaymaniyah');
SELECT setval(pg_get_serial_sequence('public.governorates','id'), 100, false);

-- Seed areas (sample for each governorate)
INSERT INTO public.areas (governorate_id, name_ar) VALUES
-- Baghdad
(1,'الكرادة'),(1,'المنصور'),(1,'الكاظمية'),(1,'الأعظمية'),(1,'الدورة'),(1,'الشعلة'),(1,'مدينة الصدر'),(1,'الجادرية'),(1,'البياع'),(1,'حي الجامعة'),
-- Basra
(2,'العشار'),(2,'البراضعية'),(2,'الجبيلة'),(2,'الزبير'),(2,'أبو الخصيب'),(2,'المعقل'),(2,'حي الحسين'),
-- Nineveh
(3,'الموصل - الساحل الأيمن'),(3,'الموصل - الساحل الأيسر'),(3,'تلعفر'),(3,'سنجار'),
-- Erbil
(4,'عينكاوة'),(4,'وسط أربيل'),(4,'كويسنجق'),
-- Najaf
(5,'الكوفة'),(5,'مدينة النجف'),(5,'المناذرة'),
-- Karbala
(6,'وسط كربلاء'),(6,'الحسينية'),(6,'الحر'),
-- Babil
(7,'الحلة'),(7,'المسيب'),(7,'الهاشمية'),
-- Anbar
(8,'الرمادي'),(8,'الفلوجة'),(8,'هيت'),(8,'حديثة'),
-- Dhi Qar
(9,'الناصرية'),(9,'سوق الشيوخ'),(9,'الشطرة'),
-- Diyala
(10,'بعقوبة'),(10,'المقدادية'),(10,'خانقين'),
-- Kirkuk
(11,'وسط كركوك'),(11,'الحويجة'),(11,'داقوق'),
-- Salah ad-Din
(12,'تكريت'),(12,'سامراء'),(12,'بلد'),
-- Wasit
(13,'الكوت'),(13,'الصويرة'),(13,'النعمانية'),
-- Qadisiyyah
(14,'الديوانية'),(14,'عفك'),(14,'الشامية'),
-- Muthanna
(15,'السماوة'),(15,'الرميثة'),
-- Maysan
(16,'العمارة'),(16,'المجر الكبير'),(16,'الميمونة'),
-- Duhok
(17,'وسط دهوك'),(17,'زاخو'),(17,'العمادية'),
-- Sulaymaniyah
(18,'وسط السليمانية'),(18,'حلبجة'),(18,'رانية');
