/* How good the computer is. think = seconds before it answers a super arrow (more than 2 = too late),
   right = chance of the correct counter, dodge = chance of escaping a normal arrow, react = delay before dodging. */
export const LEVELS = {
  easy:   { name: 'EASY',   arrowEvery: 2.8, superEvery: 9.0, think: [1.2, 2.3], right: 0.35, dodge: 0.25, react: 0.40 },
  normal: { name: 'NORMAL', arrowEvery: 2.0, superEvery: 6.5, think: [0.9, 1.9], right: 0.60, dodge: 0.50, react: 0.30 },
  hard:   { name: 'HARD',   arrowEvery: 1.3, superEvery: 4.5, think: [0.6, 1.5], right: 0.85, dodge: 0.75, react: 0.20 }
};
