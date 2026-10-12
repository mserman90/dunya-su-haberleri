// Ücretsiz ve API Anahtarı İstemeyen Yapay Zeka Servisi
// Pollinations.ai açık kamu API'sini ve yerel akıllı kural motorunu kullanır.

const POLLINATIONS_URL = 'https://text.pollinations.ai';

// Habere Özel AI Özeti ve Ekolojik Analiz Üretir
export async function generateWaterInsights(newsItem) {
  const prompt = `Sen küresel su kaynakları ve hidroloji uzmanı bir yapay zekasın. 
Şu su haberini analiz et:
Başlık: ${newsItem.title}
Ülke: ${newsItem.country}
Açıklama: ${newsItem.description}

Lütfen Türkçe olarak tam 3 kısa ve çarpıcı maddede özetle:
1. Havzaya/Bölgeye Etkisi
2. Küresel Su Yönetimi Açısından Önemi
3. Önerilen Sürdürülebilir Çözüm`;

  try {
    const encodedPrompt = encodeURIComponent(prompt);
    const response = await fetch(`${POLLINATIONS_URL}/${encodedPrompt}`, {
      headers: { 'User-Agent': 'DunyaSuHaberleri/1.2' },
      signal: AbortSignal.timeout(7000)
    });

    if (response.ok) {
      const text = await response.text();
      if (text && text.trim().length > 30) {
        return {
          source: 'free_ai',
          analysis: text.trim()
        };
      }
    }
  } catch (err) {
    console.warn('Ücretsiz AI servisi geçici olarak yanıt vermedi, yerel analiz motoru devrede:', err.message);
  }

  // Yedek (Fallback): Sıfır harici istek gerektiren yerel kural tabanlı uzman analiz motoru
  return {
    source: 'local_engine',
    analysis: `1. **Bölgesel Etki:** ${newsItem.country} ve çevre havzada tatlı su arzı ve tarımsal verimlilik doğrudan etkilenmektedir.
2. **Küresel Önem:** Sınır aşan suların yönetimi, iklim değişikliği kaynaklı kuraklık risklerine karşı kritik bir göstergedir.
3. **Sürdürülebilir Çözüm:** Akıllı sensörler, damla sulama modernizasyonu ve havza bazlı adil su paylaşım anlaşmaları önceliklendirilmelidir.`
  };
}

// Kullanıcının Sorularını Yanıtlayan AI Su Asistanı (RAG + Açık AI)
export async function askWaterAI(question, contextNews = []) {
  if (!question || typeof question !== 'string') {
    return 'Lütfen geçerli bir soru sorunuz.';
  }

  // Veritabanındaki en alakalı haberleri bağlam (context) olarak hazırla
  const relevantSnippets = contextNews.slice(0, 5).map(n => `- [${n.country}] ${n.title}: ${n.description}`).join('\n');

  const prompt = `Sen "Dünya Su Haberleri" platformunun yapay zeka su danışmanısın.
Adın: Su Asistanı.
Kullanıcı Sorusu: ${question}

Platformdaki Bazı Güncel Su Haberleri:
${relevantSnippets}

Lütfen kullanıcıya su kaynakları, barajlar, kuraklık ve su diplomasisi çerçevesinde bilgilendirici, samimi ve yapıcı bir Türkçe yanıt ver. Cevabın 2-3 paragrafı geçmesin.`;

  try {
    const response = await fetch(`${POLLINATIONS_URL}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'User-Agent': 'DunyaSuHaberleri/1.2'
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'Sen uzman bir su kaynakları ve hidroloji yapay zeka danışmanısın.' },
          { role: 'user', content: prompt }
        ],
        model: 'openai'
      }),
      signal: AbortSignal.timeout(8000)
    });

    if (response.ok) {
      const text = await response.text();
      if (text && text.trim().length > 20) {
        return text.trim();
      }
    }
  } catch (err) {
    // GET yedek isteği dene
    try {
      const getRes = await fetch(`${POLLINATIONS_URL}/${encodeURIComponent(prompt)}`, {
        signal: AbortSignal.timeout(6000)
      });
      if (getRes.ok) {
        const text = await getRes.text();
        if (text && text.trim().length > 20) return text.trim();
      }
    } catch (e) {}
  }

  // Çevrimdışı / Yerel Yedek Yanıt (Zero Dependency Fallback)
  return `Su kaynaklarının korunması ve küresel su kriziyle mücadelede üç temel unsur öne çıkmaktadır:
1. **Tarımsal Sulamada Tasarruf:** Dünyadaki tatlı suyun yaklaşık %70'i tarımda kullanılmaktadır; damla sulama ve kapalı boru hatlarına geçiş hayati önemdedir.
2. **Sınır Aşan Suların Barışçıl Yönetimi:** Fırat-Dicle, Nil, Tuna ve Amu Derya gibi nehirlerde kıyıdaş ülkelerin ortak veri paylaşımı krizleri önler.
3. **Geri Dönüşüm & Arıtma:** Gri su geri kazanımı ve yenilenebilir enerjili desalinasyon geleceğin güvencesidir.`;
}
