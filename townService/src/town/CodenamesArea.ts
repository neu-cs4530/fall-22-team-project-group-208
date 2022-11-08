import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import Player from '../lib/Player';
import { BoundingBox, TownEmitter } from '../types/CoveyTownSocket';
import InteractableArea from './InteractableArea';

/** A list of 400 possible unique words that can be used for the words on the cards */
const possibleWords: string[] = ["AFRICA","AGENT","AIR","ALIEN","ALPS","AMAZON","AMBULANCE","AMERICA","ANGEL","ANTARCTICA","APPLE","ARM","ATLANTIS","AUSTRALIA","AZTEC","BACK","BALL","BAND","BANK","BAR","BARK","BAT","BATTERY","BEACH","BEAR","BEAT","BED","BEIJING","BELL","BELT","BERLIN","BERMUDA","BERRY","BILL","BLOCK","BOARD","BOLT","BOMB","BOND","BOOM","BOOT","BOTTLE","BOW","BOX","BRIDGE","BRUSH","BUCK","BUFFALO","BUG","BUGLE","BUTTON","CALF","CANADA","CAP","CAPITAL","CAR","CARD","CARROT","CASINO","CAST","CAT","CELL","CENTAUR","CENTER","CHAIR","CHANGE","CHARGE","CHECK","CHEST","CHICK","CHINA","CHOCOLATE","CHURCH","CIRCLE","CLIFF","CLOAK","CLUB","CODE","COLD","COMIC","COMPOUND","CONCERT","CONDUCTOR","CONTRACT","COOK","COPPER","COTTON","COURT","COVER","CRANE","CRASH","CRICKET","CROSS","CROWN","CYCLE","CZECH","DANCE","DATE","DAY","DEATH","DECK","DEGREE","DIAMOND","DICE","DINOSAUR","DISEASE","DOCTOR","DOG","DRAFT","DRAGON","DRESS","DRILL","DROP","DUCK","DWARF","EAGLE","EGYPT","EMBASSY","ENGINE","ENGLAND","EUROPE","EYE","FACE","FAIR","FALL","FAN","FENCE","FIELD","FIGHTER","FIGURE","FILE","FILM","FIRE","FISH","FLUTE","FLY","FOOT","FORCE","FOREST","FORK","FRANCE","GAME","GAS","GENIUS","GERMANY","GHOST","GIANT","GLASS","GLOVE","GOLD","GRACE","GRASS","GREECE","GREEN","GROUND","HAM","HAND","HAWK","HEAD","HEART","HELICOPTER","HIMALAYAS","HOLE","HOLLYWOOD","HONEY","HOOD","HOOK","HORN","HORSE","HORSESHOE","HOSPITAL","HOTEL","ICE","ICE CREAM","INDIA","IRON","IVORY","JACK","JAM","JET","JUPITER","KANGAROO","KETCHUP","KEY","KID","KING","KIWI","KNIFE","KNIGHT","LAB","LAP","LASER","LAWYER","LEAD","LEMON","LEPRECHAUN","LIFE","LIGHT","LIMOUSINE","LINE","LINK","LION","LITTER","LOCH NESS","LOCK","LOG","LONDON","LUCK","MAIL","MAMMOTH","MAPLE","MARBLE","MARCH","MASS","MATCH","MERCURY","MEXICO","MICROSCOPE","MILLIONAIRE","MINE","MINT","MISSILE","MODEL","MOLE","MOON","MOSCOW","MOUNT","MOUSE","MOUTH","MUG","NAIL","NEEDLE","NET","NEW YORK","NIGHT","NINJA","NOTE","NOVEL","NURSE","NUT","OCTOPUS","OIL","OLIVE","OLYMPUS","OPERA","ORANGE","ORGAN","PALM","PAN","PANTS","PAPER","PARACHUTE","PARK","PART","PASS","PASTE","PENGUIN","PHOENIX","PIANO","PIE","PILOT","PIN","PIPE","PIRATE","PISTOL","PIT","PITCH","PLANE","PLASTIC","PLATE","PLATYPUS","PLAY","PLOT","POINT","POISON","POLE","POLICE","POOL","PORT","POST","POUND","PRESS","PRINCESS","PUMPKIN","PUPIL","PYRAMID","QUEEN","RABBIT","RACKET","RAY","REVOLUTION","RING","ROBIN","ROBOT","ROCK","ROME","ROOT","ROSE","ROULETTE","ROUND","ROW","RULER","SATELLITE","SATURN","SCALE","SCHOOL","SCIENTIST","SCORPION","SCREEN","SCUBA DIVER","SEAL","SERVER","SHADOW","SHAKESPEARE","SHARK","SHIP","SHOE","SHOP","SHOT","SINK","SKYSCRAPER","SLIP","SLUG","SMUGGLER","SNOW","SNOWMAN","SOCK","SOLDIER","SOUL","SOUND","SPACE","SPELL","SPIDER","SPIKE","SPINE","SPOT","SPRING","SPY","SQUARE","STADIUM","STAFF","STAR","STATE","STICK","STOCK","STRAW","STREAM","STRIKE","STRING","SUB","SUIT","SUPERHERO","SWING","SWITCH","TABLE","TABLET","TAG","TAIL","TAP","TEACHER","TELESCOPE","TEMPLE","THEATER","THIEF","THUMB","TICK","TIE","TIME","TOKYO","TOOTH","TORCH","TOWER","TRACK","TRAIN","TRIANGLE","TRIP","TRUNK","TUBE","TURKEY","UNDERTAKER","UNICORN","VACUUM","VAN","VET","WAKE","WALL","WAR","WASHER","WASHINGTON","WATCH","WATER","WAVE","WEB","WELL","WHALE","WHIP","WIND","WITCH","WORM","YARD"]

