export interface LocalAdvisorInput {
  score: number;
  riskCategory: string;
  sentimentResult: string;
  replyDelay: number;
  seenIgnoredFrequency: number;
  initiationRatio: number;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const LOW_RESPONSES = [
  "From what you've described, the communication dynamic actually looks fairly balanced. They're engaging consistently and the sentiment comes across as generally positive. There's no obvious red flag here — sometimes anxiety makes us read into things that aren't there.\n\nThat said, if something feels off to you emotionally, trust that too. What specifically made you want to check in?",

  "Honestly, the signals here are pretty reassuring. Response patterns are stable, there's no major withdrawal happening, and the overall engagement looks mutual. That's a good sign.\n\nIf you've been feeling uncertain lately, it might be worth asking yourself whether that's coming from something in the dynamic, or from your own emotional state at the moment. Both are valid — just worth knowing which it is.",

  "Looking at the behavioral data, there's nothing here that suggests disengagement. The communication rhythm seems natural and consistent, which is usually a positive indicator.\n\nThe best thing you can do right now is stay present and authentic rather than overthinking it. Sometimes the healthiest thing is to just let things unfold without analyzing every message. What's been on your mind about this?",

  "The pattern here reads as genuinely stable. Engagement is consistent, the tone hasn't shifted dramatically, and the initiation balance seems reasonable. These are the kinds of signals that suggest both people are still invested.\n\nIf you're feeling anxious despite this, it might be worth exploring where that's coming from — sometimes past experiences make us hypervigilant even when things are actually fine.",
];

const MEDIUM_RESPONSES = [
  "There's been a noticeable shift in the energy here. The response pattern has become a bit less consistent, and the tone has drifted somewhat. It's worth slowing down your own initiation frequency — not as a game, but as a way to give both of you some breathing room. Sometimes distance creates clarity.\n\nWhat does your gut say about how things have been feeling lately?",

  "Something has changed in this dynamic, and the data reflects that. Response times are getting longer, and the back-and-forth isn't as balanced as it might have been. That doesn't mean it's over — it could be stress, distraction, or just a natural ebb in communication.\n\nThe most useful thing right now isn't to say more — it's to observe. Give it a few days and see if the pattern self-corrects. If it doesn't, a calm, honest check-in is usually better than reading into silence.",

  "The behavioral signals are a bit mixed here. Some things look fine, but there are a few patterns worth paying attention to — the initiation imbalance especially. When one person is consistently reaching out more, it can start to feel effortful for both sides.\n\nIf you haven't already, it might be worth just being direct — not in a confrontational way, but in a genuinely curious one. Something like: 'Hey, I've noticed things have felt a bit different lately — is everything okay?' That kind of honesty usually opens more than strategic messaging ever could.",

  "There's mild instability in this pattern. Nothing alarming, but it's the kind of shift that's worth being aware of rather than pushing through. The tone change and response delay together suggest something has shifted emotionally on their end.\n\nThe healthiest response to this is usually to take a small step back yourself — not to play games, but to create natural space for them to re-engage if they want to. Focus on your own life in the meantime. What's been going on for you outside of this?",
];

const HIGH_RESPONSES = [
  "Looking at all these signals together, there's a significant withdrawal pattern happening. That's genuinely hard to sit with. Before focusing on what to say or do, it might be worth just sitting with how you're feeling about this.\n\nHave you had a calm, honest conversation with them about what you've noticed? Sometimes naming it directly — without pressure — opens more than strategic messaging ever could. And sometimes it doesn't, and that tells you something important too.",

  "The data here is pretty consistent — multiple indicators pointing in the same direction. That kind of pattern is usually meaningful, and it makes sense that you're feeling it even if you couldn't fully name it.\n\nI want to gently say this: your emotional wellbeing matters here, regardless of what they decide to do. You can't control their withdrawal, but you can control how much energy you spend trying to reverse it. What would feel like the most dignified next step for you?",

  "These signals suggest a fairly significant disengagement. It's not a small fluctuation — the combination of response delay, initiation imbalance, and tone shift together paint a coherent picture.\n\nThe most honest thing I can offer is this: you deserve communication that doesn't require this much analysis. If reaching out feels necessary, keep it brief and genuine — one message, no follow-ups. Then give yourself permission to let the outcome be what it is. You can't hold space for someone who's already left it.",

  "There's a strong withdrawal pattern here, and acknowledging that takes courage. I don't want to sugarcoat it — the behavioral signals are pointing toward significant disengagement.\n\nBut I also want to say that this says very little about your worth or what you deserve. Sometimes people pull away for reasons that have nothing to do with you. The question isn't how to get them back — it's what you need right now to take care of yourself. What's your support system looking like at the moment?",
];

export function generateLocalAdvice(ctx: LocalAdvisorInput): string {
  const isLow = ctx.riskCategory === "Low";
  const isMedium = ctx.riskCategory === "Medium";

  if (isLow) return pick(LOW_RESPONSES);
  if (isMedium) return pick(MEDIUM_RESPONSES);
  return pick(HIGH_RESPONSES);
}
