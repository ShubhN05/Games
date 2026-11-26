export default {
  id: 'arjun',
  name: 'ARJUN',
  rares: ['51', '53'],                    // rare weapons he can fire (codes from powers.js)
  look: {
    tint: 0xc7a88f,                       // skin colour on top of the base body
    dress: async () => (await import('../../shared/yudh.js')).dressArjun      // YUDH's Arjun, unchanged
  }
};