enum Turn {
  TeamOneSpymaster,
  TeamOneOperative,
  TeamTwoSpymaster,
  TeamTwoOperative,
}

enum Team {
  Blue,
  Red,
  Bomb,
  Neutral
}

class GameCard {
  public _name: string;
  public _team: Team;

  public constructor(name: string, team: Team) {
    this._name = name;
    this._team = team;
  }

  public isBlue(): boolean {
    return this._team === 0;
  }

  public isRed(): boolean {
    return this._team === 1;
  }

  public isBomb(): boolean {
    return this._team === 2;
  }

  public isNeutral(): boolean {
    return this._team === 3;
  }
}

export default class CodenamesArea extends InteractableArea {
  /* Whether or not the game is currently actively in play. 
       Game can only be active if all roles filled. */
  private _isActive: boolean;

  /* The current player whose turn is active. */
  public _turn: Turn;

  /* The spymaster for team one. */
  private _teamOneSpymaster: Player;

  /* The operative for team one. */
  private _teamOneOperative: Player;

  /* The spymaster for team two. */
  private _teamTwoSpymaster: Player;

  /* The operative for team two. */
  private _teamTwoOperative: Player;

  /* The board(To be implemented after Card object type created) */
  // private board : Card[];

  /* The currently active hint word issued by the spymaster. */
  private _hint: String;

  /* The number of words relevant to the hint issued by the spymaster */
  private _hintedAmount: number;

  /* The amount of words for Team 1 that have not been revealed. */
  private _teamOneWordsRemaining: number;

  /* The amount of words for Team 2 that have not been revealed. */
  private _teamTwoWordsRemaining: number;

  // TODO: id should be replaced with a CodenamesAreaModel in CoveyTownSocket.d.ts
  public constructor(id: string, coordinates: BoundingBox, townEmitter: TownEmitter) {
    super(id, coordinates, townEmitter);
  }

  /**
   * Assigns the player to a role, if there is any undefined role.
   *
   * The player must already be in the CodenamesArea to join an undefined role.
   *
   * @param player Player to add.
   */
  public joinPlayer(player: Player): void {
    if (this._occupants.find(_player => _player.id === player.id)) {
      if (this._teamOneSpymaster === undefined) {
        this._teamOneSpymaster = player;
      }
      if (this._teamTwoSpymaster === undefined) {
        this._teamTwoSpymaster = player;
      }
      if (this._teamOneOperative === undefined) {
        this._teamOneOperative = player;
      }
      if (this._teamTwoOperative === undefined) {
        this._teamTwoOperative = player;
      }
    }
  }

