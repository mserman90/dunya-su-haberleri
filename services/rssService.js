// Küresel Su Yönetimi Google News Dorking & RSS Servisi
// Gelişmiş arama dorkları (Boolean, tırnak içi tam eşleşme, zaman filtreleri) kullanarak
// su yönetimi, barajlar, kuraklık ve nehir havzası haberlerini otomatik toplar ve haritalandırır.

export const GOOGLE_DORK_FEEDS = [
  {
    name: 'Türkiye Su Yönetimi & Barajlar Dork',
    dork: '("su yönetimi" OR "baraj doluluk" OR "kuraklık krizi" OR "havza yönetimi" OR "yeraltı suyu") when:14d -futbol -magazin',
    url: 'https://news.google.com/rss/search?q=%28%22su+y%C3%B6netimi%22+OR+%22baraj+doluluk%22+OR+%22kurakl%C4%B1k+krizi%22+OR+%22havza+y%C3%B6netimi%22+OR+%22yeralt%C4%B1+suyu%22%29+when%3A14d+-futbol+-magazin&hl=tr&gl=TR&ceid=TR:tr',
    defaultRegion: 'arab'
  },
  {
    name: 'Küresel Su Yönetimi & Havzalar Dork',
    dork: '("water management" OR "river basin management" OR "water security" OR "transboundary water") when:14d',
    url: 'https://news.google.com/rss/search?q=%28%22water+management%22+OR+%22river+basin+management%22+OR+%22water+security%22+OR+%22transboundary+water%22%29+when%3A14d&hl=en-US&gl=US&ceid=US:en',
    defaultRegion: 'all'
  },
  {
    name: 'Barajlar & Rezervuarlar Dork',
    dork: '("dam reservoir" OR "dam construction" OR "megadam" OR "hydroelectric reservoir") when:14d',
    url: 'https://news.google.com/rss/search?q=%28%22dam+reservoir%22+OR+%22dam+construction%22+OR+%22megadam%22+OR+%22hydroelectric+reservoir%22%29+when%3A14d&hl=en-US&gl=US&ceid=US:en',
    defaultRegion: 'all'
  },
  {
    name: 'Kuraklık & Akifer Krizleri Dork',
    dork: '("drought crisis" OR "groundwater depletion" OR "aquifer decline" OR "water scarcity") when:14d',
    url: 'https://news.google.com/rss/search?q=%28%22drought+crisis%22+OR+%22groundwater+depletion%22+OR+%22aquifer+decline%22+OR+%22water+scarcity%22%29+when%3A14d&hl=en-US&gl=US&ceid=US:en',
    defaultRegion: 'all'
  },
  {
    name: 'Orta Asya & Aral Havzası Dork',
    dork: '("Aral Sea" OR "Amu Darya" OR "Syr Darya" OR "Central Asia water crisis") when:30d',
    url: 'https://news.google.com/rss/search?q=%28%22Aral+Sea%22+OR+%22Amu+Darya%22+OR+%22Syr+Darya%22+OR+%22Central+Asia+water+crisis%22%29+when%3A30d&hl=en-US&gl=US&ceid=US:en',
    defaultRegion: 'central-asia'
  },
  {
    name: 'Arıtma & Su Teknolojileri Dork',
    dork: '("desalination plant" OR "wastewater recycling" OR "smart water grid") when:14d',
    url: 'https://news.google.com/rss/search?q=%28%22desalination+plant%22+OR+%22wastewater+recycling%22+OR+%22smart+water+grid%22%29+when%3A14d&hl=en-US&gl=US&ceid=US:en',
    defaultRegion: 'all'
  }
];

