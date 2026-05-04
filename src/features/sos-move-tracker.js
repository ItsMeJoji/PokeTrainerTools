import { getPokemonMovesGen7, getMoveDetails } from '../utils/pokeapi.js';
import { SOS_MOVE_TRACKER_INSTRUCTIONS } from '../utils/instruction-content.js';

// Hardcoded list of all Pokemon that can appear in SOS Battles (non-zero call rate)
// Source: https://bulbapedia.bulbagarden.net/wiki/List_of_Pok%C3%A9mon_by_call_rate
const SOS_POKEMON = [
  { id: 10, name: 'caterpie', displayName: 'Caterpie' },
  { id: 11, name: 'metapod', displayName: 'Metapod' },
  { id: 12, name: 'butterfree', displayName: 'Butterfree' },
  { id: 19, name: 'rattata', displayName: 'Rattata' },
  { id: 20, name: 'raticate', displayName: 'Raticate' },
  { id: 21, name: 'spearow', displayName: 'Spearow' },
  { id: 22, name: 'fearow', displayName: 'Fearow' },
  { id: 23, name: 'ekans', displayName: 'Ekans' },
  { id: 24, name: 'arbok', displayName: 'Arbok' },
  { id: 25, name: 'pikachu', displayName: 'Pikachu' },
  { id: 27, name: 'sandshrew', displayName: 'Sandshrew' },
  { id: 35, name: 'clefairy', displayName: 'Clefairy' },
  { id: 37, name: 'vulpix', displayName: 'Vulpix' },
  { id: 39, name: 'jigglypuff', displayName: 'Jigglypuff' },
  { id: 41, name: 'zubat', displayName: 'Zubat' },
  { id: 42, name: 'golbat', displayName: 'Golbat' },
  { id: 46, name: 'paras', displayName: 'Paras' },
  { id: 47, name: 'parasect', displayName: 'Parasect' },
  { id: 50, name: 'diglett', displayName: 'Diglett' },
  { id: 51, name: 'dugtrio', displayName: 'Dugtrio' },
  { id: 52, name: 'meowth', displayName: 'Meowth' },
  { id: 53, name: 'persian', displayName: 'Persian' },
  { id: 54, name: 'psyduck', displayName: 'Psyduck' },
  { id: 55, name: 'golduck', displayName: 'Golduck' },
  { id: 56, name: 'mankey', displayName: 'Mankey' },
  { id: 57, name: 'primeape', displayName: 'Primeape' },
  { id: 58, name: 'growlithe', displayName: 'Growlithe' },
  { id: 60, name: 'poliwag', displayName: 'Poliwag' },
  { id: 61, name: 'poliwhirl', displayName: 'Poliwhirl' },
  { id: 62, name: 'poliwrath', displayName: 'Poliwrath' },
  { id: 63, name: 'abra', displayName: 'Abra' },
  { id: 64, name: 'kadabra', displayName: 'Kadabra' },
  { id: 66, name: 'machop', displayName: 'Machop' },
  { id: 67, name: 'machoke', displayName: 'Machoke' },
  { id: 72, name: 'tentacool', displayName: 'Tentacool' },
  { id: 73, name: 'tentacruel', displayName: 'Tentacruel' },
  { id: 74, name: 'geodude', displayName: 'Geodude' },
  { id: 75, name: 'graveler', displayName: 'Graveler' },
  { id: 79, name: 'slowpoke', displayName: 'Slowpoke' },
  { id: 80, name: 'slowbro', displayName: 'Slowbro' },
  { id: 81, name: 'magnemite', displayName: 'Magnemite' },
  { id: 82, name: 'magneton', displayName: 'Magneton' },
  { id: 86, name: 'seel', displayName: 'Seel' },
  { id: 87, name: 'dewgong', displayName: 'Dewgong' },
  { id: 88, name: 'grimer', displayName: 'Grimer' },
  { id: 89, name: 'muk', displayName: 'Muk' },
  { id: 90, name: 'shellder', displayName: 'Shellder' },
  { id: 92, name: 'gastly', displayName: 'Gastly' },
  { id: 93, name: 'haunter', displayName: 'Haunter' },
  { id: 94, name: 'gengar', displayName: 'Gengar' },
  { id: 96, name: 'drowzee', displayName: 'Drowzee' },
  { id: 97, name: 'hypno', displayName: 'Hypno' },
  { id: 101, name: 'electrode', displayName: 'Electrode' },
  { id: 102, name: 'exeggcute', displayName: 'Exeggcute' },
  { id: 103, name: 'exeggutor', displayName: 'Exeggutor' },
  { id: 104, name: 'cubone', displayName: 'Cubone' },
  { id: 105, name: 'marowak', displayName: 'Marowak' },
  { id: 108, name: 'lickitung', displayName: 'Lickitung' },
  { id: 113, name: 'chansey', displayName: 'Chansey' },
  { id: 115, name: 'kangaskhan', displayName: 'Kangaskhan' },
  { id: 118, name: 'goldeen', displayName: 'Goldeen' },
  { id: 119, name: 'seaking', displayName: 'Seaking' },
  { id: 120, name: 'staryu', displayName: 'Staryu' },
  { id: 121, name: 'starmie', displayName: 'Starmie' },
  { id: 122, name: 'mr-mime', displayName: 'Mr. Mime' },
  { id: 123, name: 'scyther', displayName: 'Scyther' },
  { id: 124, name: 'jynx', displayName: 'Jynx' },
  { id: 125, name: 'electabuzz', displayName: 'Electabuzz' },
  { id: 126, name: 'magmar', displayName: 'Magmar' },
  { id: 127, name: 'pinsir', displayName: 'Pinsir' },
  { id: 128, name: 'tauros', displayName: 'Tauros' },
  { id: 129, name: 'magikarp', displayName: 'Magikarp' },
  { id: 130, name: 'gyarados', displayName: 'Gyarados' },
  { id: 131, name: 'lapras', displayName: 'Lapras' },
  { id: 132, name: 'ditto', displayName: 'Ditto' },
  { id: 133, name: 'eevee', displayName: 'Eevee' },
  { id: 143, name: 'snorlax', displayName: 'Snorlax' },
  { id: 147, name: 'dratini', displayName: 'Dratini' },
  { id: 148, name: 'dragonair', displayName: 'Dragonair' },
  { id: 149, name: 'dragonite', displayName: 'Dragonite' },
  { id: 163, name: 'hoothoot', displayName: 'Hoothoot' },
  { id: 164, name: 'noctowl', displayName: 'Noctowl' },
  { id: 165, name: 'ledyba', displayName: 'Ledyba' },
  { id: 166, name: 'ledian', displayName: 'Ledian' },
  { id: 167, name: 'spinarak', displayName: 'Spinarak' },
  { id: 168, name: 'ariados', displayName: 'Ariados' },
  { id: 169, name: 'crobat', displayName: 'Crobat' },
  { id: 170, name: 'chinchou', displayName: 'Chinchou' },
  { id: 171, name: 'lanturn', displayName: 'Lanturn' },
  { id: 172, name: 'pichu', displayName: 'Pichu' },
  { id: 173, name: 'cleffa', displayName: 'Cleffa' },
  { id: 174, name: 'igglybuff', displayName: 'Igglybuff' },
  { id: 177, name: 'natu', displayName: 'Natu' },
  { id: 178, name: 'xatu', displayName: 'Xatu' },
  { id: 179, name: 'mareep', displayName: 'Mareep' },
  { id: 180, name: 'flaaffy', displayName: 'Flaaffy' },
  { id: 185, name: 'sudowoodo', displayName: 'Sudowoodo' },
  { id: 186, name: 'politoed', displayName: 'Politoed' },
  { id: 190, name: 'aipom', displayName: 'Aipom' },
  { id: 196, name: 'espeon', displayName: 'Espeon' },
  { id: 197, name: 'umbreon', displayName: 'Umbreon' },
  { id: 198, name: 'murkrow', displayName: 'Murkrow' },
  { id: 199, name: 'slowking', displayName: 'Slowking' },
  { id: 200, name: 'misdreavus', displayName: 'Misdreavus' },
  { id: 204, name: 'pineco', displayName: 'Pineco' },
  { id: 205, name: 'forretress', displayName: 'Forretress' },
  { id: 206, name: 'dunsparce', displayName: 'Dunsparce' },
  { id: 209, name: 'snubbull', displayName: 'Snubbull' },
  { id: 210, name: 'granbull', displayName: 'Granbull' },
  { id: 214, name: 'heracross', displayName: 'Heracross' },
  { id: 215, name: 'sneasel', displayName: 'Sneasel' },
  { id: 222, name: 'corsola', displayName: 'Corsola' },
  { id: 223, name: 'remoraid', displayName: 'Remoraid' },
  { id: 224, name: 'octillery', displayName: 'Octillery' },
  { id: 225, name: 'delibird', displayName: 'Delibird' },
  { id: 227, name: 'skarmory', displayName: 'Skarmory' },
  { id: 228, name: 'houndour', displayName: 'Houndour' },
  { id: 229, name: 'houndoom', displayName: 'Houndoom' },
  { id: 235, name: 'smeargle', displayName: 'Smeargle' },
  { id: 238, name: 'smoochum', displayName: 'Smoochum' },
  { id: 239, name: 'elekid', displayName: 'Elekid' },
  { id: 240, name: 'magby', displayName: 'Magby' },
  { id: 241, name: 'miltank', displayName: 'Miltank' },
  { id: 242, name: 'blissey', displayName: 'Blissey' },
  { id: 246, name: 'larvitar', displayName: 'Larvitar' },
  { id: 247, name: 'pupitar', displayName: 'Pupitar' },
  { id: 278, name: 'wingull', displayName: 'Wingull' },
  { id: 279, name: 'pelipper', displayName: 'Pelipper' },
  { id: 283, name: 'surskit', displayName: 'Surskit' },
  { id: 284, name: 'masquerain', displayName: 'Masquerain' },
  { id: 296, name: 'makuhita', displayName: 'Makuhita' },
  { id: 297, name: 'hariyama', displayName: 'Hariyama' },
  { id: 299, name: 'nosepass', displayName: 'Nosepass' },
  { id: 302, name: 'sableye', displayName: 'Sableye' },
  { id: 303, name: 'mawile', displayName: 'Mawile' },
  { id: 309, name: 'electrike', displayName: 'Electrike' },
  { id: 310, name: 'manectric', displayName: 'Manectric' },
  { id: 318, name: 'carvanha', displayName: 'Carvanha' },
  { id: 319, name: 'sharpedo', displayName: 'Sharpedo' },
  { id: 320, name: 'wailmer', displayName: 'Wailmer' },
  { id: 321, name: 'wailord', displayName: 'Wailord' },
  { id: 324, name: 'torkoal', displayName: 'Torkoal' },
  { id: 327, name: 'spinda', displayName: 'Spinda' },
  { id: 328, name: 'trapinch', displayName: 'Trapinch' },
  { id: 329, name: 'vibrava', displayName: 'Vibrava' },
  { id: 339, name: 'barboach', displayName: 'Barboach' },
  { id: 340, name: 'whiscash', displayName: 'Whiscash' },
  { id: 341, name: 'corphish', displayName: 'Corphish' },
  { id: 342, name: 'crawdaunt', displayName: 'Crawdaunt' },
  { id: 343, name: 'baltoy', displayName: 'Baltoy' },
  { id: 344, name: 'claydol', displayName: 'Claydol' },
  { id: 349, name: 'feebas', displayName: 'Feebas' },
  { id: 351, name: 'castform', displayName: 'Castform' },
  { id: 352, name: 'kecleon', displayName: 'Kecleon' },
  { id: 353, name: 'shuppet', displayName: 'Shuppet' },
  { id: 354, name: 'banette', displayName: 'Banette' },
  { id: 357, name: 'tropius', displayName: 'Tropius' },
  { id: 359, name: 'absol', displayName: 'Absol' },
  { id: 361, name: 'snorunt', displayName: 'Snorunt' },
  { id: 362, name: 'glalie', displayName: 'Glalie' },
  { id: 366, name: 'clamperl', displayName: 'Clamperl' },
  { id: 367, name: 'huntail', displayName: 'Huntail' },
  { id: 368, name: 'gorebyss', displayName: 'Gorebyss' },
  { id: 369, name: 'relicanth', displayName: 'Relicanth' },
  { id: 370, name: 'luvdisc', displayName: 'Luvdisc' },
  { id: 371, name: 'bagon', displayName: 'Bagon' },
  { id: 372, name: 'shelgon', displayName: 'Shelgon' },
  { id: 373, name: 'salamence', displayName: 'Salamence' },
  { id: 374, name: 'beldum', displayName: 'Beldum' },
  { id: 375, name: 'metang', displayName: 'Metang' },
  { id: 422, name: 'shellos', displayName: 'Shellos' },
  { id: 423, name: 'gastrodon', displayName: 'Gastrodon' },
  { id: 424, name: 'ambipom', displayName: 'Ambipom' },
  { id: 425, name: 'drifloon', displayName: 'Drifloon' },
  { id: 426, name: 'drifblim', displayName: 'Drifblim' },
  { id: 427, name: 'buneary', displayName: 'Buneary' },
  { id: 428, name: 'lopunny', displayName: 'Lopunny' },
  { id: 438, name: 'bonsly', displayName: 'Bonsly' },
  { id: 439, name: 'mime-jr', displayName: 'Mime Jr.' },
  { id: 440, name: 'happiny', displayName: 'Happiny' },
  { id: 444, name: 'gabite', displayName: 'Gabite' },
  { id: 446, name: 'munchlax', displayName: 'Munchlax' },
  { id: 447, name: 'riolu', displayName: 'Riolu' },
  { id: 448, name: 'lucario', displayName: 'Lucario' },
  { id: 456, name: 'finneon', displayName: 'Finneon' },
  { id: 457, name: 'lumineon', displayName: 'Lumineon' },
  { id: 458, name: 'mantyke', displayName: 'Mantyke' },
  { id: 506, name: 'lillipup', displayName: 'Lillipup' },
  { id: 507, name: 'herdier', displayName: 'Herdier' },
  { id: 524, name: 'roggenrola', displayName: 'Roggenrola' },
  { id: 525, name: 'boldore', displayName: 'Boldore' },
  { id: 546, name: 'cottonee', displayName: 'Cottonee' },
  { id: 548, name: 'petilil', displayName: 'Petilil' },
  { id: 550, name: 'basculin', displayName: 'Basculin' },
  { id: 551, name: 'sandile', displayName: 'Sandile' },
  { id: 552, name: 'krokorok', displayName: 'Krokorok' },
  { id: 559, name: 'scraggy', displayName: 'Scraggy' },
  { id: 560, name: 'scrafty', displayName: 'Scrafty' },
  { id: 568, name: 'trubbish', displayName: 'Trubbish' },
  { id: 569, name: 'garbodor', displayName: 'Garbodor' },
  { id: 570, name: 'zorua', displayName: 'Zorua' },
  { id: 571, name: 'zoroark', displayName: 'Zoroark' },
  { id: 572, name: 'minccino', displayName: 'Minccino' },
  { id: 582, name: 'vanillite', displayName: 'Vanillite' },
  { id: 583, name: 'vanillish', displayName: 'Vanillish' },
  { id: 584, name: 'vanilluxe', displayName: 'Vanilluxe' },
  { id: 587, name: 'emolga', displayName: 'Emolga' },
  { id: 592, name: 'frillish', displayName: 'Frillish' },
  { id: 593, name: 'jellicent', displayName: 'Jellicent' },
  { id: 594, name: 'alomomola', displayName: 'Alomomola' },
  { id: 605, name: 'elgyem', displayName: 'Elgyem' },
  { id: 606, name: 'beheeyem', displayName: 'Beheeyem' },
  { id: 619, name: 'mienfoo', displayName: 'Mienfoo' },
  { id: 620, name: 'mienshao', displayName: 'Mienshao' },
  { id: 621, name: 'druddigon', displayName: 'Druddigon' },
  { id: 622, name: 'golett', displayName: 'Golett' },
  { id: 623, name: 'golurk', displayName: 'Golurk' },
  { id: 624, name: 'pawniard', displayName: 'Pawniard' },
  { id: 625, name: 'bisharp', displayName: 'Bisharp' },
  { id: 627, name: 'rufflet', displayName: 'Rufflet' },
  { id: 628, name: 'braviary', displayName: 'Braviary' },
  { id: 629, name: 'vullaby', displayName: 'Vullaby' },
  { id: 630, name: 'mandibuzz', displayName: 'Mandibuzz' },
  { id: 636, name: 'larvesta', displayName: 'Larvesta' },
  { id: 637, name: 'volcarona', displayName: 'Volcarona' },
  { id: 661, name: 'fletchling', displayName: 'Fletchling' },
  { id: 662, name: 'fletchinder', displayName: 'Fletchinder' },
  { id: 667, name: 'litleo', displayName: 'Litleo' },
  { id: 668, name: 'pyroar', displayName: 'Pyroar' },
  { id: 669, name: 'flabebe', displayName: 'Flabébé' },
  { id: 670, name: 'floette', displayName: 'Floette' },
  { id: 674, name: 'pancham', displayName: 'Pancham' },
  { id: 675, name: 'pangoro', displayName: 'Pangoro' },
  { id: 676, name: 'furfrou', displayName: 'Furfrou' },
  { id: 686, name: 'inkay', displayName: 'Inkay' },
  { id: 687, name: 'malamar', displayName: 'Malamar' },
  { id: 690, name: 'skrelp', displayName: 'Skrelp' },
  { id: 691, name: 'dragalge', displayName: 'Dragalge' },
  { id: 692, name: 'clauncher', displayName: 'Clauncher' },
  { id: 693, name: 'clawitzer', displayName: 'Clawitzer' },
  { id: 701, name: 'hawlucha', displayName: 'Hawlucha' },
  { id: 702, name: 'dedenne', displayName: 'Dedenne' },
  { id: 703, name: 'carbink', displayName: 'Carbink' },
  { id: 704, name: 'goomy', displayName: 'Goomy' },
  { id: 705, name: 'sliggoo', displayName: 'Sliggoo' },
  { id: 707, name: 'klefki', displayName: 'Klefki' },
  { id: 708, name: 'phantump', displayName: 'Phantump' },
  { id: 714, name: 'noibat', displayName: 'Noibat' },
  { id: 715, name: 'noivern', displayName: 'Noivern' },
  { id: 731, name: 'pikipek', displayName: 'Pikipek' },
  { id: 732, name: 'trumbeak', displayName: 'Trumbeak' },
  { id: 733, name: 'toucannon', displayName: 'Toucannon' },
  { id: 734, name: 'yungoos', displayName: 'Yungoos' },
  { id: 735, name: 'gumshoos', displayName: 'Gumshoos' },
  { id: 736, name: 'grubbin', displayName: 'Grubbin' },
  { id: 737, name: 'charjabug', displayName: 'Charjabug' },
  { id: 738, name: 'vikavolt', displayName: 'Vikavolt' },
  { id: 739, name: 'crabrawler', displayName: 'Crabrawler' },
  { id: 741, name: 'oricorio', displayName: 'Oricorio' },
  { id: 742, name: 'cutiefly', displayName: 'Cutiefly' },
  { id: 743, name: 'ribombee', displayName: 'Ribombee' },
  { id: 744, name: 'rockruff', displayName: 'Rockruff' },
  { id: 745, name: 'lycanroc', displayName: 'Lycanroc' },
  { id: 746, name: 'wishiwashi', displayName: 'Wishiwashi' },
  { id: 747, name: 'mareanie', displayName: 'Mareanie' },
  { id: 749, name: 'mudbray', displayName: 'Mudbray' },
  { id: 750, name: 'mudsdale', displayName: 'Mudsdale' },
  { id: 751, name: 'dewpider', displayName: 'Dewpider' },
  { id: 752, name: 'araquanid', displayName: 'Araquanid' },
  { id: 753, name: 'fomantis', displayName: 'Fomantis' },
  { id: 754, name: 'lurantis', displayName: 'Lurantis' },
  { id: 755, name: 'morelull', displayName: 'Morelull' },
  { id: 756, name: 'shiinotic', displayName: 'Shiinotic' },
  { id: 757, name: 'salandit', displayName: 'Salandit' },
  { id: 758, name: 'salazzle', displayName: 'Salazzle' },
  { id: 759, name: 'stufful', displayName: 'Stufful' },
  { id: 760, name: 'bewear', displayName: 'Bewear' },
  { id: 761, name: 'bounsweet', displayName: 'Bounsweet' },
  { id: 762, name: 'steenee', displayName: 'Steenee' },
  { id: 764, name: 'comfey', displayName: 'Comfey' },
  { id: 765, name: 'oranguru', displayName: 'Oranguru' },
  { id: 766, name: 'passimian', displayName: 'Passimian' },
  { id: 767, name: 'wimpod', displayName: 'Wimpod' },
  { id: 769, name: 'sandygast', displayName: 'Sandygast' },
  { id: 770, name: 'palossand', displayName: 'Palossand' },
  { id: 771, name: 'pyukumuku', displayName: 'Pyukumuku' },
  { id: 774, name: 'minior', displayName: 'Minior' },
  { id: 775, name: 'komala', displayName: 'Komala' },
  { id: 776, name: 'turtonator', displayName: 'Turtonator' },
  { id: 777, name: 'togedemaru', displayName: 'Togedemaru' },
  { id: 778, name: 'mimikyu', displayName: 'Mimikyu' },
  { id: 779, name: 'bruxish', displayName: 'Bruxish' },
  { id: 780, name: 'drampa', displayName: 'Drampa' },
  { id: 781, name: 'dhelmise', displayName: 'Dhelmise' },
  { id: 782, name: 'jangmo-o', displayName: 'Jangmo-o' },
  { id: 783, name: 'hakamo-o', displayName: 'Hakamo-o' },
  { id: 784, name: 'kommo-o', displayName: 'Kommo-o' },
];

