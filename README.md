# BIST-Alpha: Borsa İstanbul Çok Faktörlü Hisse Puanlama & Model Portföy Sistemi

Borsa İstanbul (BIST) hisselerini **Teknik Analiz & Price Action**, **Temel Analiz**, **Momentum**, **KAP Bildirimleri Finansal Etkisi**, **Aracı Kurum Hedef Fiyatları** ve **Sosyal Medya Duygu Analizi** kriterlerine göre puanlayan ve dinamik model portföyler oluşturan yapay zeka destekli analitik platform.

---

## 🚀 Öne Çıkan Özellikler

1. **Çok Faktörlü Puanlama Algoritması (0 - 100 Puan)**:
   - **Teknik & Price Action (%25)**: Destek/Direnç seviyeleri, Breakout (Kırılım), Golden Cross, SMA 20/50/200 ve Risk/Ödül oranı.
   - **Momentum & Hacim (%20)**: RSI(14) boğa bölgesi optimizasyonu, MACD histogram genişlemesi, Bollinger bant sıkışması/patlaması.
   - **Temel & Çarpanlar (%25)**: Sektör F/K iskontosu, PD/DD, FD/FAVÖK, Özkaynak Kârlılığı (ROE) ve Net Borç / FAVÖK güvenliği.
   - **Aracı Kurum Konsensüsü (%15)**: İş Yatırım, Garanti BBVA, Ak Yatırım, Deniz vb. kurumların konsensüs hedef fiyat potansiyeli ve AL tavsiye oranları.
   - **KAP & Sosyal Duygu (%15)**: Yeni iş ilişkileri, kapasite artışları ve temettü bildirimlerinin pozitif/negatif sınıflandırması + sosyal medya konuşulma hacmi.

2. **Dinamik Model Portföy Karar Motoru**:
   - Belirttiğiniz senaryoya göre puanlanan hisseler (Örn: **TRALT** 72 puan) diğer hisselerle ve sektör tavanlarıyla kıyaslanır.
   - Puanı 68-70 eşiğini aşan ve sektöründe lider olan hisseler dinamik ağırlıklandırma ile portföye dahil edilir.
   - 3 Farklı Strateji Desteği:
     - **Dengeli BIST-Alpha Portföyü** (Amiral Gemisi)
     - **Yüksek Momentum & Kırılım Portföyü**
     - **Değer & Temettü Şampiyonları**
   - BIST 100 (XU100) benchmark karşılaştırması ve üretilen net Alfa takibi.

3. **Etkileşimli Simülatör & Laboratuvar**:
   - Kullanıcıların herhangi bir hissenin (veya TRALT'ın) teknik seviyelerini, KAP duygu puanını, RSI'ını ve çarpanlarını canlı kaydırıcılarla değiştirerek AI kararını anlık test edebileceği modül.

4. **Hisse Tarayıcısı (Screener) & Radar Analizi**:
   - Tüm BIST hisselerinin canlı taranması, filtreler ve 5 boyutlu radar görselleştirmesi.

---

## 🛠️ Teknoloji Yığını

- **Frontend & Fullstack**: Next.js 14+ (App Router, Turbopack, React 19, TypeScript)
- **Stil & Tasarım**: Tailwind CSS (Dark Mode Finansal Terminal Teması)
- **Görselleştirme & Grafikler**: Recharts (Radar Chart, Kümülatif Getiri Area Chart)
- **İkonlar**: Lucide React

---

## 💻 Çalıştırma

Geliştirme sunucusunu başlatmak için:

```bash
cd C:\Users\HERO\.gemini\antigravity\scratch\bist-model-portfolio
npm run dev
```

Tarayıcınızda açın: **[http://localhost:3000](http://localhost:3000)**
