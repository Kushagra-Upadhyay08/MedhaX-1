/**
 * Question Picker for CodeDuel
 * Tries Gemini API first for ascending difficulty, falls back to local database.
 * Gemini questions are stored ONLY in memory — no DB inserts needed.
 */

const db = require('../db');

/**
 * Fetch questions dynamically from Gemini REST API
 */
async function generateQuestionsFromGemini(category, count) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('No API key configured for Gemini');

  const prompt = `Generate exactly ${count} coding quiz questions strictly about the programming language "${category}".
IMPORTANT RULES:
1. Make the questions ascend in difficulty. First few should be very easy (basic syntax), middle ones medium (logic/patterns), and last few hard/advanced (complex algorithms/edge cases).
2. The questions MUST be strictly related to ${category} ONLY. Do not include questions from any other programming language.
3. Return ONLY a pure JSON array of objects with no markdown, no code fences, and no extra text.
Each object must follow this exact schema:
{
  "questionText": "The question here",
  "optionA": "First option",
  "optionB": "Second option",
  "optionC": "Third option",
  "optionD": "Fourth option",
  "correctAnswer": "A"
}
The correctAnswer field must be EXACTLY one of: "A", "B", "C", or "D".`;

  console.log(`[Gemini] Requesting ${count} ${category} questions...`);
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API HTTP ${response.status}: ${errText}`);
  }

  const data = await response.json();
  if (!data.candidates || data.candidates.length === 0) {
    throw new Error('Gemini API returned no candidates');
  }

  const text = data.candidates[0].content.parts[0].text;

  // Strip markdown code blocks just in case model ignores the mime type
  const jsonStr = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(jsonStr);

  if (!Array.isArray(parsed) || parsed.length < count) {
    throw new Error(`Gemini returned only ${parsed.length} questions, expected ${count}`);
  }

  console.log(`[Gemini] Successfully generated ${parsed.length} ${category} questions!`);

  // Map to internal schema and return — stored in-memory only, no DB insert needed
  return parsed.slice(0, count).map((q, i) => ({
    id: `gemini_${Date.now()}_${i}`,
    question_text: q.questionText,
    option_a: q.optionA,
    option_b: q.optionB,
    option_c: q.optionC,
    option_d: q.optionD,
    correct_answer: q.correctAnswer,
    category: category.toLowerCase(),
    questionOrder: i + 1,
    isGemini: true, // flag so we skip DB match_questions insert
  }));
}

/**
 * Pick random questions from local SQLite DB (fallback)
 */
function pickLocalQuestions(category, count) {
  const questions = db.prepare(
    'SELECT * FROM questions WHERE category = ? ORDER BY RANDOM() LIMIT ?'
  ).all(category.toLowerCase(), count);

  if (questions.length < count) {
    const remaining = count - questions.length;
    const existingIds = questions.map(q => q.id);
    const placeholders = existingIds.length > 0 ? existingIds.map(() => '?').join(',') : '0';
    const extras = db.prepare(
      `SELECT * FROM questions WHERE id NOT IN (${placeholders}) ORDER BY RANDOM() LIMIT ?`
    ).all(...existingIds, remaining);
    questions.push(...extras);
  }

  return questions.map((q, i) => ({ ...q, questionOrder: i + 1, isGemini: false }));
}

/**
 * Main: Try Gemini, fall back to local
 */
async function pickQuestions(category, count) {
  try {
    return await generateQuestionsFromGemini(category, count);
  } catch (err) {
    console.error('[QuestionPicker] Gemini failed, using local DB:', err.message);
    return pickLocalQuestions(category, count);
  }
}

/**
 * Get available categories from local DB
 */
function getCategories() {
  return db.prepare('SELECT DISTINCT category FROM questions ORDER BY category').all().map(r => r.category);
}

module.exports = { pickQuestions, getCategories };
