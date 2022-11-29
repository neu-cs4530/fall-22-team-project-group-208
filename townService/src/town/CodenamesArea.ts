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
  /* The current player whose turn is active. */
  private _turn: string;

  /* A struct to represent all roles in a Codenames game */
  private _roles: {
    teamOneSpymaster: string | undefined;
    teamOneOperative: string | undefined;
    teamTwoSpymaster: string | undefined;
    teamTwoOperative: string | undefined;
  };

  /* The codenames game board */
  private _board: GameCard[];

  /* The currently active hint word and quantity of cards associated with the word issued by the spymaster. */
  private _hint: { word: string; quantity: string };

  /* The amount of words for Team 1 that have not been revealed. */
  private _blueWordsRemaining: number;

  /* The amount of words for Team 2 that have not been revealed. */
  private _redWordsRemaining: number;

  /* The number of players currently in the game. */
  private _playerCount: number;

  /* The game over state, including if the game is over and which team won if the game is over. */
  private _isGameOver: { state: boolean; team: string };

  /**
   * Creates a new CodenamesArea
   * @param id the name of the area
   * @param coordinates the bounding box that defines this codenames area
   * @param townEmitter a broadcast emitter that can be used to emit updates to players
   */
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
    this._blueWordsRemaining = CARDS_FOR_BLUE_TEAM;
    this._redWordsRemaining = CARDS_FOR_RED_TEAM;
    this._playerCount = 0;
    this._board = [];
    this._isGameOver = { state: false, team: '' };
  }

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
    return new CodenamesArea(name, rect, townEmitter);
  }
}
