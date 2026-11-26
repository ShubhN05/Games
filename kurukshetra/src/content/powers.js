/* ALL SUPER ARROWS (astras). To add one: add an entry with a free two-number code (digits 1-5).
   Nothing else needs editing: the chart, counter table, hints and computer read this list.

   counters : codes that stop it completely          halvedBy : codes that cut its damage in half
   game     : true = our own counter rule (not from the epics)
   rare     : once per match; the archer must list it in `rares`
   shield   : blocks only, cannot attack, once per match, every archer has it
   lower    : also passes by an archer who lowers the bow (holds crouch) and does not attack while it flies
   sound    : sound played on release                textColor: label colour when `color` is too dark to read
   dark     : draw the arrow glow solid instead of adding light */
const P = (name, sanskrit, color, counters, o = {}) => ({ name, sanskrit, color, counters, sound: 'chi', ...o });

export const POWERS = {
  '11': P('Fire',          'Agneyastra',     0xff6a10, ['12', '33'], { sound: 'fire' }),
  '12': P('Water',         'Varunastra',     0x2a8cff, ['13']),
  '13': P('Wind',          'Vayavyastra',    0xbfe8e0, ['14', '42'], { sound: 'wind' }),
  '14': P('Mountain',      'Shailastra',     0x9a7448, ['15']),
  '15': P('Thunder',       'Vajrastra',      0xffee55, ['42'], { game: true, sound: 'thunder' }),
  '21': P('Serpent',       'Nagastra',       0x35d04a, ['22']),
  '22': P('Eagle',         'Garudastra',     0xe0a020, ['11'], { game: true }),
  '23': P('Sleep',         'Pramohanastra',  0x9a6aff, ['24']),
  '24': P('Awaken',        'Prajnastra',     0xfff2b0, ['23'], { game: true }),
  '31': P('Beast arrows',  'Asurastra',      0xd02050, ['32']),
  '32': P('Gandharva',     'Gandharvastra',  0xff80c8, ['23'], { game: true }),
  '33': P('Sun discs',     'Saurastra',      0xffa820, ['35', '11'], { sound: 'fire' }),
  '34': P('Reed strike',   'Aishikastra',    0x9ad060, ['35']),
  '35': P('Arrow shower',  'Aindrastra',     0x70c0ff, ['14'], { game: true }),
  '41': P('Death strike',  'Yamyastra',      0x8020a0, ['13'], { textColor: 0xd080ff, dark: true }),
  '42': P('Secret weapon', 'Guhyakastra',    0x30c8b0, ['24'], { game: true }),
  '51': P('Brahmastra',    'Brahmastra',     0xffffff, ['51', '54'], { rare: true }),
  '52': P('Narayanastra',  'Narayanastra',   0x60a0ff, ['54'], { rare: true, lower: true }),
  '53': P('Pashupata',     'Pashupatastra',  0xff2020, ['54'], { rare: true, halvedBy: ['51'] }),
  '54': P('Brahma Danda',  'shield',         0xffd870, [], { rare: true, shield: true, short: 'Danda' })
};
