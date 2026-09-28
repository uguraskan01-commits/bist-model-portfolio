const fs = require('fs');
const lines = fs.readFileSync('C:/Users/HERO/.gemini/antigravity/scratch/bist-model-portfolio/app/page.tsx', 'utf8').split('\n');

const newFooter =         {/* 5. Alt Bilgi (Footer) */}
        <footer className="border-t border-white/5 bg-[#0A0B0E] py-6 mt-12 text-xs text-zinc-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-white">xuProf Engine v3.0</span>
              <span className="text-zinc-600 px-1">•</span>
              <span className="font-medium text-zinc-400">BIST TÜM (XUTUM) Kapsamı</span>
              <span className="text-zinc-600 px-1">•</span>
              <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">Canlı Veri Ağı</span>
            </div>
  
            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 text-[10px] md:text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
              <span className="hover:text-white transition-colors cursor-pointer">Price Action & Çok Faktörlü Skorlama</span>
              <span className="hover:text-white transition-colors cursor-pointer">Tarihsel Backtest</span>
              <span className="hover:text-white transition-colors cursor-pointer">KAP Duyarlılık Analizi</span>
            </div>
          </div>
        </footer>;

lines.splice(133, 19, newFooter);

fs.writeFileSync('C:/Users/HERO/.gemini/antigravity/scratch/bist-model-portfolio/app/page.tsx', lines.join('\n'), 'utf8');
