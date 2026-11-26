export default {
  id: 'warbanner-marsh',
  name: 'Warbanner Marsh',
  dim: 0.5,                                // darken the painting so arrows stand out (0 = not at all)
  /* draw the backdrop on a 960 x 540 canvas; the ground line is at y = 450 */
  async paint(ctx){ (await import('../../shared/yudh.js')).paintYudhArena('warbanner-marsh', ctx); }
};