// Genişletilmiş Coğrafi Konum ve Havza Eşleştirme Sözlüğü
export const BASIN_AND_COUNTRY_GEO = {
  // Türkiye ve Havzaları
  'istanbul': { lat: 41.0082, lng: 28.9784, country: 'Türkiye (İstanbul)', region: 'arab', emoji: '🇹🇷', color: '#e74c3c' },
  'ankara': { lat: 39.9334, lng: 32.8597, country: 'Türkiye (Ankara)', region: 'arab', emoji: '🇹🇷', color: '#e74c3c' },
  'izmir': { lat: 38.4192, lng: 27.1287, country: 'Türkiye (İzmir)', region: 'arab', emoji: '🇹🇷', color: '#e74c3c' },
  'konya': { lat: 37.8746, lng: 32.4932, country: 'Türkiye (Konya Havzası)', region: 'arab', emoji: '🇹🇷', color: '#e74c3c' },
  'fırat': { lat: 37.0662, lng: 37.3833, country: 'Türkiye/Irak (Fırat)', region: 'arab', emoji: '🌊', color: '#dc2626' },
  'dicle': { lat: 36.5000, lng: 41.0000, country: 'Türkiye/Irak (Dicle)', region: 'arab', emoji: '🌊', color: '#dc2626' },
  'türkiye': { lat: 39.0000, lng: 35.0000, country: 'Türkiye', region: 'arab', emoji: '🇹🇷', color: '#e74c3c' },
  'turkey': { lat: 39.0000, lng: 35.0000, country: 'Türkiye', region: 'arab', emoji: '🇹🇷', color: '#e74c3c' },

  // Orta Doğu & Nil
  'iraq': { lat: 33.3152, lng: 44.3661, country: 'Irak', region: 'arab', emoji: '🇮🇶', color: '#e74c3c' },
  'ırak': { lat: 33.3152, lng: 44.3661, country: 'Irak', region: 'arab', emoji: '🇮🇶', color: '#e74c3c' },
  'iran': { lat: 32.4279, lng: 53.6880, country: 'İran', region: 'arab', emoji: '🇮🇷', color: '#e74c3c' },
  'egypt': { lat: 26.8206, lng: 30.8025, country: 'Mısır', region: 'arab', emoji: '🇪🇬', color: '#e74c3c' },
  'mısır': { lat: 26.8206, lng: 30.8025, country: 'Mısır', region: 'arab', emoji: '🇪🇬', color: '#e74c3c' },
  'nile': { lat: 15.6000, lng: 32.5300, country: 'Nil Havzası', region: 'africa', emoji: '🌊', color: '#0284c7' },
  'nil': { lat: 15.6000, lng: 32.5300, country: 'Nil Havzası', region: 'africa', emoji: '🌊', color: '#0284c7' },
  'ethiopia': { lat: 9.1450, lng: 40.4897, country: 'Etiyopya', region: 'africa', emoji: '🇪🇹', color: '#e67e22' },
  'etiyopya': { lat: 9.1450, lng: 40.4897, country: 'Etiyopya', region: 'africa', emoji: '🇪🇹', color: '#e67e22' },
  'saudi': { lat: 24.7136, lng: 46.6753, country: 'Suudi Arabistan', region: 'arab', emoji: '🇸🇦', color: '#e74c3c' },
  'uae': { lat: 24.4539, lng: 54.3773, country: 'BAE', region: 'arab', emoji: '🇦🇪', color: '#e74c3c' },

  // Amerika ve Havzaları
  'colorado': { lat: 36.1699, lng: -115.1398, country: 'ABD (Colorado Havzası)', region: 'america', emoji: '🇺🇸', color: '#f1c40f' },
  'delaware': { lat: 40.0000, lng: -75.0000, country: 'ABD (Delaware Havzası)', region: 'america', emoji: '🇺🇸', color: '#f1c40f' },
  'cumberland': { lat: 36.1627, lng: -86.7816, country: 'ABD (Cumberland)', region: 'america', emoji: '🇺🇸', color: '#f1c40f' },
  'california': { lat: 36.7783, lng: -119.4179, country: 'ABD (Kaliforniya)', region: 'america', emoji: '🇺🇸', color: '#f1c40f' },
  'usa': { lat: 37.0902, lng: -95.7129, country: 'ABD', region: 'america', emoji: '🇺🇸', color: '#f1c40f' },
  'united states': { lat: 37.0902, lng: -95.7129, country: 'ABD', region: 'america', emoji: '🇺🇸', color: '#f1c40f' },
  'amazon': { lat: -3.4653, lng: -62.2159, country: 'Brezilya (Amazon Havzası)', region: 'america', emoji: '🇧🇷', color: '#f1c40f' },
  'brazil': { lat: -14.2350, lng: -51.9253, country: 'Brezilya', region: 'america', emoji: '🇧🇷', color: '#f1c40f' },
  'mexico': { lat: 23.6345, lng: -102.5528, country: 'Meksika', region: 'america', emoji: '🇲🇽', color: '#f1c40f' },

  // Avrupa ve Havzaları
  'spain': { lat: 40.4637, lng: -3.7492, country: 'İspanya', region: 'europe', emoji: '🇪🇸', color: '#27ae60' },
  'ispanya': { lat: 40.4637, lng: -3.7492, country: 'İspanya', region: 'europe', emoji: '🇪🇸', color: '#27ae60' },
  'catalonia': { lat: 41.3851, lng: 2.1734, country: 'İspanya (Katalonya)', region: 'europe', emoji: '🇪🇸', color: '#27ae60' },
  'italy': { lat: 41.8719, lng: 12.5674, country: 'İtalya', region: 'europe', emoji: '🇮🇹', color: '#27ae60' },
  'italya': { lat: 41.8719, lng: 12.5674, country: 'İtalya', region: 'europe', emoji: '🇮🇹', color: '#27ae60' },
  'danube': { lat: 45.2000, lng: 19.8000, country: 'Avrupa (Tuna Havzası)', region: 'europe', emoji: '🇪🇺', color: '#2563eb' },
  'tuna': { lat: 45.2000, lng: 19.8000, country: 'Avrupa (Tuna Havzası)', region: 'europe', emoji: '🇪🇺', color: '#2563eb' },
  'rhine': { lat: 50.0000, lng: 8.0000, country: 'Almanya/Hollanda (Ren)', region: 'europe', emoji: '🇩🇪', color: '#27ae60' },
  'france': { lat: 46.2276, lng: 2.2137, country: 'Fransa', region: 'europe', emoji: '🇫🇷', color: '#27ae60' },

  // Orta Asya
  'aral': { lat: 45.0000, lng: 60.0000, country: 'Kazakistan/Özbekistan (Aral)', region: 'central-asia', emoji: '🌊', color: '#3498db' },
  'kazakhstan': { lat: 48.0196, lng: 66.9237, country: 'Kazakistan', region: 'central-asia', emoji: '🇰🇿', color: '#3498db' },
  'kazakistan': { lat: 48.0196, lng: 66.9237, country: 'Kazakistan', region: 'central-asia', emoji: '🇰🇿', color: '#3498db' },
  'uzbekistan': { lat: 41.3775, lng: 64.5853, country: 'Özbekistan', region: 'central-asia', emoji: '🇺🇿', color: '#3498db' },
  'özbekistan': { lat: 41.3775, lng: 64.5853, country: 'Özbekistan', region: 'central-asia', emoji: '🇺🇿', color: '#3498db' },

  // Asya & Okyanusya
  'india': { lat: 20.5937, lng: 78.9629, country: 'Hindistan', region: 'asia', emoji: '🇮🇳', color: '#9b59b6' },
  'hindistan': { lat: 20.5937, lng: 78.9629, country: 'Hindistan', region: 'asia', emoji: '🇮🇳', color: '#9b59b6' },
  'ganges': { lat: 25.3176, lng: 82.9739, country: 'Hindistan (Ganj)', region: 'asia', emoji: '🇮🇳', color: '#9b59b6' },
  'china': { lat: 35.8617, lng: 104.1954, country: 'Çin', region: 'asia', emoji: '🇨🇳', color: '#9b59b6' },
  'çin': { lat: 35.8617, lng: 104.1954, country: 'Çin', region: 'asia', emoji: '🇨🇳', color: '#9b59b6' },
  'australia': { lat: -25.2744, lng: 133.7751, country: 'Avustralya', region: 'oceania', emoji: '🇦🇺', color: '#1abc9c' },
  'avustralya': { lat: -25.2744, lng: 133.7751, country: 'Avustralya', region: 'oceania', emoji: '🇦🇺', color: '#1abc9c' }
};

