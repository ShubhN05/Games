export default {
  id: 'karna',
  name: 'KARNA',
  rares: ['51'],
  look: {
    dress: async () => (await import('../../shared/yudh.js')).dressAsur       // YUDH's Asur body, unchanged
  }
};