let currentPokemon = null;
let pokemonMovesCache = []; // Names of moves available to current pokemon
let moveSlots = [
  { move: null, currentPP: 0, maxPP: 0 },
  { move: null, currentPP: 0, maxPP: 0 },
  { move: null, currentPP: 0, maxPP: 0 },
  { move: null, currentPP: 0, maxPP: 0 }
];

// Some Pokemon are stored under a different form name in the API
const POKEMON_API_NAME_OVERRIDES = {
  'minior': 'minior-red-meteor',
  'mimikyu': 'mimikyu-disguised',
};

let containerEl = null;

export async function initSosMoveTracker(container) {
  containerEl = container;
  renderTracker();
}


function renderTracker() {
  containerEl.innerHTML = `
    <div class="anim-fade-in text-center max-w-4xl mx-auto pb-12">
      <div class="mb-8 flex flex-col items-center gap-4">
        <div>
          <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight text-black dark:text-white mb-4 text-shadow-lg">SOS Move Tracker</h1>
          <p class="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Track the PP of Wild Pokémon during SOS Battles to prevent them from Struggling.
          </p>

          <!-- Instructions Collapsible -->
          <details class="group mb-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden text-center">
            <summary class="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-300 list-none [&::-webkit-details-marker]:hidden border-b border-transparent group-open:border-gray-100 dark:group-open:border-gray-700">
              <div class="flex items-center space-x-3">
                <span class="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                <span class="text-xl font-bold text-gray-900 dark:text-white">How to Use This Tool</span>
              </div>
              <svg class="w-6 h-6 text-gray-400 transform transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </summary>
            <div class="p-6 bg-gray-50/50 dark:bg-gray-900/20">
              <div class="mb-6">
                <a href="/info/sos-hunting" class="inline-flex items-center text-sm font-bold text-blue-500 hover:text-blue-600 transition-colors bg-blue-50 dark:bg-blue-900/20 px-6 py-2 rounded-full border border-blue-200 dark:border-blue-800 shadow-sm">
                  <i class="fas fa-info-circle mr-2"></i> SOS Chaining Guide
                </a>
              </div>
              ${SOS_MOVE_TRACKER_INSTRUCTIONS}
            </div>
          </details>
        </div>
        <button id="btn-transformed" class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors flex items-center gap-2 whitespace-nowrap" style="display: none;">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
          Transformed!
        </button>
      </div>

        <div id="struggle-warning" class="hidden mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-sm" role="alert">
          <p class="font-bold">Warning: Struggle Imminent!</p>
          <p>This Pokémon has 0 PP left across all known moves!</p>
        </div>

      <div class="card bg-white dark:bg-gray-800 shadow-xl rounded-2xl border border-gray-100 dark:border-gray-700 p-6 sm:p-8 mb-8 transition-all duration-300">
        
        <!-- Searchable Dropdown -->
        <div class="searchable-dropdown relative w-full mb-6 text-left" id="pokemon-dropdown" tabindex="0">
          <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Target Pokémon</label>
          <div class="dropdown-header selected-item bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white cursor-pointer flex items-center justify-between">
            <span class="selected-text placeholder text-gray-400 flex items-center overflow-hidden">Select a Pokémon...</span>
            <svg class="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
          <div class="dropdown-list hidden absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl max-h-60 overflow-y-auto">
            <div class="p-2 border-b border-gray-100 dark:border-gray-600 sticky top-0 bg-white dark:bg-gray-700 z-10">
              <input type="text" class="search-input w-full p-2 text-sm bg-gray-50 dark:bg-gray-800 border-none rounded-md focus:ring-0 dark:text-white" placeholder="Search Pokémon..." autocomplete="off">
            </div>
            <div class="options-container items-list py-1"></div>
          </div>
        </div>

        <!-- Move Slots Container -->
        <div id="move-slots-container" class="grid grid-cols-1 md:grid-cols-2 gap-4 hidden">
          ${[0, 1, 2, 3].map(i => `
            <div class="move-slot bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600 relative flex flex-col transition-all duration-300" data-slot="${i}">
              
              <div class="mb-3 text-left">
                <div class="flex items-center gap-2">
                   <div class="move-dropdown relative flex-1" data-slot-idx="${i}">
                     <div class="move-dropdown-header selected-item bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white cursor-pointer flex items-center justify-between">
                       <span class="move-selected-text placeholder text-gray-400 truncate">-- Select Move --</span>
                       <svg class="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                     </div>
                     <div class="move-dropdown-list hidden absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                       <div class="p-2 border-b border-gray-100 dark:border-gray-600 sticky top-0 bg-white dark:bg-gray-700 z-10">
                         <input type="text" class="move-search-input w-full p-2 text-sm bg-gray-50 dark:bg-gray-800 border-none rounded-md focus:ring-0 dark:text-white" placeholder="Search moves..." autocomplete="off">
                       </div>
                       <div class="move-options-container items-list py-1"></div>
                     </div>
                   </div>
                   <button class="override-btn flex-shrink-0 text-gray-400 hover:text-blue-500 transition-colors p-1" title="Override Move Details">
                     <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                   </button>
                </div>
              </div>


              <div class="flex-grow flex flex-col justify-center items-center py-4">
                <div class="text-4xl font-black tabular-nums tracking-tighter pp-display mb-1 text-gray-800 dark:text-gray-100">
                  <span class="current-pp">0</span><span class="text-xl text-gray-400 font-normal"> / <span class="max-pp">0</span></span>
                </div>
                <div class="text-xs font-bold uppercase tracking-widest text-gray-400 move-type-label">TYPE</div>
              </div>

              <button class="decrement-btn w-full bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/60 text-red-700 dark:text-red-400 font-bold py-3 rounded-md transition-colors border border-red-200 dark:border-red-800/50 flex items-center justify-center gap-2" disabled>
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path></svg>
                Use Move (-1 PP)
              </button>

              <!-- Override Overlay (Hidden by default) -->
              <div class="override-overlay absolute inset-0 bg-white dark:bg-gray-800 p-4 rounded-lg flex flex-col justify-center z-10 hidden border-2 border-blue-500 transition-all duration-300">
                <h4 class="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Manual PP Override</h4>
                <div class="flex gap-2 mb-4 text-left">
                  <div class="flex-1">
                    <label class="block mb-2 text-xs font-medium text-gray-900 dark:text-white">Current</label>
                    <input type="number" class="override-current bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white font-mono" min="0">
                  </div>
                  <div class="flex-1">
                    <label class="block mb-2 text-xs font-medium text-gray-900 dark:text-white">Max</label>
                    <input type="number" class="override-max bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white font-mono" min="1">
                  </div>
                </div>
                <div class="flex justify-between gap-2">
                  <button class="cancel-override-btn flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white rounded-lg py-1.5 text-sm font-bold transition-colors shadow-sm">Cancel</button>
                  <button class="save-override-btn flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-1.5 text-sm font-bold transition-colors shadow-sm">Save</button>
                </div>
              </div>

            </div>
          `).join('')}
        </div>

      </div>
    </div>
  `;

  setupPokemonDropdown();
  setupTransformedButton();
}

