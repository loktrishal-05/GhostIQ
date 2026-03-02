export interface GhostingInputs {
  replyDelay: number; // 0–100
  seenIgnoredFrequency: number; // 0–100
  messageLengthReduction: number; // 0–100
  initiationRatio: number; // 0–100
  toneChange: number; // 0–100
  socialMediaActivity: number; // 0–100 (higher = less risk, inverted)
  recentMessage: string;
}

export interface GhostingResult {
  score: number;
  sentimentResult: string;
  riskCategory: "Low" | "Medium" | "High";
}

const POSITIVE_WORDS = [
  "love",
  "great",
  "amazing",
  "happy",
  "excited",
  "yes",
  "sure",
  "definitely",
  "wonderful",
  "perfect",
  "miss",
  "soon",
  "good",
  "nice",
  "thanks",
  "appreciate",
  "glad",
  "looking forward",
  "can't wait",
  "absolutely",
  "awesome",
  "fantastic",
  "wonderful",
  "delighted",
  "pleasure",
];

const NEGATIVE_WORDS = [
  "busy",
  "later",
  "maybe",
  "idk",
  "whatever",
  "fine",
  "ok",
  "sure",
  "nevermind",
  "forget it",
  "tired",
  "stressed",
  "leave me",
  "not now",
  "no",
  "doubt",
  "weird",
  "distant",
  "ignored",
  "seen",
  "can't",
  "won't",
  "sorry",
  "unavailable",
  "leave",
];

function analyzeSentiment(text: string): { score: number; result: string } {
  if (!text.trim()) {
    return { score: 50, result: "Neutral" };
  }

  const lower = text.toLowerCase();
  let posCount = 0;
  let negCount = 0;

  for (const word of POSITIVE_WORDS) {
    if (lower.includes(word)) posCount++;
  }
  for (const word of NEGATIVE_WORDS) {
    if (lower.includes(word)) negCount++;
  }

  const rawScore = 50 + (negCount - posCount) * 8;
  const score = Math.min(100, Math.max(0, rawScore));

  let result: string;
  if (score < 40) result = "Positive";
  else if (score <= 60) result = "Neutral";
  else result = "Negative";

  return { score, result };
}

export function calculateGhostingScore(inputs: GhostingInputs): GhostingResult {
  const { score: sentimentScore, result: sentimentResult } = analyzeSentiment(
    inputs.recentMessage,
  );

  const weightedScore =
    inputs.replyDelay * 0.2 +
    inputs.seenIgnoredFrequency * 0.15 +
    inputs.messageLengthReduction * 0.15 +
    inputs.initiationRatio * 0.15 +
    inputs.toneChange * 0.1 +
    (100 - inputs.socialMediaActivity) * 0.1 +
    sentimentScore * 0.15;

  // Add ±2% random variation
  const variation = Math.random() * 4 - 2;
  const rawScore = weightedScore + variation;
  const score = Math.min(100, Math.max(0, Math.round(rawScore)));

  let riskCategory: "Low" | "Medium" | "High";
  if (score <= 30) riskCategory = "Low";
  else if (score <= 60) riskCategory = "Medium";
  else riskCategory = "High";

  return { score, sentimentResult, riskCategory };
}
