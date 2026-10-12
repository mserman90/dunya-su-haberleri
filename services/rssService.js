// Küresel Su ve Çevre RSS Besleme Servisi
// UN-Water, Google News ve küresel çevre kaynaklarını tarar ve formatlar

const RSS_FEEDS = [
  {
    name: 'Google News - Su Krizleri',
    url: 'https://news.google.com/rss/search?q=water+crisis+OR+drought+OR+dam+reservoir&hl=en-US&gl=US&ceid=US:en',
    defaultRegion: 'all'
  },
  {
    name: 'Google News - Türkiye Su ve Barajlar',
    url: 'https://news.google.com/rss/search?q=baraj+doluluk+OR+kuraklik+OR+su+yonetimi&hl=tr&gl=TR&ceid=TR:tr',
    defaultRegion: 'arab' // Yakın Doğu
  }
];

// Ülke ve Koordinat Sözlüğü (Geocoding Eşleştirme)
const COUNTRY_COORDINATES = {
  'türkiye': { lat: 39.9334, lng: 32.8597, country: 'Türkiye', region: 'arab', emoji: '🇹🇷', color: '#e74c3c' },
  'turkey': { lat: 39.9334, lng: 32.8597, country: 'Türkiye', region: 'arab', emoji: '🇹🇷', color: '#e74c3c' },
  'iran': { lat: 32.4279, lng: 53.6880, country: 'İran', region: 'arab', emoji: '🇮🇷', color: '#e74c3c' },
  'iraq': { lat: 33.2232, lng: 43.6793, country: 'Irak', region: 'arab', emoji: '🇮🇶', color: '#e74c3c' },
  'egypt': { lat: 26.8206, lng: 30.8025, country: 'Mısır', region: 'arab', emoji: '🇪🇬', color: '#e74c3c' },
  'ethiopia': { lat: 9.1450, lng: 40.4897, country: 'Etiyopya', region: 'africa', emoji: '🇪🇹', color: '#e67e22' },
  'kenya': { lat: -0.0236, lng: 37.9062, country: 'Kenya', region: 'africa', emoji: '🇰🇪', color: '#e67e22' },
  'spain': { lat: 40.4637, lng: -3.7492, country: 'İspanya', region: 'europe', emoji: '🇪🇸', color: '#27ae60' },
  'italy': { lat: 41.8719, lng: 12.5674, country: 'İtalya', region: 'europe', emoji: '🇮🇹', color: '#27ae60' },
  'germany': { lat: 51.1657, lng: 10.4515, country: 'Almanya', region: 'europe', emoji: '🇩🇪', color: '#27ae60' },
  'france': { lat: 46.2276, lng: 2.2137, country: 'Fransa', region: 'europe', emoji: '🇫🇷', color: '#27ae60' },
  'india': { lat: 20.5937, lng: 78.9629, country: 'Hindistan', region: 'asia', emoji: '🇮🇳', color: '#9b59b6' },
  'china': { lat: 35.8617, lng: 104.1954, country: 'Çin', region: 'asia', emoji: '🇨🇳', color: '#9b59b6' },
  'brazil': { lat: -14.2350, lng: -51.9253, country: 'Brezilya', region: 'america', emoji: '🇧🇷', color: '#f1c40f' },
  'usa': { lat: 37.0902, lng: -95.7129, country: 'ABD', region: 'america', emoji: '🇺🇸', color: '#f1c40f' },
  'united states': { lat: 37.0902, lng: -95.7129, country: 'ABD', region: 'america', emoji: '🇺🇸', color: '#f1c40f' },
  'kazakhstan': { lat: 48.0196, lng: 66.9237, country: 'Kazakistan', region: 'central-asia', emoji: '🇰🇿', color: '#3498db' },
  'uzbekistan': { lat: 41.3775, lng: 64.5853, country: 'Özbekistan', region: 'central-asia', emoji: '🇺🇿', color: '#3498db' },
  'australia': { lat: -25.2744, lng: 133.7751, country: 'Avustralya', region: 'oceania', emoji: '🇦🇺', color: '#1abc9c' }
};

