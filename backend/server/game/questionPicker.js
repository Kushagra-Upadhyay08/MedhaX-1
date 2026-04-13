/**
 * Question Picker for CodeDuel
 * Tries Gemini API first for ascending difficulty, falls back to local database.
 * Gemini questions are stored ONLY in memory — no DB inserts needed.
 */

const db = require('../db');

/**
 * Validates a single question object from Gemini
 */
function isValidQuestion(q) {
  if (!q) return false;
  
  // Basic existence and type checks
  const hasText = q.questionText && typeof q.questionText === 'string' && q.questionText.trim().length > 5;
  const hasA = q.optionA != null && q.optionA.toString().trim().length > 0;
  const hasB = q.optionB != null && q.optionB.toString().trim().length > 0;
  const hasC = q.optionC != null && q.optionC.toString().trim().length > 0;
  const hasD = q.optionD != null && q.optionD.toString().trim().length > 0;
  
  if (!(hasText && hasA && hasB && hasC && hasD)) return false;

  // Ensure options are not just the letters "A", "B", "C", "D" if they match exactly
  const opts = [
    q.optionA.toString().trim(),
    q.optionB.toString().trim(),
    q.optionC.toString().trim(),
    q.optionD.toString().trim()
  ];
  
  // Reject if any option is empty or just a single character that isn't descriptive enough
  // (unless it's a very specific short answer common in coding, like '0', '1', etc.)
  if (opts.some(o => o.length === 0)) return false;

  // Check for duplicate options (which models sometimes do when they fail)
  const uniqueOpts = new Set(opts);
  if (uniqueOpts.size < 4) return false;

  const hasCorrect = ['A', 'B', 'C', 'D'].includes(q.correctAnswer);
  
  return hasCorrect;
}

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

  if (!Array.isArray(parsed)) {
    throw new Error('Gemini did not return an array of questions');
  }

  // Filter valid questions
  const validQuestions = parsed.filter(isValidQuestion);
  const validCount = validQuestions.length;

  if (validCount < count) {
    console.warn(`[Gemini] Only ${validCount}/${count} questions were valid. Filling gap with local DB questions.`);
    const missing = count - validCount;
    // We'll fill the gap later in pickQuestions or right here?
    // Let's fill it here for consistency.
    const localFallback = pickLocalQuestions(category, missing);
    
    // Convert local fallback to Gemini-like structure (though it's already close)
    const filler = localFallback.map((q, i) => ({
      questionText: q.question_text,
      optionA: q.option_a,
      optionB: q.option_b,
      optionC: q.option_c,
      optionD: q.option_d,
      correctAnswer: q.correct_answer
    }));
    
    validQuestions.push(...filler);
  }

  console.log(`[Gemini] Successfully finalized ${validQuestions.length} ${category} questions!`);

  // Map to internal schema and return — stored in-memory only, no DB insert needed
  return validQuestions.slice(0, count).map((q, i) => ({
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

  // EMERGENCY FALLBACK: If the DB is completely empty (e.g. fresh Render disk)
  // and Gemini failed, we MUST return something so the game doesn't break.
  if (questions.length === 0) {
    console.warn('⚠️ [EMERGENCY FALLBACK] Local DB is empty! Generating failsafe questions...');
    
    // Auto-trigger the seed process in the background for next time
    const { exec } = require('child_process');
    const path = require('path');
    exec(`node ${path.join(__dirname, '..', 'seed.js')}`, (err) => {
      if (err) console.error('Auto-seed failed:', err);
      else console.log('✅ Auto-seed completed successfully in the background.');
    });

    // Provide emergency questions immediately
    for (let i = 0; i < count; i++) {
      questions.push({
        id: `emergency_${Date.now()}_${i}`,
        question_text: `What is the core concept of ${category.toUpperCase()} (Failsafe Question ${i+1})?`,
        option_a: 'Variables',
        option_b: 'Functions',
        option_c: 'Loops',
        option_d: 'All of the above',
        correct_answer: 'D',
        category: category.toLowerCase(),
      });
    }
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
  const defaults = ['cpp', 'python', 'javascript', 'java', 'dsa', 'dbms'];
  try {
    const fromDb = db.prepare('SELECT DISTINCT category FROM questions WHERE category IS NOT NULL AND category != "" ORDER BY category')
      .all()
      .map(r => r.category);
    
    // Return combined unique list
    const combined = [...new Set([...fromDb, ...defaults])];
    return combined.sort();
  } catch (err) {
    console.error('[getCategories] Error:', err.message);
    return defaults;
  }
}

module.exports = { pickQuestions, getCategories };
