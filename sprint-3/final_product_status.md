# Final Ürün Durumu

## Teslim anındaki ürün

CareerMatch AI, CV ve ilan metnini karşılaştırarak adayın başvuru hazırlığını açıklayan çalışan bir MVP'dir. Kullanıcı, ana ekranda CV metni girebilir veya desteklenen PDF/DOCX dosyasından metin çıkarabilir; ardından iş ya da staj ilanını ve başvuru türünü seçerek analiz başlatır.

## Kullanıcının gördüğü sonuçlar

- Eşleşme skoru ve başvuruya hazırlık skoru
- Skorun hangi eşleşme ve eksiklerden oluştuğunu anlatan açıklama
- Eşleşen beceriler, eksik beceriler ve gereksinim-kanıt tablosu
- Staj modu seçildiyse staja özel güçlü/zayıf yön değerlendirmesi
- Mini portfolyo proje önerisi, etik CV düzenleme önerileri ve mülakat soruları

## Teknik akış

React + Vite arayüzü `POST /analyze` çağrısını FastAPI uygulamasına gönderir. Teslim için kullanılacak backend giriş noktası `backend/app.py` içindeki `app` nesnesidir. Backend CV ve ilan becerilerini kural tabanlı olarak çıkarır, eşleştirme ve skor servislerini çalıştırır, sonucu JSON olarak döndürür. API geçici olarak erişilemezse frontend, demo deneyiminin kesilmemesi için yerel bir analiz yedeği üretir.

## Desteklenen CV biçimleri

- Doğrudan metin girişi
- Metin katmanı bulunan PDF
- DOCX

Taranmış/görüntü tabanlı PDF'lerde OCR bulunmadığından metin çıkarma garanti edilmez.

## Teslim sınırı

Ürün yerelde çalışır ve build/test kanıtları repodadır. Canlı deployment URL'si, production CORS ayarı, kullanıcı hesabı, analiz geçmişi ve kalıcı veritabanı bu teslimin dışında bırakılmıştır. Kural tabanlı eşleştirme, açıklanabilir MVP davranışı için tercih edilmiştir; LLM veya embedding tabanlı semantik eşleştirme sonraki sürümdür.
