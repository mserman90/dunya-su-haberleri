import { fetchLiveWaterNews } from '../services/rssService.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_PATH = path.join(__dirname, '..', 'data', 'news.json');

async function syncAndPublish() {
  console.log('🔍 Google News Dorking ile su yönetimi haberleri taranıyor...');
  const dorkedItems = await fetchLiveWaterNews(20);
  console.log(`📡 Toplam ${dorkedItems.length} adet dork haberi bulundu.`);

  let currentNews = [];
  try {
    if (fs.existsSync(DATA_PATH)) {
      currentNews = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
    }
  } catch (e) {
    console.warn('Mevcut haberler okunamadı, yeni liste oluşturuluyor.');
  }

  const existingTitles = new Set(currentNews.map(n => n.title.toLowerCase().trim()));
  const newItems = [];

  for (const item of dorkedItems) {
    const normTitle = item.title.toLowerCase().trim();
    if (!existingTitles.has(normTitle)) {
      currentNews.unshift(item);
      newItems.push(item);
      existingTitles.add(normTitle);
    }
  }

  // En güncel 100 haberle sınırla ve tarihe göre sırala
  currentNews.sort((a, b) => new Date(b.date) - new Date(a.date));
  const finalNews = currentNews.slice(0, 80);

  fs.writeFileSync(DATA_PATH, JSON.stringify(finalNews, null, 2), 'utf-8');

  console.log(`✅ ${newItems.length} adet yeni su yönetimi haberi yayınlandı!`);
  console.log(`📊 Toplam yayınlanan haber sayısı: ${finalNews.length}`);
  
  newItems.forEach((n, idx) => {
    console.log(`[${idx + 1}] [${n.country}] [${n.category.toUpperCase()}] ${n.title}`);
  });
}

syncAndPublish().catch(err => {
  console.error('Dorking senkronizasyon hatası:', err);
  process.exit(1);
});
