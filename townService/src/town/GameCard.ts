/** A list of 400 possible unique words that can be used for the words on the cards */
// eslint-disable-next-line prettier/prettier
export const POSSIBLE_WORDS: string[] = ["AFRICA","AGENT","AIR","ALIEN","ALPS","AMAZON","AMBULANCE","AMERICA","ANGEL","ANTARCTICA","APPLE","ARM","ATLANTIS","AUSTRALIA","AZTEC","BACK","BALL","BAND","BANK","BAR","BARK","BAT","BATTERY","BEACH","BEAR","BEAT","BED","BEIJING","BELL","BELT","BERLIN","BERMUDA","BERRY","BILL","BLOCK","BOARD","BOLT","BOMB","BOND","BOOM","BOOT","BOTTLE","BOW","BOX","BRIDGE","BRUSH","BUCK","BUFFALO","BUG","BUGLE","BUTTON","CALF","CANADA","CAP","CAPITAL","CAR","CARD","CARROT","CASINO","CAST","CAT","CELL","CENTAUR","CENTER","CHAIR","CHANGE","CHARGE","CHECK","CHEST","CHICK","CHINA","CHOCOLATE","CHURCH","CIRCLE","CLIFF","CLOAK","CLUB","CODE","COLD","COMIC","COMPOUND","CONCERT","CONDUCTOR","CONTRACT","COOK","COPPER","COTTON","COURT","COVER","CRANE","CRASH","CRICKET","CROSS","CROWN","CYCLE","CZECH","DANCE","DATE","DAY","DEATH","DECK","DEGREE","DIAMOND","DICE","DINOSAUR","DISEASE","DOCTOR","DOG","DRAFT","DRAGON","DRESS","DRILL","DROP","DUCK","DWARF","EAGLE","EGYPT","EMBASSY","ENGINE","ENGLAND","EUROPE","EYE","FACE","FAIR","FALL","FAN","FENCE","FIELD","FIGHTER","FIGURE","FILE","FILM","FIRE","FISH","FLUTE","FLY","FOOT","FORCE","FOREST","FORK","FRANCE","GAME","GAS","GENIUS","GERMANY","GHOST","GIANT","GLASS","GLOVE","GOLD","GRACE","GRASS","GREECE","GREEN","GROUND","HAM","HAND","HAWK","HEAD","HEART","HELICOPTER","HIMALAYAS","HOLE","HOLLYWOOD","HONEY","HOOD","HOOK","HORN","HORSE","HORSESHOE","HOSPITAL","HOTEL","ICE","ICE CREAM","INDIA","IRON","IVORY","JACK","JAM","JET","JUPITER","KANGAROO","KETCHUP","KEY","KID","KING","KIWI","KNIFE","KNIGHT","LAB","LAP","LASER","LAWYER","LEAD","LEMON","LEPRECHAUN","LIFE","LIGHT","LIMOUSINE","LINE","LINK","LION","LITTER","LOCH NESS","LOCK","LOG","LONDON","LUCK","MAIL","MAMMOTH","MAPLE","MARBLE","MARCH","MASS","MATCH","MERCURY","MEXICO","MICROSCOPE","MILLIONAIRE","MINE","MINT","MISSILE","MODEL","MOLE","MOON","MOSCOW","MOUNT","MOUSE","MOUTH","MUG","NAIL","NEEDLE","NET","NEW YORK","NIGHT","NINJA","NOTE","NOVEL","NURSE","NUT","OCTOPUS","OIL","OLIVE","OLYMPUS","OPERA","ORANGE","ORGAN","PALM","PAN","PANTS","PAPER","PARACHUTE","PARK","PART","PASS","PASTE","PENGUIN","PHOENIX","PIANO","PIE","PILOT","PIN","PIPE","PIRATE","PISTOL","PIT","PITCH","PLANE","PLASTIC","PLATE","PLATYPUS","PLAY","PLOT","POINT","POISON","POLE","POLICE","POOL","PORT","POST","POUND","PRESS","PRINCESS","PUMPKIN","PUPIL","PYRAMID","QUEEN","RABBIT","RACKET","RAY","REVOLUTION","RING","ROBIN","ROBOT","ROCK","ROME","ROOT","ROSE","ROULETTE","ROUND","ROW","RULER","SATELLITE","SATURN","SCALE","SCHOOL","SCIENTIST","SCORPION","SCREEN","SCUBA DIVER","SEAL","SERVER","SHADOW","SHAKESPEARE","SHARK","SHIP","SHOE","SHOP","SHOT","SINK","SKYSCRAPER","SLIP","SLUG","SMUGGLER","SNOW","SNOWMAN","SOCK","SOLDIER","SOUL","SOUND","SPACE","SPELL","SPIDER","SPIKE","SPINE","SPOT","SPRING","SPY","SQUARE","STADIUM","STAFF","STAR","STATE","STICK","STOCK","STRAW","STREAM","STRIKE","STRING","SUB","SUIT","SUPERHERO","SWING","SWITCH","TABLE","TABLET","TAG","TAIL","TAP","TEACHER","TELESCOPE","TEMPLE","THEATER","THIEF","THUMB","TICK","TIE","TIME","TOKYO","TOOTH","TORCH","TOWER","TRACK","TRAIN","TRIANGLE","TRIP","TRUNK","TUBE","TURKEY","UNDERTAKER","UNICORN","VACUUM","VAN","VET","WAKE","WALL","WAR","WASHER","WASHINGTON","WATCH","WATER","WAVE","WEB","WELL","WHALE","WHIP","WIND","WITCH","WORM","YARD"]

