import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import {
  BoundingBox,
  CodenamesArea as CodenamesAreaModel,
  TownEmitter,
  GameCard,
} from '../types/CoveyTownSocket';
import InteractableArea from './InteractableArea';

// const CARDS_ON_BOARD_COUNT = 25;
const CARDS_FOR_BLUE_TEAM = 8;
const CARDS_FOR_RED_TEAM = 8;

export default class CodenamesArea extends InteractableArea {
  /* Whether or not the game is currently actively in play. 
       Game can only be active if all roles filled. */
  private _isActive: boolean;

  /* The current player whose turn is active. */
  private _turn: string;

  /* A struct to represent all roles in a Codenames game */
  private _roles: {
    teamOneSpymaster: string | undefined;
    teamOneOperative: string | undefined;
    teamTwoSpymaster: string | undefined;
    teamTwoOperative: string | undefined;
  };

  /* The board */
  private _board: GameCard[];

  /* The currently active hint word issued by the spymaster. */
  private _hint: { word: string; quantity: string };

  /* The amount of words for Team 1 that have not been revealed. */
  private _blueWordsRemaining: number;

  /* The amount of words for Team 2 that have not been revealed. */
  private _redWordsRemaining: number;

  /* The winner of the most recent match. */
  private _winningTeam?: string;

  /* The players currently in the game. */
  private _playerCount: number;

  /* The game over state. */
  private _isGameOver: { state: boolean; team: string };

  // TODO: id should be replaced with a CodenamesAreaModel in CoveyTownSocket.d.ts
  public constructor(id: string, coordinates: BoundingBox, townEmitter: TownEmitter) {
    super(id, coordinates, townEmitter);
    this._isActive = false;
    this._turn = 'Spy1';
    this._roles = {
      teamOneSpymaster: undefined,
      teamOneOperative: undefined,
      teamTwoSpymaster: undefined,
      teamTwoOperative: undefined,
    };
    this._hint = { word: '', quantity: '0' };
    this._blueWordsRemaining = CARDS_FOR_BLUE_TEAM;
    this._redWordsRemaining = CARDS_FOR_RED_TEAM;
    this._playerCount = 0;
    this._board = [];
    this._isGameOver = { state: false, team: '' };
  }

  /**
   * Checks if all 4 roles have been fulfilled, and if so, generates the board, starts the game, and sets the starting player as the Blue Spymaster.
   *
   * Generates 9 blue cards, 8 red cards, and 1 assassin card. All other cards will be neutral.
   */
  private _attemptToStartGame(): void {
    if (
      this._roles.teamOneSpymaster !== undefined &&
      this._roles.teamTwoSpymaster !== undefined &&
      this._roles.teamOneOperative !== undefined &&
      this._roles.teamTwoOperative !== undefined
    ) {
      this._board = [];
      this._isActive = true;
    }
  }

  /**
   * Assigns the player to a role, if there is any undefined role.
   *
   * Attempts to start the game, and game will start if all 4 roles are fulfilled.
   *
   * @param playerId Player ID to add.
   */
  public joinPlayer(playerId: string): void {
    if (this._roles.teamOneSpymaster === undefined) {
      this._roles.teamOneSpymaster = playerId;
    } else if (this._roles.teamTwoSpymaster === undefined) {
      this._roles.teamTwoSpymaster = playerId;
    } else if (this._roles.teamOneOperative === undefined) {
      this._roles.teamOneOperative = playerId;
    } else if (this._roles.teamTwoOperative === undefined) {
      this._roles.teamTwoOperative = playerId;
    }
    this._attemptToStartGame();
  }

  /**
   * Removes the player from the game, and removes the player from its role.
   *
   * The player must be assigned to a role to be removed.
   *
   * If game is still active when the player leaves, set the game activity to false(This ends the game).
   *
   * @param player Player ID to remove.
   */
  public removePlayer(playerId: string): void {
    if (this._roles.teamOneSpymaster === playerId) {
      this._roles.teamOneSpymaster = undefined;
    } else if (this._roles.teamTwoSpymaster === playerId) {
      this._roles.teamTwoSpymaster = undefined;
    } else if (this._roles.teamOneOperative === playerId) {
      this._roles.teamOneOperative = undefined;
    } else if (this._roles.teamTwoOperative === playerId) {
      this._roles.teamTwoOperative = undefined;
    }
    this._isActive = false;
  }

  /**
   * Changes the turn given the current turn
   *
   * @param turn The current game turn
   */
  private _changeTurn() {
    switch (this._turn) {
      case 'Spy1':
        this._turn = 'Op1';
        break;
      case 'Spy2':
        this._turn = 'Op2';
        break;
      case 'Op1':
        this._turn = 'Spy2';
        break;
      case 'Op2':
        this._turn = 'Spy1';
        break;
      default:
        // Technically, this error should never throw in the actual game lol
        throw new Error('this._turn must be one of the four');
    }
  }

