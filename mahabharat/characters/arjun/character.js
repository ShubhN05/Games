/* ARJUN - name and weapons. His look is in look.js, his bow in bow.js, the design in design.md */
export default {
  id: 'arjun',
  name: 'ARJUN',
  rares: ['51', '53'],                    // rare weapons he can fire (codes from src/content/powers.js)
  look: () => import('./look.js'),
  bow: () => import('./bow.js')
};
