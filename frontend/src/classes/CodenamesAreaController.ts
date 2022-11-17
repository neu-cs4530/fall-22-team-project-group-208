import EventEmitter from 'events';
import _, { TruncateOptions } from 'lodash';
import { useEffect, useState } from 'react';
import TypedEmitter from 'typed-emitter';
// import { CodenamesArea as CodenamesAreaModel, Player } from '../types/CoveyTownSocket';
import { Player } from '../types/CoveyTownSocket';
import PlayerController from './PlayerController';

/**
 * The events that the CodenamesAreaController emits to subscribers. These events
 * are only ever emitted to local components (not to the townService).
 */
export type CodenamesAreaEvents = {
  /**
   * An event that indicates the players in the Codenames Area has changed.
   */
  occupantsChange: (newOccupants: PlayerController[]) => void;
  /**
   * An event that indicates a player has been assigned to or unassigned from a role.
   */
  roleChange: (newPlayer: PlayerController) => void;
  /**
   * An event that indicates the team's whose turn it is has changed.
   */
  turnChange: (updatedTurn: Turn) => void;
  /**
   * An event that indicates the cards on the gameboard have changed. This refers to cases where cards have been guessed.
   */
  // cardChange: (newCards: GameCard[][]) => void;
  /**
   * An event that indicates the hint for the turn has changed.
   */
  hintChange: (newHint: { word: string; quantity: number }) => void;
};

/**
 * An enum to represent whose turn it is in the current game.
 */
enum Turn {
  TeamOneSpymaster,
  TeamOneOperative,
  TeamTwoSpymaster,
  TeamTwoOperative,
}

/**
 * A CodenamesAreaController manages the local behavior of a codenames area in the frontend,
 * implementing the logic to bridge between the townService's interpretation of codenames areas and the
 * frontend's. The CodenamesAreaController emits events when the codenames area changes.
 */
export default class CodenamesAreaController extends (EventEmitter as new () => TypedEmitter<CodenamesAreaEvents>) {
  private _occupants: PlayerController[] = [];

  private _id: string;

  /* Whether or not the game is currently active in play,
   * and game can only be active if all roles are filled.
   */
  private _isActive: boolean;

  /* The current player whose turn is active.
   * Default value is represented by null when game has not started yet
   */
  private _turn: Turn | null;

  /* The spymaster for team one. */
  private _teamOneSpymaster: PlayerController | null;

  /* The operative for team one. */
  private _teamOneOperative: PlayerController | null;

  /* The spymaster for team two */
  private _teamTwoSpymaster: PlayerController | null;

  /* The operative for team two */
  private _teamTwoOperative: PlayerController | null;

  /* The game board */
  // private board: GameCard[][];

  /* The currently active hint word issued by a spymaster */
  private _hint: string;

  /* The number of words relevant to the hint issued by a spymaster */
  private _hintAmount: number;

  /* The amount of words for Team 1 that have not been correctly guessed */
  private _teamOneWordsRemaining: number;

  /* The amount of words for Team 2 that have not been correctly guessed */
  private _teamTwoWordsRemaining: number;

  /**
   * Create a new CodenamesAreaController
   * @param id
   */
  constructor(id: string) {
    super();
    this._id = id;
    this._isActive = false;
    this._turn = null;
    this._teamOneSpymaster = null;
    this._teamOneOperative = null;
    this._teamTwoSpymaster = null;
    this._teamTwoOperative = null;
    this._hint = '';
    this._hintAmount = 0;
    this._teamOneWordsRemaining = 8;
    this._teamTwoWordsRemaining = 8;
  }

  /**
   * Assigns the player to a role, if there is any undefined role. Assigning a role will
   * emit a roleChange event.
   * Roles are assigned based on which roles have not been filled yet.
   * The player must already be in the CodenamesArea to join an undefined role.
   * @param player Player to add.
   */
  public joinPlayer(player: PlayerController): void {
    if (this._occupants.find(occupant => occupant.id === player.id) === undefined) {
      throw new Error('Player is not inside the area');
    }
    if (this._teamOneSpymaster === null) {
      this._teamOneSpymaster = player;
      this.emit('roleChange', player);
    } else if (this._teamTwoSpymaster === null) {
      this._teamTwoSpymaster = player;
      this.emit('roleChange', player);
    } else if (this._teamOneOperative === null) {
      this._teamOneOperative = player;
      this.emit('roleChange', player);
    } else if (this._teamTwoOperative === null) {
      this._teamTwoOperative = player;
      this.emit('roleChange', player);
    } else {
      throw new Error('All roles have been filled!');
    }
  }

