/* ALL SUPER ARROWS (astras). To change or add one, edit this list only: the chart, counter table, hints and computer read it.

   key      : the one key that uses it. Ordinary arrows 1-5; a big weapon 6 or 7 (an archer cannot have two on one key)
   counters : ids that stop it completely            halvedBy : ids that cut its damage in half
   game     : true = our own counter rule (not from the epics)
   rare     : once per match; the archer must list its id in `rares`
   shield   : blocks only, cannot attack, once per match, every archer has it
   lower    : also passes by an archer who lowers the bow (holds crouch) and does not attack while it flies
   sound    : sound played on release                textColor: label colour when `color` is too dark to read
   dark     : draw the arrow glow solid instead of adding light

   The five ordinary arrows form a circle: the next number stops each one, and 1 stops 5. */
const P = (key, name, sanskrit, color, counters, o = {}) => ({ key, name, sanskrit, color, counters, sound: 'chi', ...o });

export const POWERS = {
  '1': P('1', 'Fire',     'Agneyastra',  0xff6a10, ['2'], { sound: 'fire' }),
  '2': P('2', 'Water',    'Varunastra',  0x2a8cff, ['3']),
  '3': P('3', 'Wind',     'Vayavyastra', 0xbfe8e0, ['4'], { sound: 'wind' }),
  '4': P('4', 'Mountain', 'Shailastra',  0x9a7448, ['5']),
  '5': P('5', 'Thunder',  'Vajrastra',   0xffee55, ['1'], { game: true, sound: 'thunder' }),
  '51': P('6', 'Brahmastra',   'Brahmastra',    0xffffff, ['51', '54'], { rare: true }),
  '52': P('7', 'Narayanastra', 'Narayanastra',  0x60a0ff, ['54'], { rare: true, lower: true }),
  '53': P('7', 'Pashupata',    'Pashupatastra', 0xff2020, ['54'], { rare: true, halvedBy: ['51'] }),
  '54': P('Space', 'Brahma Danda', 'shield',    0xffd870, [], { rare: true, shield: true, short: 'Danda' })
};
