# GhostIQ

## Current State

The app has a full Motoko backend with:
- Principal-based user registration, analysis storage (saveAnalysis, getHistory, deleteAnalysis), and stats
- No AI/HTTP outcall logic in main.mo
- An existing `http-outcalls/outcall.mo` module with `httpPostRequest` helper ready to use
- No `getAIAdvice` function exists in the canister

The frontend has:
- A floating GhostAdvisorChat component that calls `actor.getAIAdvice(...)` on the backend
- If the backend call fails, it falls back to `generateLocalAdvice()` from `localAdvisor.ts`
- `useAdvisorChat.ts` sends the analysis context (score, behavioral inputs, sentimentResult, userMessage) to the backend
- Conversation memory is session-only (React state), not passed to backend yet
- The local advisor returns a rigid structured format (Situation Summary / Suggested Reply / etc.)

## Requested Changes (Diff)

### Add
- `getAIAdvice` public shared function in `main.mo` that:
  - Accepts: score, replyDelay, seenIgnoredFrequency, messageLengthReduction, initiationRatio, toneChange, socialMediaActivity, sentimentResult, userMessage, conversationHistory (array of {role, content} pairs)
  - Stores the OpenAI API key in a stable canister variable (admin-settable, never exposed)
  - Builds a JSON request body for OpenAI Chat Completions API (gpt-4o)
  - Uses a wellness-focused, non-manipulative system prompt (natural/conversational, no rigid sections)
  - Includes last 6-8 messages from conversationHistory as context window
  - Uses `http-outcalls/outcall.mo` httpPostRequest to call `https://api.openai.com/v1/chat/completions`
  - Parses the JSON response body to extract the assistant message content
  - Returns `{ success: bool; advice: Text; error: Text }`
  - Handles errors gracefully (returns success: false with error message)
  - Limits request body to stay within ICP outcall limits (~2000 tokens)
- `setOpenAIKey` admin-only function in `main.mo` to store the API key in a stable variable

### Modify
- `useAdvisorChat.ts`: pass the current conversation history (last 6-8 messages) when calling `getAIAdvice` on the backend
- `localAdvisor.ts`: update the fallback response style to be conversational (remove rigid section headers) to match the new AI style, so fallback and real responses feel consistent
- `useAdvisorChat.ts`: update the initial advice load to not show a "user message" bubble — just open the panel and let the AI greet/analyze naturally

### Remove
- Rigid "Situation Summary / Suggested Reply / Recommended Tone / What To Avoid / Next Action" format from both backend and local fallback

## Implementation Plan

1. **Backend**: Add `stable var openAIKey : Text = ""` and `setOpenAIKey` admin function to main.mo
2. **Backend**: Add `ChatMessage` type (role: Text, content: Text) and `AIAdviceRequest` type to main.mo
3. **Backend**: Add `getAIAdvice` shared function that:
   - Builds system prompt (wellness-focused, conversational, no rigid sections)
   - Builds behavioral context string from inputs
   - Takes last 6 messages from conversationHistory
   - Constructs JSON body (system + context + history window + user message)
   - Calls OpenAI via outcall.httpPostRequest
   - Parses response JSON with basic Text manipulation to extract `content` field
   - Returns result record
4. **Frontend**: Update `useAdvisorChat.ts` to track conversation history array and pass it with each `getAIAdvice` call
5. **Frontend**: Update `loadAnalysisAdvice` to not inject a visible "user" bubble — instead trigger AI with the context silently, showing the AI response directly
6. **Frontend**: Update `localAdvisor.ts` fallback to return natural conversational prose without structured headers