// RSS XML Ayrıştırıcı
function parseRssXml(xmlText) {
  const items = [];
  const itemMatches = xmlText.match(/<item>([\s\S]*?)<\/item>/gi) || [];

  for (const itemXml of itemMatches) {
    const titleMatch = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/i);
    const linkMatch = itemXml.match(/<link><!\[CDATA\[(.*?)\]\]><\/link>|<link>(.*?)<\/link>/i);
    const dateMatch = itemXml.match(/<pubDate>(.*?)<\/pubDate>/i);
    const descMatch = itemXml.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/i);

    let title = (titleMatch ? (titleMatch[1] || titleMatch[2]) : '').replace(/<[^>]+>/g, '').trim();
    const link = (linkMatch ? (linkMatch[1] || linkMatch[2]) : '').trim();
    const rawDate = dateMatch ? dateMatch[1] : '';
    let desc = (descMatch ? (descMatch[1] || descMatch[2]) : '').replace(/<[^>]+>/g, '').trim();

    if (title && link) {
      // Başlığı Google News kaynak eklerinden temizle (örn. "- Habertürk")
      const sourceMatch = title.split(' - ');
      let sourceName = '';
      if (sourceMatch.length > 1) {
        sourceName = sourceMatch.pop();
        title = sourceMatch.join(' - ');
      }

      items.push({
        title,
        link,
        sourceName,
        date: rawDate ? new Date(rawDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        description: desc.slice(0, 350)
      });
    }
  }

  return items;
}

