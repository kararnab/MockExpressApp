// ------------------
// Intent Definitions
// ------------------

const INTENTS = {
    SALUTATION: 'salutation',
    HELP: 'help',
    BOT_IDENTITY: 'bot_identity',
    END_CHAT: 'end_chat',
    UNKNOWN: 'unknown',
};


// ------------------
// Intent Patterns
// ------------------

const INTENT_PATTERNS = {
    [INTENTS.SALUTATION]: [
        { phrase: 'hi', score: 1.0 },
        { phrase: 'hello', score: 1.0 },
        { phrase: 'hey', score: 0.9 },
    ],

    [INTENTS.HELP]: [
        { phrase: 'help', score: 1.2 },
        { phrase: 'need help', score: 1.4 },
        { phrase: 'can you help', score: 1.4 },
        { phrase: 'assist', score: 1.1 },
        { phrase: 'support', score: 1.1 },
        { phrase: 'what can you do', score: 1.5 },
        { phrase: 'how can you help', score: 1.5 },
    ],

    [INTENTS.BOT_IDENTITY]: [
        { phrase: 'who are you', score: 1.2 },
        { phrase: 'what are you', score: 1.0 },
    ],

    [INTENTS.END_CHAT]: [
        { phrase: 'bye', score: 1.0 },
        { phrase: 'goodbye', score: 1.2 },
        { phrase: 'see you', score: 0.9 },
    ],
};

// ------------------
// Responses
// ------------------

const RESPONSES = {
    [INTENTS.SALUTATION]: [
        'Hello! How may I help you today?',
        'Hi there! What can I do for you?',
        'Hey! How can I assist you?',
    ],

    [INTENTS.HELP]: [
        'Sure! You can ask me who I am, or say hello, or just tell me what you need help with.',
        'I can help with basic questions about this system. Try asking “Who are you?”',
        'I’m here to assist. Tell me what you need help with.',
    ],

    [INTENTS.BOT_IDENTITY]: [
        'I am your RuleEngineBot. Ask me anything.',
        'I am RuleEngineBot, here to help you.',
    ],

    [INTENTS.END_CHAT]: [
        'Goodbye! Have a great day 👋',
        'See you later!',
    ],

    [INTENTS.UNKNOWN]: [
        "I don't understand. Please rephrase.",
        "Sorry, I didn’t quite get that.",
    ],
};

// ------------------
// Session Memory (per WS connection / process)
// ------------------

let lastIntent = null;
let lastUserMessage = null;
let repetitionCount = 0;
let seed = 1;

// ------------------
// Helpers
// ------------------

// ------------------
// Fuzzy Matching (Levenshtein Distance)
// ------------------

function levenshtein(a, b) {
    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

function normalize(text) {
    return text
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .replace(/\br\b/g, 'are')
        .replace(/\bu\b/g, 'you')
        .trim();
}

// Deterministic seeded random
function seededRandom() {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

// ------------------
// Intent Detection
// ------------------

function detectIntent(message) {
    const input = normalize(message);

    let bestIntent = INTENTS.UNKNOWN;
    let bestScore = 0;

    // ------------------
    // 1️⃣ Phrase Matching
    // ------------------
    for (const intent in INTENT_PATTERNS) {
        for (const { phrase, score } of INTENT_PATTERNS[intent]) {
            const normalizedPhrase = normalize(phrase);

            // Exact match (strongest)
            if (input === normalizedPhrase) {
                const exactScore = score + 0.6;
                if (exactScore > bestScore) {
                    bestScore = exactScore;
                    bestIntent = intent;
                }
                continue;
            }

            // Partial match (medium)
            if (input.includes(normalizedPhrase)) {
                if (score > bestScore) {
                    bestScore = score;
                    bestIntent = intent;
                }
                continue;
            }

            // Fuzzy match (typos)
            const distance = levenshtein(input, normalizedPhrase);
            const maxAllowed = Math.max(
                2,
                Math.floor(normalizedPhrase.length * 0.25)
            );

            if (distance <= maxAllowed) {
                const fuzzyScore = score - distance * 0.15;
                if (fuzzyScore > bestScore) {
                    bestScore = fuzzyScore;
                    bestIntent = intent;
                }
            }
        }
    }

    // ------------------
    // 2️⃣ Intent Flow Boosts (contextual)
    // ------------------
    // Apply only if we already found something meaningful
    if (bestScore > 0) {
        if (lastIntent === INTENTS.SALUTATION && bestIntent === INTENTS.HELP) {
            bestScore += 0.3;
        }

        if (lastIntent === INTENTS.HELP && bestIntent === INTENTS.BOT_IDENTITY) {
            bestScore += 0.2;
        }

        if (lastIntent === INTENTS.SALUTATION && bestIntent === INTENTS.BOT_IDENTITY) {
            bestScore += 0.2;
        }
    }

    // ------------------
    // 3️⃣ Session Continuity Boost
    // ------------------
    if (lastIntent === bestIntent && bestIntent !== INTENTS.UNKNOWN) {
        bestScore += 0.2;
    }

    // ------------------
    // 4️⃣ Clamp & Return
    // ------------------
    return {
        intent: bestIntent,
        confidence: Math.max(0, Math.min(bestScore, 2.0)),
    };
}

// ------------------
// Response Selection
// ------------------

function pickResponse(intent) {
    const options = RESPONSES[intent] || RESPONSES[INTENTS.UNKNOWN];
    const index = Math.floor(seededRandom() * options.length);
    return options[index];
}

// ------------------
// Confidence-based phrasing
// ------------------

function applyConfidenceTone(response, confidence) {
    if (confidence >= 1.4) return response;
    if (confidence >= 0.9) return `I think I can help. ${response}`;
    return `I might be mistaken, but ${response}`;
}

// ------------------
// Easter Eggs (deterministic)
// ------------------

function maybeEasterEgg(intent) {
    const roll = seededRandom();

    if (intent === INTENTS.SALUTATION && roll < 0.05) {
        return '👀 Hello there, human.';
    }

    if (intent === INTENTS.BOT_IDENTITY && roll < 0.05) {
        return 'I am… inevitable. Just kidding 😄 I’m RuleEngineBot.';
    }

    return null;
}

// ------------------
// Public API (UNCHANGED signature)
// ------------------

function ruleEngineBot(message, confidenceThreshold = 0.7) {
    const input = normalize(message);

    // ---- Repetition Awareness ----
    if (input === lastUserMessage) {
        repetitionCount++;
    } else {
        repetitionCount = 0;
    }
    lastUserMessage = input;

    if (repetitionCount >= 2) {
        return {
            intent: lastIntent || INTENTS.UNKNOWN,
            confidence: 1.0,
            response: '😄 We already covered that — how else can I help?',
        };
    }

    const { intent, confidence } = detectIntent(message);

    if (confidence < confidenceThreshold) {
        lastIntent = INTENTS.UNKNOWN;
        return {
            intent: INTENTS.UNKNOWN,
            confidence,
            response: pickResponse(INTENTS.UNKNOWN),
        };
    }

    lastIntent = intent;

    // Easter egg check
    const easterEgg = maybeEasterEgg(intent);
    if (easterEgg) {
        return {
            intent,
            confidence,
            response: easterEgg,
        };
    }

    const baseResponse = pickResponse(intent);
    const finalResponse = applyConfidenceTone(baseResponse, confidence);

    return {
        intent,
        confidence,
        response: finalResponse,
    };
}

module.exports = {
    ruleEngineBot,
};