function setupPokemonDropdown() {
  const dropdownContainer = document.getElementById('pokemon-dropdown');
  const header = dropdownContainer.querySelector('.dropdown-header');
  const list = dropdownContainer.querySelector('.dropdown-list');
  const searchInput = dropdownContainer.querySelector('.search-input');
  const optionsContainer = dropdownContainer.querySelector('.options-container');
  const selectedText = header.querySelector('.selected-text');

  const renderOptions = (filter = '') => {
    const filteredOptions = SOS_POKEMON.filter(p =>
      p.displayName.toLowerCase().includes(filter.toLowerCase()) ||
      p.name.toLowerCase().includes(filter.toLowerCase())
    );

    optionsContainer.innerHTML = filteredOptions.map(p => `
      <div class="dropdown-option dropdown-item px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer flex items-center text-sm dark:text-white text-gray-900" data-value="${p.name}">
        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png" class="w-6 h-6 mr-3 object-contain flex-shrink-0" alt="${p.displayName}" loading="lazy" />
        <span class="truncate font-medium">${p.displayName}</span>
        <span class="ml-auto text-xs text-gray-400">#${p.id}</span>
      </div>
    `).join('');

    const options = optionsContainer.querySelectorAll('.dropdown-option');
    options.forEach(option => {
      option.addEventListener('click', async () => {
        const val = option.getAttribute('data-value');
        const selectedObj = SOS_POKEMON.find(p => p.name === val);
        selectedText.classList.remove('placeholder', 'text-gray-400');
        selectedText.classList.add('text-gray-900', 'dark:text-white');
        selectedText.innerHTML = `<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${selectedObj.id}.png" class="w-5 h-5 mr-2 flex-shrink-0" /> <span class="truncate">${selectedObj.displayName}</span>`;
        list.classList.add('hidden');

        await handlePokemonSelection(selectedObj.name);
      });
    });
  };

  header.addEventListener('click', () => {
    const isHidden = list.classList.contains('hidden');
    if (isHidden) {
      list.classList.remove('hidden');
      searchInput.value = '';
      renderOptions();
      searchInput.focus();
    } else {
      list.classList.add('hidden');
    }
  });

  searchInput.addEventListener('input', (e) => {
    renderOptions(e.target.value);
  });

  document.addEventListener('click', (e) => {
    if (!dropdownContainer.contains(e.target)) {
      list.classList.add('hidden');
    }
    // Also close any open move dropdowns
    document.querySelectorAll('.move-dropdown-list').forEach(l => {
      const parentDropdown = l.closest('.move-dropdown');
      if (!parentDropdown || !parentDropdown.contains(e.target)) {
        l.classList.add('hidden');
      }
    });
  });

  renderOptions();
}

