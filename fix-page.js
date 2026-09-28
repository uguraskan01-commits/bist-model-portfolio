const fs = require('fs');
let content = fs.readFileSync('C:/Users/HERO/.gemini/antigravity/scratch/bist-model-portfolio/app/page.tsx', 'utf8');

// Replace all corrupted garbage with normal characters
content = content.replace(/Canl[^\s]* Veri/g, 'Canlı Veri');
content = content.replace(/BIST T[^\s]* Kapsam[^\s]*/g, 'BIST TÜM (XUTUM) Kapsamı');
content = content.replace(/Price Action & [^\s]* Fakt[^\s]*rl[^\s]* Skorlama/g, 'Price Action & Çok Faktörlü Skorlama');
content = content.replace(/KAP Duyarl[^\s]*l[^\s]*k Analizi/g, 'KAP Duyarlılık Analizi');
content = content.replace(/Ana [^\s]*erik/g, 'Ana İçerik');
content = content.replace(/[^\s]*st Navigasyon/g, 'Üst Navigasyon');
content = content.replace(/Veri Durum Band[^\s]*/g, 'Veri Durum Bandı');
content = content.replace(/Hisse Detay ve Price Action Modal[^\s]* \(Yaln[^\s]*zca modalStock a[^\s]*k[^\s]*a tan[^\s]*mland[^\s]*nda\)/g, 'Hisse Detay ve Price Action Modalı (Yalnızca modalStock açıkça tanımlandığında)');
content = content.replace(/Veri Kaynaklar[^\s]* & Platformlar Modal[^\s]*/g, 'Veri Kaynakları & Platformlar Modalı');
content = content.replace(/Tema Y[^\s]*netimi/g, 'Tema Yönetimi');
content = content.replace(/--- Canl[^\s]* piyasa verisi \(Yahoo Finance\) ---/g, '--- Canlı piyasa verisi (Yahoo Finance) ---');
content = content.replace(/--- Statik \+ Canl[^\s]* verileri birle[^\s]*tir ---/g, '--- Statik + Canlı verileri birleştir ---');
content = content.replace(/Model portf[^\s]*yleri do[^\s]*rudan canl[^\s]* fiyatl[^\s]* hisse havuzundan dinamik [^\s]*ret/g, 'Model portföyleri doğrudan canlı fiyatlı hisse havuzundan dinamik üret');
content = content.replace(/Canl[^\s]* fiyata sahip hisse say[^\s]*s[^\s]*/g, 'Canlı fiyata sahip hisse sayısı');
content = content.replace(/<span>f''fǽ''f\?s'<\/span>/g, '<span>•</span>');

fs.writeFileSync('C:/Users/HERO/.gemini/antigravity/scratch/bist-model-portfolio/app/page.tsx', content, 'utf8');
