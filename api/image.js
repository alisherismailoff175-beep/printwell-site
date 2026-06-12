export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { prompt } = req.body;
    const response = await fetch('https://external.api.recraft.ai/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RECRAFT_API_KEY}`
      },
      body: JSON.stringify({
        prompt: prompt.substring(0, 500),
        model: 'recraftv3',
        style: 'vector_illustration',
        n: 1
      })
    });
    const data = await response.json();
    const imageUrl = data?.data?.[0]?.url || null;
    return res.status(200).json({ imageUrl });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
