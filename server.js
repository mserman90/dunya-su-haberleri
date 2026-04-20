import express from 'express';
import cors from 'cors';
import { kv } from '@vercel/kv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const initialNews = [
  // === ORTA ASYA ===
  { id: 1, region: 'central-asia', title: 'ICWC 91. Toplantisi: 2025-2026 Su Tahsisleri Onaylandi', date: '2025-11-15', country: 'Turkmenistan', lat: 37.95, lng: 58.38, description: 'Bölgesel su paylaşım kotası belirlendi.', url: 'https://www.unwater.org/', emoji: '💧', color: '#3498db' },
  { id: 3, region: 'central-asia', title: 'Kuzey Aral Golu Hacmi 23 milyar m3e Yukseldi', date: '2026-03-10', country: 'Kazakistan', lat: 46.05, lng: 61.65, description: 'Baraj projeleri sayesinde göl seviyesi artıyor.', url: 'https://www.unwater.org/', emoji: '🌊', color: '#3498db' },
  // === ARAP ULKELERI ===
  { id: 9, region: 'arab', title: 'Misir-Sudan-Etiyopya: GERD Muzakereleri Yeniden Basladi', date: '2026-02-10', country: 'Misir', lat: 30.0444, lng: 31.2357, description: 'Nil sularının paylaşımı için kritik zirve.', url: 'https://www.aljazeera.com/', emoji: '🇪🇬', color: '#e74c3c' },
  { id: 11, region: 'arab', title: 'Suudi Arabistan: Neom Deniz Suyu Aritma Kapasitesi Artti', date: '2026-03-05', country: 'Suudi Arabistan', lat: 24.7136, lng: 46.6753, description: 'Güneş enerjili arıtma tesisleri devreye girdi.', url: 'https://www.unwater.org/', emoji: '🇸🇦', color: '#e74c3c' },
  // === AFRIKA ===
  { id: 19, region: 'africa', title: 'Sudan: Buyuk Sahra Su Rezervuarlari Arastirmasi', date: '2026-04-05', country: 'Sudan', lat: 15.5007, lng: 32.5599, description: 'Yeraltı su kaynakları haritalanıyor.', url: 'https://www.unwater.org/', emoji: '🌍', color: '#e67e22' },
  { id: 20, region: 'africa', title: 'Guney Afrika: Cape Town Yeni Su Yonetim Sistemi', date: '2026-03-12', country: 'Guney Afrika', lat: -33.9249, lng: 18.4232, description: 'Kuraklık riskine karşı dijital takip.', url: 'https://www.bbc.com/news', emoji: '🇿🇦', color: '#e67e22' },
  { id: 21, region: 'africa', title: 'Nijerya: Cad Golu Restorasyon Girisimi', date: '2026-02-28', country: 'Nijerya', lat: 9.0820, lng: 8.6753, description: 'Gölün küçülmesini engelleme projesi.', url: 'https://www.unwater.org/', emoji: '🇳🇬', color: '#e67e22' },
  { id: 22, region: 'africa', title: 'Etiyopya: GERD 4. Faz Elektrik Uretimi', date: '2026-01-20', country: 'Etiyopya', lat: 9.0300, lng: 38.7400, description: 'Barajın tam kapasiteye ulaşması bekleniyor.', url: 'https://www.aljazeera.com/', emoji: '🇪🇹', color: '#e67e22' },
  { id: 23, region: 'africa', title: 'Kenya: Tana Nehri Sulama Kanallari Modernizasyonu', date: '2026-03-25', country: 'Kenya', lat: -1.2921, lng: 36.8219, description: 'Tarımda su tasarrufu hedefleniyor.', url: 'https://www.unwater.org/', emoji: '🇰🇪', color: '#e67e22' },
  { id: 24, region: 'africa', title: 'Kongo: Congo Nehri Hidroelektrik Potansiyeli', date: '2026-04-01', country: 'Kongo', lat: -4.2634, lng: 15.2422, description: 'Yeni santral inşaatı planları.', url: 'https://www.unwater.org/', emoji: '🇨🇬', color: '#e67e22' },
  { id: 25, region: 'africa', title: 'Fas: Afrika\'nin En Buyuk Tuzdan Aritma Tesisi', date: '2026-02-15', country: 'Fas', lat: 33.9716, lng: -6.8498, description: 'Kazablanka için su arzı güvenliği.', url: 'https://www.unwater.org/', emoji: '🇲🇦', color: '#e67e22' },
  { id: 26, region: 'africa', title: 'Botsvana-Namibya: Okavango Havzasi Koruma Plani', date: '2026-03-08', country: 'Botsvana', lat: -24.6282, lng: 25.9231, description: 'Sınıraşan su yönetimi işbirliği.', url: 'https://www.unwater.org/', emoji: '🇧🇼', color: '#e67e22' },
  { id: 27, region: 'africa', title: 'Cezavir: Sahra Alti Su Tasima Hatti', date: '2026-01-10', country: 'Cezavir', lat: 36.7538, lng: 3.0588, description: 'Güneydeki suyun kuzeye nakli.', url: 'https://www.unwater.org/', emoji: '🇩🇿', color: '#e67e22' },
  // === AVRUPA ===
  { id: 30, region: 'europe', title: 'Ispanya: Katalonya\'da Tarihi Kuraklik Onlemleri', date: '2026-05-15', country: 'Ispanya', lat: 41.3851, lng: 2.1734, description: 'Su kullanımına kısıtlamalar getirildi.', url: 'https://www.elpais.com/', emoji: '🇪🇸', color: '#27ae60' },
  { id: 31, region: 'europe', title: 'Hollanda: Deniz Seviyesi Artisi ve Yeni Bentler', date: '2026-06-10', country: 'Hollanda', lat: 52.3676, lng: 4.9041, description: 'Kıyı savunma projeleri hızlandırıldı.', url: 'https://www.dutchnews.nl/', emoji: '🇳🇱', color: '#27ae60' },
  { id: 32, region: 'europe', title: 'Italya: Po Ovasi Sulama Modernizasyonu', date: '2026-04-22', country: 'Italya', lat: 45.0703, lng: 7.6869, description: 'Tarımda akıllı su yönetimi.', url: 'https://www.ansa.it/', emoji: '🇮🇹', color: '#27ae60' },
  { id: 33, region: 'europe', title: 'Fransa: Rhone Nehri Su Kalitesi Raporu', date: '2026-03-18', country: 'Fransa', lat: 45.7640, lng: 4.8357, description: 'Endüstriyel atık kontrolü sıkılaşıyor.', url: 'https://www.lemonde.fr/', emoji: '🇫🇷', color: '#27ae60' },
  { id: 34, region: 'europe', title: 'Almanya: Tuna Nehri Tasinabilir Su Havzalari', date: '2026-05-02', country: 'Almanya', lat: 48.1351, lng: 11.5820, description: 'Sel riskine karşı mobil bariyerler.', url: 'https://www.dw.com/', emoji: '🇩🇪', color: '#27ae60' },
  { id: 35, region: 'europe', title: 'Yunanistan: Adalar Icin Tuzdan Aritma Seferberligi', date: '2026-07-01', country: 'Yunanistan', lat: 37.9838, lng: 23.7275, description: 'Ege adalarında su sıkıntısı çözülüyor.', url: 'https://www.kathimerini.gr/', emoji: '🇬🇷', color: '#27ae60' },
  { id: 36, region: 'europe', title: 'Macaristan: Tuna ve Tisza Arasi Kanal Projesi', date: '2026-02-25', country: 'Macaristan', lat: 47.4979, lng: 19.0402, description: 'Tarım arazileri için yeni su yolu.', url: 'https://www.unwater.org/', emoji: '🇭🇺', color: '#27ae60' },
  { id: 37, region: 'europe', title: 'Portekiz: Alentejo Bölgesinde Su Tasarrufu', date: '2026-04-10', country: 'Portekiz', lat: 38.5714, lng: -7.9135, description: 'Zeytinlikler için damla sulama teşviki.', url: 'https://www.publico.pt/', emoji: '🇵🇹', color: '#27ae60' }
];