  /**
   * Removes the player from the game, and removes the player from its role.
   *
   * The player must be assigned to a role to be removed.
   *
   * If game is still active when the player leaves, set the game activity to false.
   *
   * @param player Player to remove.
   */
  public removePlayer(player: Player): void {
    throw new Error('Not yet implemented');
  }

  /**
   * Sets the current hint and the amount of words the hint belongs to.
   *
   * (TBD making sure that only a spymaster whose turn is the current turn can make a hint)
   *
   * @param hint The word to set as the hint.
   * @param hintedAmount The amount of words within the board that this hint correlates with.
   */
  public setHint(hint: string, hintedAmount: number): void {
    this._hint = hint;
    this._hintedAmount = hintedAmount;
  }

  /**
   * Submits a guess for specified tiles. Also updates game state based on the guesses.(Will be more specific once we discuss more)
   *
   * Guesses must be unrevealed and within bounds of the board.
   *
   * (TBD making sure that only an operative whose turn is the current turn can make a guess)
   *
   * @param guesses The coordinates within the grid that is being guessed.
   */

  /**
   * Convert this ConversationArea instance to a simple ConversationAreaModel suitable for
   * transporting over a socket to a client.
   */
  public toModel(): CodenamesAreaModel {
    throw new Error('To be implemented');
  }

  /**
   * Creates a new CodenamesArea object that will represent a Codenames Area object in the town map.
   * @param mapObject An ITiledMapObject that represents a rectangle in which this codenames area exists
   * @param townEmitter An emitter that can be used by this codenames area to broadcast updates to players in the town
   * @returns
   */
  public static fromMapObject(mapObject: ITiledMapObject, townEmitter: TownEmitter): CodenamesArea {
    const { name, width, height } = mapObject;
    if (!width || !height) {
      throw new Error(`Malformed viewing area ${name}`);
    }
    const rect: BoundingBox = { x: mapObject.x, y: mapObject.y, width, height };
    return new CodenamesArea(name, rect, townEmitter); // TODO: need to modify this once CodenamesArea constructor is changed
  }

  /**
   * Initializes the cards on the board such that each card has a name, assigned team, and a 
   * location on the grid
   * @returns a 2D array of GameCards of size 5x5 in which the GameCards name, team, and location 
   * within the grid are randomly assigned
   */
  public initializeCards(): GameCard[][] {
    /** Clones the possibleWords array so we can mutate it without changing the actual state */
    const clonedPossibleWords: string[]  = Object.assign([], possibleWords);
    let returnArray: GameCard[][] = [];
    let cardArray: GameCard[] = [];

    /** Creates an array of cards of length 25 that have randomly generated words */
    while (cardArray.length < 25) {
      /** Selects a random index for which a word can be taken from the cloned array of words */
      let newIndex: number = Math.floor(Math.random() * (clonedPossibleWords.length + 1));
      let newWord: string = clonedPossibleWords[newIndex];

      /**
       * Assigns the team to the card such that there are 8 Blue, 8 Red, 1 Bomb, and the remaining * 8 Neutral on a game board
       */
      let team: Team;
      if (cardArray.length < 8) {
        team = 0;
      }
      else if (cardArray.length < 16) {
        team = 1;
      }
      else if (cardArray.length === 16) {
        team = 2;
      }
      else {
        team = 3;
      }

      /** Creates a card from the string and team above and adds it to the array */
      let newCard: GameCard = new GameCard(newWord, team);
      cardArray.push(newCard);

      /** Removes the card from the possible words so there are no duplicate words on the board */
      clonedPossibleWords.filter(name => name !== newWord);
    }

    /** Uses the cardArray created above to randomly place the cards in a 5x5 grid */
    for (let row = 0; row < 5; row++) {
      for (let column = 0; column < 5; column++) {
        /** Selects a random index for which a card can be taken from the cardArray */
        let cardArrayIndex: number = Math.floor(Math.random() * (cardArray.length + 1));
        let newCard: GameCard = cardArray[cardArrayIndex];

        /** Assigns the new card to the current location */
        returnArray[row][column] = newCard;

        /** Removes the card from the cardArray so there are no duplicate words on the board */
        cardArray.filter(card => card._name !== newCard._name);
      }
    }
    return returnArray;
  }
}