async function handlePokemonSelection(pokemonName) {
  currentPokemon = pokemonName;
  document.getElementById('move-slots-container').classList.remove('hidden');
  // Only show Transformed button for Ditto
  document.getElementById('btn-transformed').style.display = pokemonName === 'ditto' ? 'flex' : 'none';

  // Reset slots
  moveSlots = moveSlots.map(() => ({ move: null, currentPP: 0, maxPP: 0 }));
  updateAllSlotsUI();

  // Show loading in move dropdowns
  const moveDropdowns = document.querySelectorAll('.move-dropdown');
  moveDropdowns.forEach(dd => {
    dd.querySelector('.move-selected-text').textContent = 'Loading moves...';
  });

  const apiName = POKEMON_API_NAME_OVERRIDES[pokemonName] || pokemonName;
  pokemonMovesCache = await getPokemonMovesGen7(apiName);
  pokemonMovesCache.sort(); // alphabetize

  // Wire up each move dropdown
  moveDropdowns.forEach((dd, index) => {
    setupMoveDropdown(dd, index);
  });

  setupSlotButtons();
}

function formatMoveName(name) {
  return name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function setupMoveDropdown(dropdownEl, slotIndex) {
  const header = dropdownEl.querySelector('.move-dropdown-header');
  const list = dropdownEl.querySelector('.move-dropdown-list');

  // Clone header to remove old listeners
  const newHeader = header.cloneNode(true);
  header.parentNode.replaceChild(newHeader, header);

  // Get references AFTER clone so closures use the live DOM elements
  const selectedText = newHeader.querySelector('.move-selected-text');
  const newList = dropdownEl.querySelector('.move-dropdown-list');
  const newSearchInput = dropdownEl.querySelector('.move-search-input');
  const optionsContainer = dropdownEl.querySelector('.move-options-container');

  selectedText.textContent = '-- Select Move --';
  selectedText.classList.add('text-gray-400');
  selectedText.classList.remove('text-gray-900', 'dark:text-white');

  const renderMoveOptions = (filter = '') => {
    const filtered = pokemonMovesCache.filter(m =>
      formatMoveName(m).toLowerCase().includes(filter.toLowerCase())
    );

    optionsContainer.innerHTML = filtered.map(m => `
      <div class="move-option dropdown-item px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer flex items-center text-sm dark:text-white text-gray-900" data-value="${m}">
        <span class="truncate">${formatMoveName(m)}</span>
      </div>
    `).join('');

    optionsContainer.querySelectorAll('.move-option').forEach(opt => {
      opt.addEventListener('click', async () => {
        const moveName = opt.getAttribute('data-value');
        selectedText.textContent = formatMoveName(moveName);
        selectedText.classList.remove('placeholder', 'text-gray-400');
        selectedText.classList.add('text-gray-900', 'dark:text-white');
        newList.classList.add('hidden');
        await handleMoveSelection(slotIndex, moveName);
      });
    });
  };

  newHeader.addEventListener('click', (e) => {
    e.stopPropagation();
    // Close all other move dropdowns first
    document.querySelectorAll('.move-dropdown-list').forEach(l => {
      if (l !== newList) l.classList.add('hidden');
    });
    const isHidden = newList.classList.contains('hidden');
    if (isHidden) {
      newList.classList.remove('hidden');
      newSearchInput.value = '';
      renderMoveOptions();
      newSearchInput.focus();
    } else {
      newList.classList.add('hidden');
    }
  });

  newSearchInput.addEventListener('input', (e) => {
    renderMoveOptions(e.target.value);
  });

  // Prevent clicks inside the list from bubbling to global close
  newList.addEventListener('click', (e) => e.stopPropagation());

  renderMoveOptions();

}

async function handleMoveSelection(slotIndex, moveName) {
  const slotEl = document.querySelector(`.move-slot[data-slot="${slotIndex}"]`);
  const typeLabel = slotEl.querySelector('.move-type-label');
  typeLabel.textContent = 'LOADING...';

  const details = await getMoveDetails(moveName);

  moveSlots[slotIndex] = {
    move: details,
    currentPP: details.pp,
    maxPP: details.pp
  };

  updateSlotUI(slotIndex);
  checkStruggle();
}

function updateSlotUI(index) {
  const slotEl = document.querySelector(`.move-slot[data-slot="${index}"]`);
  const slotData = moveSlots[index];

  const currentEl = slotEl.querySelector('.current-pp');
  const maxEl = slotEl.querySelector('.max-pp');
  const typeEl = slotEl.querySelector('.move-type-label');
  const decBtn = slotEl.querySelector('.decrement-btn');

  if (slotData.move) {
    currentEl.textContent = slotData.currentPP;
    maxEl.textContent = slotData.maxPP;
    typeEl.textContent = slotData.move.type;

    // Style current PP color based on threshold
    if (slotData.currentPP === 0) {
      currentEl.className = 'current-pp text-red-600 dark:text-red-500';
    } else if (slotData.currentPP <= 5 && slotData.maxPP > 5) {
      currentEl.className = 'current-pp text-orange-500';
    } else {
      currentEl.className = 'current-pp';
    }

    decBtn.disabled = slotData.currentPP <= 0;
  } else {
    currentEl.textContent = '0';
    maxEl.textContent = '0';
    typeEl.textContent = 'TYPE';
    currentEl.className = 'current-pp';
    decBtn.disabled = true;
  }
}

function updateAllSlotsUI() {
  for (let i = 0; i < 4; i++) {
    updateSlotUI(i);
  }
}

function setupSlotButtons() {
  const slots = document.querySelectorAll('.move-slot');

  slots.forEach((slotEl, index) => {
    // Dec Button: Decrement PP if > 0
    const decBtn = slotEl.querySelector('.decrement-btn');
    // Remove old listeners
    const newDecBtn = decBtn.cloneNode(true);
    decBtn.parentNode.replaceChild(newDecBtn, decBtn);

    newDecBtn.addEventListener('click', () => {
      if (moveSlots[index].currentPP > 0) {
        moveSlots[index].currentPP--;
        updateSlotUI(index);
        checkStruggle();
      }
    });

    // Override Button: Show overlay
    const overrideBtn = slotEl.querySelector('.override-btn');
    const overrideOverlay = slotEl.querySelector('.override-overlay');
    const inputCur = slotEl.querySelector('.override-current');
    const inputMax = slotEl.querySelector('.override-max');

    const newOverrideBtn = overrideBtn.cloneNode(true);
    overrideBtn.parentNode.replaceChild(newOverrideBtn, overrideBtn);

    newOverrideBtn.addEventListener('click', () => {
      inputCur.value = moveSlots[index].currentPP;
      inputMax.value = moveSlots[index].maxPP;
      overrideOverlay.classList.remove('hidden');
    });

    const cancelBtn = slotEl.querySelector('.cancel-override-btn');
    const newCancelBtn = cancelBtn.cloneNode(true);
    cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

    newCancelBtn.addEventListener('click', () => {
      overrideOverlay.classList.add('hidden');
    });

    const saveBtn = slotEl.querySelector('.save-override-btn');
    const newSaveBtn = saveBtn.cloneNode(true);
    saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);

    newSaveBtn.addEventListener('click', () => {
      let cur = parseInt(inputCur.value, 10);
      let max = parseInt(inputMax.value, 10);

      if (isNaN(cur) || cur < 0) cur = 0;
      if (isNaN(max) || max < 1) max = 1;
      if (cur > max) cur = max;

      // If there's no move but they override, create a dummy move container so it displays
      if (!moveSlots[index].move) {
        moveSlots[index].move = { type: 'overridden' };
      }

      moveSlots[index].currentPP = cur;
      moveSlots[index].maxPP = max;

      updateSlotUI(index);
      checkStruggle();
      overrideOverlay.classList.add('hidden');
    });
  });
}

function checkStruggle() {
  let totalCurrentPP = 0;
  let hasValidMove = false;

  moveSlots.forEach(slot => {
    if (slot.move) {
      hasValidMove = true;
      totalCurrentPP += slot.currentPP;
    }
  });

  const warningEl = document.getElementById('struggle-warning');
  if (hasValidMove && totalCurrentPP === 0) {
    warningEl.classList.remove('hidden');
  } else {
    warningEl.classList.add('hidden');
  }
}

function setupTransformedButton() {
  const btn = document.getElementById('btn-transformed');
  btn.addEventListener('click', () => {
    // Transform specifically sets all 4 moves to 5/5 PP of the copied moves.
    // Instead of forcing them to re-select moves first, if they have moves selected, we override them to 5/5.
    // If they don't have moves selected, we just set them to 5/5 anyway as 'overridden' type.
    moveSlots.forEach((slot, index) => {
      if (!slot.move) {
        slot.move = { type: 'transformed' };
      }
      slot.currentPP = 5;
      slot.maxPP = 5;
      updateSlotUI(index);
    });
    checkStruggle();
  });
}
