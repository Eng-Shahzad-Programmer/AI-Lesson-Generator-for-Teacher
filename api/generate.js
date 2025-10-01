// api/generate.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { topic, subject, grade, curriculum, duration, teachingStyle } = req.body;

    if (!process.env.DEEPAI_API_KEY) {
      return res.status(500).json({ error: "DEEPAI_API_KEY not set in environment variables" });
    }

    // Build prompt
    const prompt = `
    Create a structured lesson plan with the following details:
    - Topic: ${topic}
    - Subject: ${subject}
    - Grade: ${grade}
    - Curriculum: ${curriculum}
    - Duration: ${duration}
    - Teaching Style: ${teachingStyle}

    Please generate a clear and useful lesson plan for teachers.
    `;

    // Call DeepAI API
    const response = await fetch("https://api.deepai.org/api/text-generator", {
      method: "POST",
      headers: {
        "Api-Key": process.env.DEEPAI_API_KEY,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ text: prompt }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ DeepAI error response:", data);
      return res.status(response.status).json({ error: "Failed to generate lesson plan", details: data });
    }

    if (!data.output) {
      return res.status(500).json({ error: "No output received from DeepAI", details: data });
    }

    // Send lesson plan back
    res.status(200).json({ plan: data.output });

  } catch (error) {
    console.error("❌ Server error:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
}
