import express from 'express';
import cors from 'cors';
import { kv } from '@vercel/kv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { fetchLiveWaterNews } from './services/rssService.js';
import { generateWaterInsights, askWaterAI } from './services/aiService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOCAL_DATA_PATH = path.join(__dirname, 'data', 'news.json');

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Yerel Dosyadan Güvenli Okuma (Sıfır API Key Fallback)
function readLocalNews() {
  try {
    if (fs.existsSync(LOCAL_DATA_PATH)) {
      const data = fs.readFileSync(LOCAL_DATA_PATH, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn('Yerel data/news.json okunamadı:', err.message);
  }
  return [];
}

function isTest() {
  return process.env.NODE_ENV === 'test' || (process.argv && process.argv.some(arg => arg.includes('test')));
}

// Yerel Dosyaya Güvenli Kaydetme (Sıfır API Key Kalıcılık)
function writeLocalNews(news) {
  // Test ortamında gerçek üretim verilerini asla kirletme
  if (isTest()) {
    return;
  }
  try {
    const dir = path.dirname(LOCAL_DATA_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LOCAL_DATA_PATH, JSON.stringify(news, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Yerel data/news.json dosyasına yazılamadı:', err.message);
  }
}

// Haftalık Olay Havuzu
const weeklyUpdatePool = [
  { region: 'central-asia', category: 'tech', country: 'Özbekistan', title: 'Özbekistan: Amuderya Deltası Damla Sulama Hamlesi', lat: 42.46, lng: 59.61, description: 'Pamuk üretiminde damla sulamaya geçişle yıllık su tasarrufu artıyor.', emoji: '💧', color: '#3498db' },
  { region: 'europe', category: 'ecology', country: 'Fransa', title: 'Fransa: Rhône Nehri Soğutma Suyu ve Ekolojik Akış Düzenlemesi', lat: 45.7640, lng: 4.8357, description: 'Yaz ayları öncesi nükleer santraller ve tarım için su tahsis planı revize edildi.', emoji: '🇪🇺', color: '#27ae60' },
  { region: 'africa', category: 'drought', country: 'Güney Afrika', title: 'Güney Afrika: Cape Town Yeraltı Suyu Koruma Stratejisi', lat: -33.9249, lng: 18.4241, description: 'Sıfır Gün krizinden çıkarılan derslerle akifer besleme projeleri hızlandı.', emoji: '🇿🇦', color: '#e67e22' },
  { region: 'arab', category: 'tech', country: 'BAE', title: 'BAE: Bulut Tohumlama ve Yağmur Suyu Hasadı Raporu', lat: 24.4539, lng: 54.3773, description: 'Ulusal Meteoroloji Merkezi yağış verimliliği sonuçlarını kamuoyuyla paylaştı.', emoji: '🇦🇪', color: '#e74c3c' },
  { region: 'asia', category: 'drought', country: 'Vietnam', title: 'Vietnam: Mekong Deltası Tuzluluk Erken Uyarı Sistemi', lat: 10.0452, lng: 105.7469, description: 'Pirinç tarlalarını korumak için tuzlu su girişine karşı akıllı bentler kuruldu.', emoji: '🇻🇳', color: '#9b59b6' },
  { region: 'america', category: 'dam', country: 'Meksika', title: 'Meksika: Cutzamala Su Sistemi Restorasyon Protokolü', lat: 19.4326, lng: -99.1332, description: 'Başkent Mexico City için ana su iletim hattında kaçak önleme çalışmaları.', emoji: '🇲🇽', color: '#f1c40f' }
];

const initialNews = [
  { id: 1, region: 'central-asia', category: 'diplomacy', title: 'ICWC 91. Toplantısı: 2025-2026 Su Tahsisleri Onaylandı', date: '2025-11-15', country: 'Türkmenistan', lat: 37.95, lng: 58.38, description: 'Bölgesel su paylaşım kotası belirlendi ve havza komisyonu protokolü imzalandı.', url: 'https://www.unwater.org/', emoji: '💧', color: '#3498db' },
  { id: 3, region: 'central-asia', category: 'dam', title: 'Kuzey Aral Gölü Hacmi 23 Milyar m³ Seviyesine Yükseldi', date: '2026-03-10', country: 'Kazakistan', lat: 46.05, lng: 61.65, description: 'Kökaral Barajı ıslah projeleri sayesinde göl seviyesi ve biyolojik çeşitlilik artıyor.', url: 'https://www.unwater.org/', emoji: '🌊', color: '#3498db' },
  { id: 9, region: 'arab', category: 'diplomacy', title: 'Mısır-Sudan-Etiyopya: GERD Müzakereleri Yeniden Başladı', date: '2026-02-10', country: 'Mısır', lat: 30.0444, lng: 31.2357, description: 'Nil sularının paylaşımı ve kuraklık protokolü için teknik heyetler toplandı.', url: 'https://www.aljazeera.com/', emoji: '🇪🇬', color: '#e74c3c' },
  { id: 11, region: 'arab', category: 'tech', title: 'Suudi Arabistan: Neom Güneş Enerjili Deniz Suyu Arıtma Tesisi', date: '2026-03-05', country: 'Suudi Arabistan', lat: 24.7136, lng: 46.6753, description: 'Sıfır karbon emisyonlu desalinasyon üniteleri devreye alındı.', url: 'https://www.unwater.org/', emoji: '🇸🇦', color: '#e74c3c' },
  { id: 12, region: 'arab', category: 'diplomacy', title: 'Türkiye - Irak: Dicle ve Fırat Ortak Su Yönetim Komitesi', date: '2026-04-12', country: 'Irak', lat: 33.3152, lng: 44.3661, description: 'Sınır aşan suların verimli kullanımı ve kuraklıkla mücadele için ortak eylem planı.', url: 'https://www.unwater.org/', emoji: '🇮🇶', color: '#e74c3c' },
  { id: 19, region: 'africa', category: 'tech', title: 'Sudan: Büyük Sahra Akiferi ve Yeraltı Su Rezervuarları Haritası', date: '2026-04-05', country: 'Sudan', lat: 15.5007, lng: 32.5599, description: 'Nubian kumtaşı akifer sisteminde derin su kaynakları tespit edildi.', url: 'https://www.unwater.org/', emoji: '🌍', color: '#e67e22' },
  { id: 22, region: 'africa', category: 'dam', title: 'Etiyopya: Rönesans Barajı Tam Kapasite Elektrik Üretimi', date: '2026-01-20', country: 'Etiyopya', lat: 9.0300, lng: 38.7400, description: 'Mavi Nil üzerindeki baraj santrali tam kapasiteye ulaştı.', url: 'https://www.aljazeera.com/', emoji: '🇪🇹', color: '#e67e22' },
  { id: 30, region: 'europe', category: 'tech', title: 'İspanya: Katalonya Havzasında Akıllı Su Geri Dönüşümü', date: '2026-05-15', country: 'İspanya', lat: 41.3851, lng: 2.1734, description: 'Barselona ve çevresinde arıtılmış atıksu tarım sulamasında %40 paya ulaştı.', url: 'https://www.elpais.com/', emoji: '🇪🇸', color: '#27ae60' },
  { id: 32, region: 'europe', category: 'tech', title: 'İtalya: Po Ovası Sulama Modernizasyonu ve Baraj Takibi', date: '2026-04-22', country: 'İtalya', lat: 45.0703, lng: 7.6869, description: 'Sensör tabanlı hassas tarım sulaması ile su israfı %25 azaltıldı.', url: 'https://www.ansa.it/', emoji: '🇮🇹', color: '#27ae60' },
  { id: 40, region: 'america', category: 'ecology', title: 'Brezilya: Amazon Havzası Koruma ve Nehir Ulaşım Protokolü', date: '2026-06-05', country: 'Brezilya', lat: -3.4653, lng: -62.2159, description: 'Kuraklık dönemlerinde nehir ekosistemini ve yerli halk su kaynaklarını koruma planı.', url: 'https://www.globo.com/', emoji: '🇧🇷', color: '#f1c40f' },
  { id: 41, region: 'america', category: 'drought', title: 'ABD: Colorado Nehri Havzası 7 Eyalet Su Paylaşım Paktı', date: '2026-03-20', country: 'ABD', lat: 36.1699, lng: -115.1398, description: 'Mead ve Powell göllerindeki kritik su seviyesi nedeniyle yeni kısıtlamalar kabul edildi.', url: 'https://www.nytimes.com/', emoji: '🇺🇸', color: '#f1c40f' },
  { id: 50, region: 'oceania', category: 'ecology', title: 'Avustralya: Murray-Darling Havzası Islah ve Tuzluluk Kontrolü', date: '2026-05-10', country: 'Avustralya', lat: -34.0000, lng: 140.0000, description: 'Nehir yatağındaki tuzluluğu düşürmek için akıllı savak ve drenaj sistemleri kuruldu.', url: 'https://www.abc.net.au/', emoji: '🇦🇺', color: '#1abc9c' },
  { id: 51, region: 'oceania', category: 'ecology', title: 'Yeni Zelanda: Whanganui Nehri Ekolojik İzleme Raporu', date: '2026-03-15', country: 'Yeni Zelanda', lat: -39.0000, lng: 175.0000, description: 'Hukuki kişilik statüsü verilen nehirde biyoçeşitlilik indeksleri yükseldi.', url: 'https://www.rnz.co.nz/', emoji: '🇳🇿', color: '#1abc9c' },
  { id: 60, region: 'asia', category: 'ecology', title: 'Hindistan: Ganj Nehri Temizlik ve Arıtma Projesi 2. Etabı', date: '2026-06-20', country: 'Hindistan', lat: 25.3176, lng: 82.9739, description: 'Varanasi ve Kanpur bölgelerinde sanayi atıklarının nehre girişi engellendi.', url: 'https://timesofindia.indiatimes.com/', emoji: '🇮🇳', color: '#9b59b6' },
  { id: 61, region: 'asia', category: 'dam', title: 'Çin: Güneyden Kuzeye Su Transfer Kanalında 60 Milyar m³ Eşiği', date: '2026-04-05', country: 'Çin', lat: 39.9042, lng: 116.4074, description: 'Pekin ve Tianjin bölgelerine Yangtze Nehrinden aktarılan su miktarı rekor kırdı.', url: 'http://www.xinhuanet.com/', emoji: '🇨🇳', color: '#9b59b6' }
];

async function getNews() {
  // 1. Önce Vercel KV dene
  try {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      let news = await kv.get('water_news');
      if (news && Array.isArray(news) && news.length > 0) {
        return news.sort((a, b) => new Date(b.date) - new Date(a.date));
      }
    }
  } catch (err) {}

  // 2. Vercel KV yoksa tamamen ücretsiz yerel dosya sisteminden oku
  const local = readLocalNews();
  if (local && Array.isArray(local) && local.length > 0) {
    return local.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  // 3. Dosya yoksa veya boşsa initialNews yaz ve döndür
  writeLocalNews(initialNews);
  return [...initialNews].sort((a, b) => new Date(b.date) - new Date(a.date));
}

async function setNews(news) {
  // 1. Yerel dosyaya yaz (Her zaman kalıcı, sıfır API key)
  writeLocalNews(news);

  // 2. Vercel KV varsa ona da yaz
  try {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      await kv.set('water_news', news);
    }
    return true;
  } catch (err) {
    return false;
  }
}

function sanitizeString(str, maxLen = 300) {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, maxLen);
}

// API: Haberleri Listele
app.get('/api/news', async (req, res) => {
  try {
    let news = await getNews();
    const { region, category } = req.query;

    if (region && region !== 'all') {
      news = news.filter(n => n.region === region);
    }
    if (category && category !== 'all') {
      news = news.filter(n => n.category === category);
    }

    res.json(news);
  } catch (err) {
    res.status(500).json({ error: 'Haberler alınırken hata oluştu' });
  }
});

// API: Yeni Haber Ekle
app.post('/api/news', async (req, res) => {
  try {
    const requiredKey = process.env.ADMIN_API_KEY;
    if (requiredKey) {
      const clientKey = req.headers['x-api-key'] || (req.headers.authorization && req.headers.authorization.replace('Bearer ', ''));
      if (clientKey !== requiredKey) {
        return res.status(401).json({ error: 'Yetkisiz erişim: Geçersiz API anahtarı' });
      }
    }

    const { title, description, country, lat, lng, region, category, url, emoji, color } = req.body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ error: 'Başlık (title) zorunludur' });
    }

    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    if (isNaN(parsedLat) || parsedLat < -90 || parsedLat > 90) {
      return res.status(400).json({ error: 'Geçersiz enlem (lat) değeri (-90 ile 90 arasında olmalıdır)' });
    }
    if (isNaN(parsedLng) || parsedLng < -180 || parsedLng > 180) {
      return res.status(400).json({ error: 'Geçersiz boylam (lng) değeri (-180 ile 180 arasında olmalıdır)' });
    }

    const validRegions = ['all', 'central-asia', 'arab', 'africa', 'europe', 'america', 'oceania', 'asia'];
    const validCategories = ['general', 'dam', 'drought', 'diplomacy', 'tech', 'ecology'];
    
    const selectedRegion = validRegions.includes(region) ? region : 'all';
    const selectedCategory = validCategories.includes(category) ? category : 'general';

    const newItem = {
      id: Date.now(),
      title: sanitizeString(title, 150),
      description: sanitizeString(description || '', 500),
      country: sanitizeString(country || 'Bilinmiyor', 60),
      lat: parsedLat,
      lng: parsedLng,
      region: selectedRegion,
      category: selectedCategory,
      date: new Date().toISOString().split('T')[0],
      url: typeof url === 'string' && url.startsWith('http') ? url : 'https://www.unwater.org/',
      emoji: sanitizeString(emoji || '💧', 10),
      color: sanitizeString(color || '#3b82f6', 20)
    };

    const news = await getNews();
    news.unshift(newItem);
    await setNews(news);

    res.status(201).json(newItem);
  } catch (err) {
    console.error('Haber ekleme hatası:', err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// API: Ücretsiz Yapay Zeka Haber Analizi (Zero API Key)
app.post('/api/ai/insights', async (req, res) => {
  try {
    const { id, title, description, country } = req.body;
    let target = { title, description, country };

    if (id) {
      const all = await getNews();
      const found = all.find(n => n.id === id);
      if (found) target = found;
    }

    if (!target.title) {
      return res.status(400).json({ error: 'Analiz edilecek haber bulunamadı' });
    }

    const insights = await generateWaterInsights(target);
    res.json(insights);
  } catch (err) {
    console.error('AI Insights hatası:', err);
    res.status(500).json({ error: 'Yapay zeka analizi üretilemedi' });
  }
});

// API: Ücretsiz Yapay Zeka Su Asistanı (Zero API Key)
app.post('/api/ai/ask', async (req, res) => {
  try {
    const { question } = req.body;
    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return res.status(400).json({ error: 'Geçerli bir soru giriniz' });
    }

    const news = await getNews();
    const answer = await askWaterAI(question.trim().slice(0, 300), news);
    res.json({ answer });
  } catch (err) {
    console.error('AI Ask hatası:', err);
    res.status(500).json({ error: 'Yapay zeka yanıt üretemedi' });
  }
});

// API: Haftalık Cron Görevi
app.get('/api/cron-weekly', async (req, res) => {
  try {
    if (process.env.CRON_SECRET) {
      const authHeader = req.headers['authorization'];
      if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ error: 'Yetkisiz erişim: Geçersiz CRON_SECRET' });
      }
    }

    const news = await getNews();
    const template = weeklyUpdatePool[Math.floor(Math.random() * weeklyUpdatePool.length)];
    
    const newWeekly = {
      id: Date.now(),
      region: template.region,
      category: template.category || 'general',
      title: `[Haftalık Takip] ${template.title}`,
      date: new Date().toISOString().split('T')[0],
      country: template.country,
      lat: template.lat,
      lng: template.lng,
      description: template.description,
      url: 'https://www.unwater.org/',
      emoji: template.emoji,
      color: template.color
    };

    news.unshift(newWeekly);
    await setNews(news);
    res.json({ status: 'success', added: newWeekly });
  } catch (err) {
    console.error('Cron hatası:', err);
    res.status(500).json({ error: 'Cron işlemi başarısız' });
  }
});

