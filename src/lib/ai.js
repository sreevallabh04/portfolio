/**
 * Small AI helper for the post editor: given a draft, suggest a title,
 * excerpt and tags. Deliberately narrow — it does metadata chores, it does not
 * write the post.
 *
 * SECURITY: Vite inlines every VITE_* value into the public bundle, so any key
 * referenced here is readable by anyone who opens devtools. That is the same
 * exposure the existing VITE_GROQ_API_KEY already has. Keep a hard spend cap on
 * whichever key you use, and treat the durable fix as moving this call behind a
 * serverless function that holds the key server-side.
 *
 * Never paste a key into source. Set it in the host's environment variables.
 */

const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export const isAiConfigured = Boolean(GROQ_KEY || GEMINI_KEY);

const PROMPT = (title, content) => `You are helping tag a personal blog post for an AI engineer's portfolio.

Return ONLY a JSON object, no prose, no code fences, with exactly these keys:
  "title"   - a short, specific title (reuse the given one if it is already good)
  "excerpt" - one or two plain sentences, max 200 characters, no marketing voice
  "tags"    - 2 to 4 lowercase topic tags as an array of strings

Existing title: ${title || '(none)'}

Post:
${content.slice(0, 6000)}`;

const extractJson = (text) => {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Model did not return JSON');
  return JSON.parse(match[0]);
};

const viaGroq = async (prompt) => {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      max_tokens: 400,
    }),
  });
  if (!res.ok) throw new Error(`Groq error ${res.status}`);
  const data = await res.json();
  return extractJson(data.choices?.[0]?.message?.content || '');
};

const viaGemini = async (prompt) => {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 400 },
      }),
    }
  );
  if (!res.ok) throw new Error(`Gemini error ${res.status}`);
  const data = await res.json();
  return extractJson(data.candidates?.[0]?.content?.parts?.[0]?.text || '');
};

export const suggestPostMeta = async ({ title, content }) => {
  if (!isAiConfigured) {
    throw new Error('No AI key configured (set VITE_GROQ_API_KEY or VITE_GEMINI_API_KEY).');
  }

  const prompt = PROMPT(title, content);
  const parsed = GROQ_KEY ? await viaGroq(prompt) : await viaGemini(prompt);

  return {
    title: typeof parsed.title === 'string' ? parsed.title.trim() : '',
    excerpt: typeof parsed.excerpt === 'string' ? parsed.excerpt.trim().slice(0, 240) : '',
    tags: Array.isArray(parsed.tags)
      ? parsed.tags.filter((t) => typeof t === 'string').map((t) => t.toLowerCase().trim()).slice(0, 4)
      : [],
  };
};