  /**
   * Sets the current hint and the amount of words the hint belongs to. Transitions the next turn to the team's Operative.
   *
   * @param hint The word to set as the hint.
   * @param hintedAmount The amount of words within the board that this hint correlates with.
   */
  public setHint(hint: { word: string; quantity: string }): void {
    this._hint = hint;
    this._changeTurn();
    // if (this._turn == 'Spy1') {
    //   this._hint = hint;
    //   this._turn = 'Op1'
    // } else if (this._turn == 'Turn.RedSpymaster') {
    //   this._hint = hint;
    //   this._hintedAmount = hintedAmount;
    //   this._turn = Turn.RedOperative;
    // }
  }

  // /**
  //  * Checks if all guesses within a list of guesses are valid.
  //  *
  //  * @param guesses The coordinates within the grid that is being guessed.
  //  */
  // private _allGuessesValid(guesses: number[]): boolean {
  //   let allGuessesValid = true;
  //   guesses.forEach(guess => {
  //     if (guess < 0 || guess >= this._board.length || this._board[guess]._guessed === true) {
  //       allGuessesValid = false;
  //     }
  //   });
  //   return allGuessesValid;
  // }

  // /**
  //  * Submits a guess for specified tiles.
  //  *
  //  * Guesses must be unrevealed and within bounds of the board. If either of these conditions are violated by any guess, then none of the guesses will be played.
  //  *
  //  * Reveals cards, and determines the next turn/whether or not a team has won this round.
  //  *
  //  * @param guesses the "index" of the card being guessed
  //  */
  // public makeGuess(guesses: number[]): void {
  //   if (this._allGuessesValid(guesses)) {
  //     let allGuessesCorrect = true;
  //     let bombFound = false;
  //     let activeTeamColor = Team.Neutral;
  //     let opposingTeamColor = Team.Neutral;

  //     if (this._turn === 'Op1') {
  //       activeTeamColor = Team.Blue;
  //       opposingTeamColor = Team.Red;
  //     } else if (this._turn === 'Op2') {
  //       activeTeamColor = Team.Red;
  //       opposingTeamColor = Team.Blue;
  //     } else {
  //       return;
  //     }

  //     guesses.forEach(guess => {
  //       const currentCard: GameCard = this._board[guess];
  //       if (currentCard._team === Team.Bomb) {
  //         bombFound = true;
  //       } else if (currentCard._team !== activeTeamColor) {
  //         allGuessesCorrect = false;
  //       }

  //       if (currentCard._team === Team.Blue) {
  //         this._blueWordsRemaining -= 1;
  //       } else if (currentCard._team === Team.Red) {
  //         this._redWordsRemaining -= 1;
  //       }
  //       currentCard._guessed = true;
  //     });

  //     if (bombFound) {
  //       this._winningTeam = opposingTeamColor;
  //       this._isActive = false;
  //     } else if (activeTeamColor === Team.Blue) {
  //       if (allGuessesCorrect) {
  //         this._turn = 'Spy1';
  //       } else {
  //         this._turn = 'Spy2';
  //       }
  //     } else if (activeTeamColor === Team.Red) {
  //       if (allGuessesCorrect) {
  //         this._turn = 'Spy2';
  //       } else {
  //         this._turn = 'Spy1';
  //       }
  //     }

  //     if (this._blueWordsRemaining === 0) {
  //       this._winningTeam = Team.Blue;
  //       this._isActive = false;
  //     } else if (this._redWordsRemaining === 0) {
  //       this._winningTeam = Team.Red;
  //       this._isActive = false;
  //     }
  //   }
  // }

  /**
   * Convert this CodenamesArea instance to a simple CodenamesAreaModel suitable for
   * transporting over a socket to a client.
   */
  public toModel(): CodenamesAreaModel {
    return {
      id: this.id,
      turn: this._turn,
      occupantsID: this.occupantsByID,
      roles: this._roles,
      hint: this._hint,
      teamOneWordsRemaining: this._blueWordsRemaining,
      teamTwoWordsRemaining: this._redWordsRemaining,
      playerCount: this._playerCount,
      board: this._board,
      isGameOver: this._isGameOver,
    };
  }

  /**
   * Updates the state of this CodenamesArea
   *
   * @param codenamesArea updated model
   */
  public updateModel({
    turn,
    roles,
    hint,
    teamOneWordsRemaining,
    teamTwoWordsRemaining,
    playerCount,
    board,
    isGameOver,
  }: CodenamesAreaModel) {
    this._turn = turn;
    this._roles = roles;
    this._hint = hint;
    this._blueWordsRemaining = teamOneWordsRemaining;
    this._redWordsRemaining = teamTwoWordsRemaining;
    this._playerCount = playerCount;
    this._board = board;
    this._isGameOver = isGameOver;
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
}
