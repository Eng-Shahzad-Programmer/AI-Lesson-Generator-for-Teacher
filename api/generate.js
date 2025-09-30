// api/generate.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const body = req.body || {};
    const { topic, subject, grade, curriculum, duration, style } = body;
    if (!topic || !subject || !grade || !duration) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const API_KEY = process.env.DEEPAI_API_KEY;
    if (!API_KEY) {
      return res.status(500).json({ error: 'DEEPAI_API_KEY not set' });
    }
    const prompt = `Create a detailed, teacher-friendly lesson plan.
Topic: ${topic}
Subject: ${subject}
Grade: ${grade}
Curriculum: ${curriculum || 'General'}
Duration: ${duration}
Teaching style: ${style || 'Balanced'}`;
    const url = 'https://api.deepai.org/api/text-generator';
    const params = new URLSearchParams();
    params.append('text', prompt);
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Api-Key': API_KEY, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });
    if (!response.ok) {
      const txt = await response.text();
      return res.status(500).json({ error: `DeepAI response ${response.status}`, details: txt });
    }
    const data = await response.json();
    let text = data.output || data.result || data.text;
    if (!text) return res.status(500).json({ error: 'Empty result', raw: data });
    return res.status(200).json({ lesson: text });
  } catch (err) {
    return res.status(500).json({ error: 'Unexpected server error' });
  }
}