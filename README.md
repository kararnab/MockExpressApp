# 🎭 Fun Mock Server with Rule-Engine ChatBot

A lightweight Express-based mock server with file-based mock APIs and a surprisingly smart rule-engine chatbot.

Built for:
- local development
- frontend integration testing
- demos & PoCs
- having a little fun 😄


-[X] No databases.
-[X] No ML.
-[X] No external services.

Just **deterministic, explainable logic**.

## ✨ Features

### 🧪 Mock API Server
- Serve custom JSON responses from files
- Folder-based mocks (/mock/:folder/:file)
- Hot-editable mock data (no rebuilds)

### 🤖 Rule-Engine Chat Bot

- WebSocket-based chat (/chat)
- Intent detection (salutation, help, identity, goodbye, etc.)
- Confidence scoring
- Typo & misspelling tolerance
- Deterministic response variation
- Session memory (conversation awareness)
- Easter eggs 🥚

### 🧠 “Smart, not magical”

- Fully deterministic (QA-friendly)
- Explainable decisions
- No AI hallucinations
- Easy to extend with new intents

### 🧠 How the Bot Thinks

The bot uses classic intent-based logic, not AI.

#### Intent Detection

- Exact matches
- Partial phrase matches
- Fuzzy matching (handles typos)
- Confidence Scoring
- Phrase strength
- Context awareness
- Session continuity

#### Intent Flow Awareness
Some transitions make sense:
- SALUTATION → HELP
- HELP → BOT_IDENTITY

The bot boosts confidence when the conversation flows naturally.

---

## Usage

### Chat Bot Usage (WebSocket)

Connect to
```bash
ws://localhost:3000/chat
```
Example Conversation
```vbnet
Client: Hi
Bot: Hello! How may I help you today?

Client: can you help me?
Bot: Sure! You can ask me who I am, or tell me what you need help with.

Client: whu r u
Bot: I think I can help. I am RuleEngineBot, here to assist you.

Client: bye
Bot: See you later!
```

### Open Dashboard static page

```
curl --location --request GET 'http://localhost:8080/dashboard.html'
```