// Haber Metninden Konu, Kategori ve Coğrafi Konum Analizi
function analyzeDorkNewsText(title, description, defaultRegion = 'all') {
  const fullText = (title + ' ' + description).toLowerCase();

  // Kategori Tespiti
  let category = 'general';
  if (fullText.includes('dam') || fullText.includes('baraj') || fullText.includes('reservoir') || fullText.includes('rezervuar')) {
    category = 'dam';
  } else if (fullText.includes('drought') || fullText.includes('kuraklik') || fullText.includes('kuraklık') || fullText.includes('scarcity') || fullText.includes('kıtlık')) {
    category = 'drought';
  } else if (fullText.includes('treaty') || fullText.includes('agreement') || fullText.includes('diplomacy') || fullText.includes('anlaşma') || fullText.includes('protokol') || fullText.includes('tahsis')) {
    category = 'diplomacy';
  } else if (fullText.includes('desalination') || fullText.includes('arıtma') || fullText.includes('technology') || fullText.includes('smart water') || fullText.includes('geri kazanım')) {
    category = 'tech';
  } else if (fullText.includes('river') || fullText.includes('lake') || fullText.includes('nehir') || fullText.includes('göl') || fullText.includes('havza') || fullText.includes('ekoloji')) {
    category = 'ecology';
  }

  // Coğrafi Konum ve Havza Eşleştirme
  for (const [key, geo] of Object.entries(BASIN_AND_COUNTRY_GEO)) {
    if (fullText.includes(key)) {
      return {
        country: geo.country,
        lat: parseFloat((geo.lat + (Math.random() * 0.3 - 0.15)).toFixed(4)),
        lng: parseFloat((geo.lng + (Math.random() * 0.3 - 0.15)).toFixed(4)),
        region: geo.region,
        emoji: geo.emoji,
        color: geo.color,
        category
      };
    }
  }

  // Varsayılan Havza / Uluslararası Su Noktası
  return {
    country: defaultRegion === 'arab' ? 'Türkiye / Havzalar' : 'Uluslararası Su Havzası',
    lat: defaultRegion === 'arab' ? 39.0 : 28.0 + (Math.random() * 10 - 5),
    lng: defaultRegion === 'arab' ? 35.0 : 45.0 + (Math.random() * 10 - 5),
    region: defaultRegion,
    emoji: '💧',
    color: '#3b82f6',
    category
  };
}

// Google News Dorking ile Canlı Su Haberlerini Çek ve Normalize Et
export async function fetchLiveWaterNews(limit = 12) {
  const allFoundItems = [];

  for (const feed of GOOGLE_DORK_FEEDS) {
    try {
      const response = await fetch(feed.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        },
        signal: AbortSignal.timeout(6500)
      });

      if (!response.ok) continue;

      const xml = await response.text();
      const parsed = parseRssXml(xml);

      // Her dork beslemesinden en güncel 2-3 haberi al
      for (const item of parsed.slice(0, 3)) {
        const geoAnalysis = analyzeDorkNewsText(item.title, item.description, feed.defaultRegion);
        allFoundItems.push({
          id: Date.now() + Math.floor(Math.random() * 100000),
          title: item.title,
          description: item.description || `${geoAnalysis.country} su yönetimi ve havza gelişmeleri.`,
          country: geoAnalysis.country,
          lat: geoAnalysis.lat,
          lng: geoAnalysis.lng,
          region: geoAnalysis.region,
          category: geoAnalysis.category,
          date: item.date,
          url: item.link,
          sourceName: item.sourceName || 'Google News',
          emoji: geoAnalysis.emoji,
          color: geoAnalysis.color
        });
      }
    } catch (err) {
      console.warn(`Dork akışı okunamadı (${feed.name}):`, err.message);
    }
  }

  return allFoundItems.slice(0, limit);
}
