export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Ensure body is parsed
    const { topic, subject, grade, curriculum, duration, teachingStyle } =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    if (!process.env.DEEPAI_API_KEY) {
      return res.status(500).json({ error: "DEEPAI_API_KEY not set" });
    }

    const prompt = `Create a detailed ${duration} lesson plan for grade ${grade} on the topic "${topic}" under ${curriculum} curriculum in ${subject}. Teaching style: ${teachingStyle}.`;

    const response = await fetch("https://api.deepai.org/api/text-generator", {
      method: "POST",
      headers: {
        "Api-Key": process.env.DEEPAI_API_KEY,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ text: prompt }),
    });

    const contentType = response.headers.get("content-type");
    let data;

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      console.error("❌ DeepAI raw response (non-JSON):", text);
      return res.status(500).json({
        error: "DeepAI did not return JSON",
        details: text.slice(0, 300),
      });
    }

    if (!response.ok) {
      return res.status(response.status).json({ error: data });
    }

    if (!data.output) {
      return res.status(500).json({ error: "No output from DeepAI", details: data });
    }

    res.status(200).json({ plan: data.output });
  } catch (err) {
    console.error("❌ DeepAI error:", err);
    res.status(500).json({ error: "Failed to generate lesson plan." });
  }
}