export enum Team {
  Blue,
  Red,
  Bomb,
  Neutral,
}

export class GameCard {
  public _name: string;

  public _team: Team;

  public _guessed: boolean;

  public _color: string;

  public constructor(name: string, team: Team, color: string) {
    this._name = name;
    this._team = team;
    this._guessed = false;
    this._color = color;
  }

  /** Function to determine if a card is assigned to the Blue Team */
  public isBlue(): boolean {
    return this._team == Team.Blue;
  }

  /** Function to determine if a card is assigned to the Red Team */
  public isRed(): boolean {
    return this._team == Team.Red;
  }

  /** Function to determine if a card is assigned as the Bomb */
  public isBomb(): boolean {
    return this._team == Team.Bomb;
  }

  /** Function to determine if a card is assigned to neutral */
  public isNeutral(): boolean {
    return this._team == Team.Neutral;
  }

  /**
   * Initializes the cards on such that each card has a name, assigned team, and a
   * randomized place on the grid
   * @returns an array of GameCards of size 25 in which the GameCards name, team, and location
   * within the array are randomly assigned
   */
  public static initializeCards(): GameCard[] {
    /** Clones the possibleWords array so we can mutate it without changing the actual state */
    const clonedPossibleWords: string[] = Object.assign([], POSSIBLE_WORDS);
    const returnArray: GameCard[] = [];
    const cardArray: GameCard[] = [];

    /** Creates an array of cards of length 25 that have randomly generated words */
    while (cardArray.length < 25) {
      /** Selects a random index for which a word can be taken from the cloned array of words */
      const newIndex: number = Math.floor(Math.random() * (clonedPossibleWords.length + 1));
      const newWord: string = clonedPossibleWords[newIndex];

      /**
       * Assigns the team to the card such that there are 8 Blue, 8 Red, 1 Bomb, and the remaining * 8 Neutral on a game board
       */
      let team: Team;
      let color: string;
      if (cardArray.length < 8) {
        team = 0;
        color = 'blue';
      } else if (cardArray.length < 16) {
        team = 1;
        color = 'red';
      } else if (cardArray.length === 16) {
        team = 2;
        color = 'black';
      } else {
        team = 3;
        color = 'gray';
      }

      /** Creates a card from the string and team above and adds it to the array */
      const newCard: GameCard = new GameCard(newWord, team, color);
      cardArray.push(newCard);

      /** Removes the card from the possible words so there are no duplicate words on the board */
      clonedPossibleWords.filter(name => name !== newWord);
    }

    /** Uses the card array to randomly place the cards in the list of cards */
    for (let idx = 0; idx < cardArray.length; idx++) {
      /** Selects a random index for which a card can be taken from the cardArray */
      const cardArrayIndex: number = Math.floor(Math.random() * (cardArray.length + 1));
      const newCard: GameCard = cardArray[cardArrayIndex];

      /** Assigns the new card to the current location */
      returnArray[idx] = newCard;

      /** Removes the card from the cardArray so there are no duplicate words on the board */
      cardArray.filter(card => card._name !== newCard._name);
    }
    return returnArray;
  }
}