async function getNews() {
  const news = await kv.get('water_news');
  return news || initialNews;
}

async function setNews(news) {
  await kv.set('water_news', news);
}

app.get('/api/news', async (req, res) => {
  const news = await getNews();
  res.json(news);
});

app.post('/api/news', async (req, res) => {
  const news = await getNews();
  const newItem = { id: Date.now(), date: new Date().toISOString().split('T')[0], region: req.body.region || 'all', ...req.body };
  news.unshift(newItem);
  await setNews(news);
  res.status(201).json(newItem);
});

app.get('/api/cron-weekly', async (req, res) => {
  const news = await getNews();
  const regions = ['central-asia', 'arab', 'africa', 'europe'];
  const randReg = regions[Math.floor(Math.random() * regions.length)];
  const newWeekly = {
    id: Date.now(),
    region: randReg,
    title: 'Haftalik Guncelleme: Bolgesel Su Yonetimi Gelismesi',
    date: new Date().toISOString().split('T')[0],
    country: 'Global',
    lat: 40 + (Math.random() * 20 - 10),
    lng: 15 + (Math.random() * 40 - 20),
    description: 'Otomatik haber guncellemesi.',
    url: 'https://www.unwater.org/',
    emoji: '💧',
    color: '#64748b'
  };
  news.unshift(newWeekly);
  await setNews(news);
  res.json({ status: 'success' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