// API: Canlı Google News Dorking Haberlerini Senkronize Et ve Yayınla
app.all('/api/sync-rss', async (req, res) => {
  try {
    const liveItems = await fetchLiveWaterNews(20);
    if (!liveItems || liveItems.length === 0) {
      return res.json({ status: 'no_new_data', count: 0 });
    }

    const currentNews = await getNews();
    const existingTitles = new Set(currentNews.map(n => n.title.toLowerCase()));

    const newlyAdded = [];
    for (const item of liveItems) {
      if (!existingTitles.has(item.title.toLowerCase())) {
        currentNews.unshift(item);
        newlyAdded.push(item);
        existingTitles.add(item.title.toLowerCase());
      }
    }

    if (newlyAdded.length > 0) {
      await setNews(currentNews);
    }

    res.json({
      status: 'success',
      addedCount: newlyAdded.length,
      items: newlyAdded
    });
  } catch (err) {
    console.error('RSS senkronizasyon hatası:', err);
    res.status(500).json({ error: 'RSS senkronizasyonu başarısız oldu' });
  }
});

const PORT = process.env.PORT || 3000;
const isMain = process.argv[1] && (process.argv[1].endsWith('server.js') || process.argv[1].endsWith('server'));
if (isMain && process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, () => console.log(`Su Haberleri sunucusu ${PORT} portunda çalışıyor (Sıfır API Anahtarı Modu)`));
}

export default app;
