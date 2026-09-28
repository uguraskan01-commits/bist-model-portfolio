# Antigravity & Gemini Project Rules: BIST-Alpha

Bu proje, Borsa İstanbul (BIST) hisselerini teknik, temel, momentum, KAP duyuruları, konsensüs hedef fiyatlar ve sosyal medya duygu analizine göre çok faktörlü puanlayan ve dinamik model portföyler oluşturan bir analitik sistemdir.

## Zorunlu Kurallar
1. **Otomatik GitHub Senkronizasyonu**:
   - Kullanıcının verdiği her komut veya yapılan her kod değişikliği tamamlandığında, değişiklikler `git add .` ile eklenmeli, anlamlı bir commit mesajıyla commit edilmeli ve `git push origin main` ile GitHub'a pushlanmalıdır.
2. **Kod Kalitesi & BIST Finansal Standartları**:
   - Puanlama algoritması 0-100 aralığında tutulur.
   - Sektör risk ağırlığı max %30 sınırına sadık kalınır.
   - Next.js ve Tailwind bileşenleri TypeScript tip güvenliğine uygun yazılır.
