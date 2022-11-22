import { ITiledMapObject } from '@jonbell/tiled-map-type-guard';
import Player from '../lib/Player';
import {
  BoundingBox,
  TownEmitter,
  CodenamesArea as CodenamesAreaModel,
  Player as PlayerModel,
} from '../types/CoveyTownSocket';
import InteractableArea from './InteractableArea';

export default class CodenamesArea extends InteractableArea {
  /* The current player whose turn is active. */
  public _turn: string;

  /* The roles for each team */
  private _roles: {
    teamOneSpymaster: string | undefined;
    teamOneOperative: string | undefined;
    teamTwoSpymaster: string | undefined;
    teamTwoOperative: string | undefined;
  };

  /* The board(To be implemented after Card object type created) */
  // private board : Card[];

  /* The currently active hint word issued by the spymaster. */
  private _hint: { word: string; quantity: string };

  /* The amount of words for Team 1 that have not been revealed. */
  private _teamOneWordsRemaining: number;

  /* The amount of words for Team 2 that have not been revealed. */
  private _teamTwoWordsRemaining: number;

  /* The players currently in the game. */
  private _playerCount: number;

  // TODO: id should be replaced with a CodenamesAreaModel in CoveyTownSocket.d.ts
  public constructor(id: string, coordinates: BoundingBox, townEmitter: TownEmitter) {
    super(id, coordinates, townEmitter);
    this._turn = 'Spy1';
    this._roles = {
      teamOneSpymaster: undefined,
      teamOneOperative: undefined,
      teamTwoSpymaster: undefined,
      teamTwoOperative: undefined,
    };
    this._hint = { word: '', quantity: '0' };
    this._teamOneWordsRemaining = 8;
    this._teamTwoWordsRemaining = 8;
    this._playerCount = 0;
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
      if (this._roles.teamOneSpymaster === undefined) {
        this._roles.teamOneSpymaster = player.id;
      }
      if (this._roles.teamTwoSpymaster === undefined) {
        this._roles.teamTwoSpymaster = player.id;
      }
      if (this._roles.teamOneOperative === undefined) {
        this._roles.teamOneOperative = player.id;
      }
      if (this._roles.teamTwoOperative === undefined) {
        this._roles.teamTwoOperative = player.id;
      }
      this._playerCount++;
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
    super.remove(player);
    // remove player from their role
  }

  /**
   * Sets the current hint and the amount of words the hint belongs to.
   *
   * (TBD making sure that only a spymaster whose turn is the current turn can make a hint)
   *
   * @param hint The word to set as the hint.
   * @param hintedAmount The amount of words within the board that this hint correlates with.
   */
  public setHint(hint: { word: string; quantity: string }): void {
    this._hint = hint;
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
    return {
      id: this.id,
      occupantsID: this._occupants.map(player => player.id),
      turn: this._turn,
      roles: this._roles,
      hint: { word: this._hint.word, quantity: this._hint.quantity },
      teamOneWordsRemaining: this._teamOneWordsRemaining,
      teamTwoWordsRemaining: this._teamTwoWordsRemaining,
      playerCount: this._playerCount,
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
  }: CodenamesAreaModel) {
    this._turn = turn;
    this._roles = roles;
    this._hint = hint;
    this._teamOneWordsRemaining = teamOneWordsRemaining;
    this._teamTwoWordsRemaining = teamTwoWordsRemaining;
    this._playerCount = playerCount;
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
      throw new Error(`Malformed codenames area ${name}`);
    }
    const rect: BoundingBox = { x: mapObject.x, y: mapObject.y, width, height };
    return new CodenamesArea(name, rect, townEmitter); // TODO: need to modify this once CodenamesArea constructor is changed
  }
}
