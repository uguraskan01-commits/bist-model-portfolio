# BIST-Alpha Model Portföy & Analitik Ajan Kuralları

Bu proje, Borsa İstanbul (BIST) hisselerini teknik, temel, momentum, KAP duyuruları, konsensüs hedef fiyatlar ve sosyal medya duygu analizine göre çok faktörlü puanlayan ve dinamik model portföyler oluşturan bir analitik sistemdir.

## Temel Prensipler
1. **Çok Faktörlü Puanlama (Composite Scoring)**:
   - Skor aralığı 0-100'dür.
   - 75 ve üzeri: Güçlü Al (Portföy adayı)
   - 60 - 74: Al / İzle
   - 45 - 59: Nötr / Tut
   - 45 altı: Sat / Portföyden Çıkar
2. **Price Action & Seviyeler**:
   - Destek/Direnç seviyeleri, Breakout (Kırılım), Bullish Retest, Higher High / Higher Low yapıları açıkça etiketlenir.
3. **KAP & Duygu Analizi**:
   - KAP duyuruları finansal etki (yeni iş ilişkisi, ciro etkisi, temettü) bakımından etiketlenir.
4. **Portföy Risk Yönetimi**:
   - Tek bir sektör ağırlığı %30'u geçemez.
   - Her hissenin hedef fiyatı, stop-loss seviyesi ve getiri potansiyeli bulunur.

## Otomatik Git & GitHub Senkronizasyonu (Zorunlu Kural)
Kullanıcıdan gelen her geliştirme veya değişiklik talimatının ardından:
1. Yapılan tüm kod ve dosya değişiklikleri doğrulanır.
2. Anlamlı bir commit mesajıyla `git add .` ve `git commit` yapılır.
3. `git push origin main` çalıştırılarak GitHub reposu anında güncellenir.
4. Kullanıcıya commit özeti ve push durumu iletilir.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
