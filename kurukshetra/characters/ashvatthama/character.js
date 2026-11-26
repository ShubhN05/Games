/* ASHVATTHAMA - name and weapons. His look is in look.js, his bow in bow.js, the design in design.md */
export default {
  id: 'ashvatthama',
  name: 'ASHVATTHAMA',
  rares: ['51', '52'],              // rare weapons he can fire (codes from src/content/powers.js)
  look: () => import('./look.js'),
  bow: () => import('./bow.js')
};
