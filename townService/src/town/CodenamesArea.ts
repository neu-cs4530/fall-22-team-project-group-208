import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import Player from '../lib/Player';
import { BoundingBox, TownEmitter } from '../types/CoveyTownSocket';
import InteractableArea from './InteractableArea';
import { POSSIBLE_WORDS, Team, GameCard } from './GameCard';

enum Turn {
  BlueSpymaster,
  BlueOperative,
  RedSpymaster,
  RedOperative,
}

const CARDS_ON_BOARD_COUNT : number = 25;
const CARDS_FOR_BLUE_TEAM : number = 9; // Blue gets an extra card since Blue goes first
const CARDS_FOR_RED_TEAM : number = 8;

export default class CodenamesArea extends InteractableArea {
  /* Whether or not the game is currently actively in play. 
       Game can only be active if all roles filled. */
  private _isActive: boolean;

  /* The current player whose turn is active. */
  public _turn: Turn;

  /* The spymaster for team one. */
  private _blueSpymasterId?: number;

  /* The operative for team one. */
  private _blueOperativeId?: number;

  /* The spymaster for team two. */
  private _redSpymasterId?: number;

  /* The operative for team two. */
  private _redOperativeId?: number;

  /* The board */
  private _board : GameCard[];

  /* The currently active hint word issued by the spymaster. */
  private _hint?: String;

  /* The number of words relevant to the hint issued by the spymaster */
  private _hintedAmount?: number;

  /* The amount of words for Team 1 that have not been revealed. */
  private _blueWordsRemaining: number;

  /* The amount of words for Team 2 that have not been revealed. */
  private _redWordsRemaining: number;

  /* The winner of the most recent match. */
  private _winningTeam?: Team;

  // TODO: id should be replaced with a CodenamesAreaModel in CoveyTownSocket.d.ts
  public constructor(id: string, coordinates: BoundingBox, townEmitter: TownEmitter) {
    super(id, coordinates, townEmitter);
    this._isActive = false;
    this._turn = Turn.BlueSpymaster;
    this._board = [];
    this._blueWordsRemaining = 0;
    this._redWordsRemaining = 0;
  }

  /**
   * Checks if all 4 roles have been fulfilled, and if so, generates the board, starts the game, and sets the starting player as the Blue Spymaster.
   * 
   * Generates 9 blue cards, 8 red cards, and 1 assassin card. All other cards will be neutral.
   */
  private attemptToStartGame(): void {
    if (this._blueSpymasterId !== undefined && this._redSpymasterId !== undefined 
      && this._blueOperativeId !== undefined && this._redOperativeId !== undefined) {
        this._board = GameCard.initializeCards();
        this._isActive = true;
        this._turn = Turn.BlueSpymaster;
    }
  }

  /**
   * Assigns the player to a role, if there is any undefined role.
   * 
   * Attempts to start the game, and game will start if all 4 roles are fulfilled.
   *
   * @param playerId Player ID to add.
   */
  public joinPlayer(playerId: number): void {
    if (this._blueSpymasterId === undefined) {
      this._blueSpymasterId = playerId;
      this.attemptToStartGame();
    }
    else if (this._redSpymasterId === undefined) {
      this._redSpymasterId = playerId;
      this.attemptToStartGame();
    }
    else if (this._blueOperativeId === undefined) {
      this._blueOperativeId = playerId;
      this.attemptToStartGame();
    }
    else if (this._redOperativeId === undefined) {
      this._redOperativeId = playerId;
      this.attemptToStartGame();
    }
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
  public removePlayer(playerId: number): void {
    if (this._blueSpymasterId === playerId) {
      this._blueSpymasterId = undefined;
      this._isActive = false;
    }
    else if (this._redSpymasterId === playerId) {
      this._redSpymasterId = undefined;
      this._isActive = false;
    }
    else if (this._blueOperativeId === playerId) {
      this._blueOperativeId = undefined;
      this._isActive = false;
    }
    else if (this._redOperativeId === playerId) {
      this._redOperativeId = undefined;
      this._isActive = false;
    }  
  }

  /**
   * Sets the current hint and the amount of words the hint belongs to. Transitions the next turn to the team's Operative.
   *
   * @param hint The word to set as the hint.
   * @param hintedAmount The amount of words within the board that this hint correlates with.
   */
  public setHint(hint: string, hintedAmount: number): void {
    if (this._turn == Turn.BlueSpymaster) {
      this._hint = hint;
      this._hintedAmount = hintedAmount;
      this._turn = Turn.BlueOperative;
    }
    else if (this._turn == Turn.RedSpymaster) {
      this._hint = hint;
      this._hintedAmount = hintedAmount;
      this._turn = Turn.RedOperative;
    }
  }

  /**
   * Checks if all guesses within a list of guesses are valid.
   * 
   * @param guesses The coordinates within the grid that is being guessed.
   */
  private allGuessesValid(guesses: number[]): boolean {
    let _allGuessesValid : boolean = true;
    guesses.forEach((guess) => {
      if (guess < 0 || guess >= this._board.length || this._board[guess]._guessed == true) {
        _allGuessesValid = false;
      }
    });
    return _allGuessesValid;
  }

  /**
   * Submits a guess for specified tiles.
   *
   * Guesses must be unrevealed and within bounds of the board. If either of these conditions are violated by any guess, then none of the guesses will be played.
   *
   * Reveals cards, and determines the next turn/whether or not a team has won this round.
   * 
   * @param guesses The coordinates within the grid that is being guessed.
   */
  public makeGuess(guesses: number[]): void {
    if (this.allGuessesValid(guesses)) {
      let allGuessesCorrect = true;
      let bombFound = false;
      let activeTeamColor = Team.Neutral;
      let opposingTeamColor = Team.Neutral;
  
      if (this._turn == Turn.BlueOperative) {
        activeTeamColor = Team.Blue;
        opposingTeamColor = Team.Red;
      }
      else if (this._turn == Turn.RedOperative) {
        activeTeamColor = Team.Red;
        opposingTeamColor = Team.Blue;
      }
      else {
        return;
      }

      guesses.forEach((guess) => {
        const currentCard : GameCard = this._board[guess];
        if (currentCard._team == Team.Bomb) {
          bombFound = true;
        }
        else if (currentCard._team != activeTeamColor) {
          allGuessesCorrect = false;
        }

        if (currentCard._team == Team.Blue) {
          this._blueWordsRemaining -= 1;
        }
        else if (currentCard._team == Team.Red) {
          this._redWordsRemaining -= 1;
        }
        currentCard._guessed = true;
      });

      if (bombFound) {
        this._winningTeam = opposingTeamColor;
        this._isActive = false;
      }
      else {
        if (activeTeamColor == Team.Blue) {
          if (allGuessesCorrect) {
            this._turn = Turn.BlueSpymaster;
          }
          else {
            this._turn = Turn.RedSpymaster;
          }
        }
        else if (activeTeamColor == Team.Red) {
          if (allGuessesCorrect) {
            this._turn = Turn.RedSpymaster;
          }
          else {
            this._turn = Turn.BlueSpymaster;
          }
        }
      }

      if (this._blueWordsRemaining == 0) {
        this._winningTeam = Team.Blue;
        this._isActive = false;
      }
      else if (this._redWordsRemaining == 0) {
        this._winningTeam = Team.Red;
        this._isActive = false;
      }

    }
  }

  /**
   * Convert this ConversationArea instance to a simple ConversationAreaModel suitable for
   * transporting over a socket to a client.
   */
  public toModel(): InteractableArea {
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
}