// Basit XML/RSS Ayrıştırıcı
function parseRssXml(xmlText) {
  const items = [];
  const itemMatches = xmlText.match(/<item>([\s\S]*?)<\/item>/gi) || [];

  for (const itemXml of itemMatches) {
    const titleMatch = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/i);
    const linkMatch = itemXml.match(/<link><!\[CDATA\[(.*?)\]\]><\/link>|<link>(.*?)<\/link>/i);
    const dateMatch = itemXml.match(/<pubDate>(.*?)<\/pubDate>/i);
    const descMatch = itemXml.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/i);

    const title = (titleMatch ? (titleMatch[1] || titleMatch[2]) : '').replace(/<[^>]+>/g, '').trim();
    const link = (linkMatch ? (linkMatch[1] || linkMatch[2]) : '').trim();
    const rawDate = dateMatch ? dateMatch[1] : '';
    const desc = (descMatch ? (descMatch[1] || descMatch[2]) : '').replace(/<[^>]+>/g, '').trim();

    if (title && link) {
      items.push({
        title,
        link,
        date: rawDate ? new Date(rawDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        description: desc.slice(0, 300)
      });
    }
  }

  return items;
}

// Metinden Ülke ve Kategori Çıkarma
function analyzeNewsText(title, description) {
  const fullText = (title + ' ' + description).toLowerCase();

  // Kategori Tespiti
  let category = 'general';
  if (fullText.includes('dam') || fullText.includes('baraj') || fullText.includes('reservoir') || fullText.includes('hydroelectric')) {
    category = 'dam';
  } else if (fullText.includes('drought') || fullText.includes('kuraklik') || fullText.includes('scarcity') || fullText.includes('arid')) {
    category = 'drought';
  } else if (fullText.includes('treaty') || fullText.includes('agreement') || fullText.includes('diplomacy') || fullText.includes('anlaşma') || fullText.includes('protokol')) {
    category = 'diplomacy';
  } else if (fullText.includes('desalination') || fullText.includes('arıtma') || fullText.includes('technology') || fullText.includes('smart water')) {
    category = 'tech';
  } else if (fullText.includes('pollution') || fullText.includes('river') || fullText.includes('lake') || fullText.includes('nehir') || fullText.includes('ekoloji')) {
    category = 'ecology';
  }

  // Ülke & Koordinat Tespiti
  for (const [key, geo] of Object.entries(COUNTRY_COORDINATES)) {
    if (fullText.includes(key)) {
      return {
        country: geo.country,
        lat: geo.lat + (Math.random() * 0.4 - 0.2), // Küçük varyasyonla pinlerin üst üste binmesini önle
        lng: geo.lng + (Math.random() * 0.4 - 0.2),
        region: geo.region,
        emoji: geo.emoji,
        color: geo.color,
        category
      };
    }
  }

  // Varsayılan Global Su Noktası
  return {
    country: 'Uluslararası',
    lat: 25.0 + (Math.random() * 10 - 5),
    lng: 45.0 + (Math.random() * 10 - 5),
    region: 'all',
    emoji: '💧',
    color: '#3b82f6',
    category
  };
}

// RSS Beslemelerini Çek ve Normalize Et
export async function fetchLiveWaterNews(limit = 10) {
  const liveNews = [];

  for (const feed of RSS_FEEDS) {
    try {
      const response = await fetch(feed.url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DWS-Aggregator/1.0)' },
        signal: AbortSignal.timeout(6000)
      });
      if (!response.ok) continue;

      const xml = await response.text();
      const parsedItems = parseRssXml(xml);

      for (const item of parsedItems.slice(0, 5)) {
        const analysis = analyzeNewsText(item.title, item.description);
        liveNews.push({
          id: Date.now() + Math.floor(Math.random() * 10000),
          title: item.title,
          description: item.description || 'Canlı RSS akışından derlenen su haberi.',
          country: analysis.country,
          lat: parseFloat(analysis.lat.toFixed(4)),
          lng: parseFloat(analysis.lng.toFixed(4)),
          region: analysis.region,
          category: analysis.category,
          date: item.date,
          url: item.link,
          emoji: analysis.emoji,
          color: analysis.color
        });
      }
    } catch (err) {
      console.warn(`RSS beslemesi okunamadı (${feed.name}):`, err.message);
    }
  }

  return liveNews.slice(0, limit);
}