  /**
   * Removes the player from the game, and removes the player from its role.
   * The player must be assigned to a role to be removed.
   * @param player Player to remove.
   */
  public removePlayer(player: PlayerController): void {
    if (this._teamOneSpymaster !== null && this._teamOneSpymaster.id === player.id) {
      this._teamOneSpymaster = null;
      this.emit('roleChange', player);
    } else if (this._teamOneOperative !== null && this._teamOneOperative.id === player.id) {
      this._teamOneOperative = null;
      this.emit('roleChange', player);
    } else if (this._teamTwoSpymaster !== null && this._teamTwoSpymaster.id === player.id) {
      this._teamTwoSpymaster = null;
      this.emit('roleChange', player);
    } else if (this._teamTwoOperative !== null && this._teamTwoOperative.id === player.id) {
      this._teamTwoOperative = null;
      this.emit('roleChange', player);
    } else {
      throw new Error('This player is not assigned to any roles!');
    }
  }

  /**
   * Sets the current hint and the amount of words the hint belongs to.
   * Only a spymaster whose turn is the current turn can make a hint.
   * @param newHint The word to set as the hint and the amount of words within the board that this hint correlates with.
   */
  public updateHint(newHint: { word: string; quantity: number }): void {
    const word: string = newHint.word;
    const quantity: number = newHint.quantity;
    this._hint = word;
    this._hintAmount = quantity;
    this.emit('hintChange', newHint);
  }

  /**
   * Submits a guess for specific GameCards, and updates the game board based on the guesses.
   * Guesses must be unrevealed and within the bounds of the game board.
   * Only an operative whose turn is the current turn can make a guess.
   * @param guesses The coordinates of the GameCard that is being guessed.
   */
  public makeGuess(guesses: number) {
    throw new Error('Not yet implemented');
  }

  /**
   * The PlayerController that represents team one's spymaster
   */
  get teamOneSpymaster() {
    return this._teamOneSpymaster;
  }

  /**
   * The PlayerController that represents team one's operative
   */
  get teamOneOperative() {
    return this._teamOneOperative;
  }

  /**
   * The PlayerController that represents team two's spymaster
   */
  get teamTwoSpymaster() {
    return this._teamTwoSpymaster;
  }

  /**
   * The PlayerController that represents team two's operative
   */
  get teamTwoOperative() {
    return this._teamTwoOperative;
  }

  /**
   * The current hint
   */
  get hint() {
    return this._hint;
  }

  /**
   * The number of words the hint corresponds to
   */
  get hintAmount() {
    return this._hintAmount;
  }

  /**
   * The ID of this Codenames area (read only)
   */
  get id() {
    return this._id;
  }

  /**
   * The list of occupants in this Codenames area. Changing the set of occupants
   * will emit an occupantsChange event.
   */
  set occupants(newOccupants: PlayerController[]) {
    if (
      newOccupants.length !== this._occupants.length ||
      _.xor(newOccupants, this._occupants).length > 0
    ) {
      this.emit('occupantsChange', newOccupants);
      this._occupants = newOccupants;
    }
  }

  get occupants() {
    return this._occupants;
  }

  /**
   * A codenames area is empty if there are no occupants in it.
   */
  isEmpty(): boolean {
    return this._occupants.length === 0;
  }

  /**
   * Return a representation of this CodenamesnAreaController that matches the
   * townService's representation and is suitable for transmitting over the network.
   */
  // toCodenamesAreaModel(): CodenamesAreaModel {
  //   return {
  //     id: this.id,
  //     occupantsByID: this.occupants.map(player => player.id),
  //   };
  // }

  /**
   * Create a new CodenamesreaController to match a given CodenamesAreaModel
   * @param codenamesAreaModel Codenames area to represent
   * @param playerFinder A function that will return a list of PlayerController's
   *                     matching a list of Player ID's
   */
  // static fromCodenamesAreaModel(
  //   convAreaModel: CodenamesAreaModel,
  //   playerFinder: (playerIDs: string[]) => PlayerController[],
  // ): CodenamesAreaController {
  //   const ret = new CodenamesAreaController(convAreaModel.id);
  //   ret.occupants = playerFinder(convAreaModel.occupantsByID);
  //   return ret;
  // }
}

/**
 * A react hook to retrieve the occupants of a ConversationAreaController, returning an array of PlayerController.
 *
 * This hook will re-render any components that use it when the set of occupants changes.
 */
// export function useCodenamesAreaOccupants(area: CodenamesAreaController): PlayerController[] {
//   const [occupants, setOccupants] = useState(area.occupants);
//   useEffect(() => {
//     area.addListener('occupantsChange', setOccupants);
//     return () => {
//       area.removeListener('occupantsChange', setOccupants);
//     };
//   }, [area]);
//   return occupants;
// }
