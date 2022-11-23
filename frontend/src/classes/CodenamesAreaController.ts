import EventEmitter from 'events';
import _, { TruncateOptions, update } from 'lodash';
import { useEffect, useState } from 'react';
import TypedEmitter from 'typed-emitter';
import PlayerController from './PlayerController';
import { CodenamesArea as CodenamesAreaModel, Player } from '../types/CoveyTownSocket';

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
  roleChange: (newRoles: {
    teamOneSpymaster: string | undefined;
    teamOneOperative: string | undefined;
    teamTwoSpymaster: string | undefined;
    teamTwoOperative: string | undefined;
  }) => void;
  /**
   * An event that indicates the team's whose turn it is has changed.
   */
  turnChange: (updatedTurn: string) => void;
  /**
   * An event that indicates the cards on the gameboard have changed. This refers to cases where cards have been guessed.
   */
  // cardChange: (newCards: GameCard[][]) => void;
  /**
   * An event that indicates the hint for the turn has changed.
   */
  hintChange: (newHint: { word: string; quantity: string }) => void;
  /**
   *
   */
  playerCountChange: (newCount: number) => void;
};

/**
 * A CodenamesAreaController manages the local behavior of a codenames area in the frontend,
 * implementing the logic to bridge between the townService's interpretation of codenames areas and the
 * frontend's. The CodenamesAreaController emits events when the codenames area changes.
 */
export default class CodenamesAreaController extends (EventEmitter as new () => TypedEmitter<CodenamesAreaEvents>) {
  private _occupants: PlayerController[] = [];

  private _playerCount: number;

  private _id: string;

  /* Whether or not the game is currently active in play,
   * and game can only be active if all roles are filled.
   */
  private _isActive: boolean;

  /* The current player whose turn is active.
   * Default value is represented by null when game has not started yet
   */
  private _turn: string;

  /* The spymaster for team one. */
  private _roles: {
    teamOneSpymaster: string | undefined;
    teamOneOperative: string | undefined;
    teamTwoSpymaster: string | undefined;
    teamTwoOperative: string | undefined;
  };

  /* The game board */
  // private board: GameCard[][];

  /* The currently active hint word issued by the spymaster. */
  private _hint: { word: string; quantity: string };

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

  public areRolesFilled(): boolean {
    const teamOneSpymaster = this._roles.teamOneSpymaster;
    const teamOneOperative = this._roles.teamOneOperative;
    const teamTwoSpymaster = this._roles.teamTwoSpymaster;
    const teamTwoOperative = this._roles.teamTwoOperative;
    return (
      teamOneSpymaster !== undefined &&
      teamOneOperative !== undefined &&
      teamTwoSpymaster !== undefined &&
      teamTwoOperative !== undefined
    );
  }

  /**
   * Assigns the player to a role, if there is any undefined role. Assigning a role will
   * emit a roleChange event.
   * Roles are assigned based on which roles have not been filled yet.
   * The player must already be in the CodenamesArea to join an undefined role.
   * @param player Player to add.
   */
  public joinPlayer(player: PlayerController): void {
    // if (this._occupants.find(occupant => occupant.id === player.id) === undefined) {
    //   throw new Error('Player is not inside the area');
    // }
    if (this._roles.teamOneSpymaster === undefined) {
      this._roles.teamOneSpymaster = player.id;
    } else if (this._roles.teamTwoSpymaster === undefined) {
      this._roles.teamTwoSpymaster = player.id;
    } else if (this._roles.teamOneOperative === undefined) {
      this._roles.teamOneOperative = player.id;
    } else if (this._roles.teamTwoOperative === undefined) {
      this._roles.teamTwoOperative = player.id;
    } else {
      throw new Error('All roles have been filled!');
    }
    this.playerCount = this.playerCount + 1;
    this._isActive = this.areRolesFilled();
    this.emit('playerCountChange', this._playerCount);
  }

  /**
   * Removes the player from the game, and removes the player from its role.
   * The player must be assigned to a role to be removed.
   * @param player Player to remove.
   */
  public removePlayer(player: PlayerController): void {
    if (this._roles.teamOneSpymaster === player.id) {
      this._roles.teamOneSpymaster = undefined;
      this.playerCount = this.playerCount - 1;
      this.emit('playerCountChange', this._playerCount);
      this.emit('roleChange', this._roles);
    } else if (this._roles.teamOneOperative === player.id) {
      this._roles.teamOneOperative = undefined;
      this.playerCount = this.playerCount - 1;
      this.emit('playerCountChange', this._playerCount);
      this.emit('roleChange', this._roles);
    } else if (this._roles.teamTwoSpymaster === player.id) {
      this._roles.teamTwoSpymaster = undefined;
      this.playerCount = this.playerCount - 1;
      this.emit('playerCountChange', this._playerCount);
      this.emit('roleChange', this._roles);
    } else if (this._roles.teamTwoOperative === player.id) {
      this._roles.teamTwoOperative = undefined;
      this.playerCount = this.playerCount - 1;
      this.emit('playerCountChange', this._playerCount);
      this.emit('roleChange', this._roles);
    } else {
      throw new Error('This player is not assigned to any roles!');
    }
    this._isActive = this.areRolesFilled();
  }

  /**
   * Submits a guess for specified tiles. Also updates game state based on the guesses.(Will be more specific once we discuss more)
   *
   * Guesses must be unrevealed and within bounds of the board.
   *
   * (TBD making sure that only an operative whose turn is the current turn can make a guess)
   *
   * @param guessIndex The coordinates within the grid that is being guessed.
   */
  public makeGuess(guessIndex: number): void {
    // cannot implement until we have access to the game board
  }

  /**
   *
   */
  get roles() {
    return this._roles;
  }

  public set roles(newRoles: {
    teamOneSpymaster: string | undefined;
    teamOneOperative: string | undefined;
    teamTwoSpymaster: string | undefined;
    teamTwoOperative: string | undefined;
  }) {
    if (
      this._roles.teamOneSpymaster !== newRoles.teamOneSpymaster ||
      this._roles.teamOneOperative !== newRoles.teamOneOperative ||
      this._roles.teamTwoSpymaster !== newRoles.teamTwoSpymaster ||
      this._roles.teamTwoOperative !== newRoles.teamTwoOperative
    ) {
      this._roles = newRoles;
      this.emit('roleChange', newRoles);
    }
  }

  get isActive() {
    return this._isActive;
  }

  /**
   * The current turn
   */
  get turn() {
    return this._turn;
  }

  public set turn(newTurn: string) {
    if (this._turn !== newTurn) {
      this._turn = newTurn;
      this.emit('turnChange', newTurn);
    }
  }

  /**
   * The current hint
   */
  get hint() {
    return this._hint;
  }

  /**
   * Sets the current hint and the amount of words the hint belongs to.
   * Only a spymaster whose turn is the current turn can make a hint.
   * @param newHint The word to set as the hint and the amount of words within the board that this hint correlates with.
   */
  public set hint(newHint: { word: string; quantity: string }) {
    if (this._hint.word !== newHint.word || this._hint.quantity !== newHint.quantity) {
      this._hint = newHint;
      this.emit('hintChange', newHint);
    }
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

  get teamOneWordsRemaining() {
    return this._teamOneWordsRemaining;
  }

  public set teamOneWordsRemaining(newWordsRemaining: number) {
    if (this._teamOneWordsRemaining !== newWordsRemaining) {
      this._teamOneWordsRemaining = newWordsRemaining;
    }
  }

  get teamTwoWordsRemaining() {
    return this._teamTwoWordsRemaining;
  }

  public set teamTwoWordsRemaining(newWordsRemaining: number) {
    if (this._teamTwoWordsRemaining !== newWordsRemaining) {
      this._teamTwoWordsRemaining = newWordsRemaining;
    }
  }

  get playerCount() {
    return this._playerCount;
  }

  public set playerCount(newCount: number) {
    if (this._playerCount !== newCount) {
      this._playerCount = newCount;
      this.emit('playerCountChange', newCount);
    }
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
  toCodenamesAreaModel(): CodenamesAreaModel {
    return {
      id: this.id,
      turn: this.turn,
      occupantsID: this.occupants.map(player => player.id),
      roles: this.roles,
      hint: this.hint,
      teamOneWordsRemaining: this.teamOneWordsRemaining,
      teamTwoWordsRemaining: this.teamTwoWordsRemaining,
      playerCount: this.playerCount,
    };
  }

  /**
   * Create a new CodenamesAreaController to match a given CodenamesAreaModel
   * @param codenamesAreaModel codenames area to represent
   * @param playerFinder A function that will return a list of PlayerController's
   *                     matching a list of Player ID's
   */
  static fromCodenamesAreaModel(
    codenamesAreaModel: CodenamesAreaModel,
    playerFinder: (playerIDs: string[]) => PlayerController[],
  ): CodenamesAreaController {
    const ret = new CodenamesAreaController(codenamesAreaModel.id);
    ret.occupants = playerFinder(codenamesAreaModel.occupantsID);
    return ret;
  }

  /**
   *
   */
  public updateFrom(updatedModel: CodenamesAreaModel): void {
    this.hint = updatedModel.hint;
    this.roles = updatedModel.roles;
    this.turn = updatedModel.turn;
    this.teamOneWordsRemaining = updatedModel.teamOneWordsRemaining;
    this.teamTwoWordsRemaining = updatedModel.teamTwoWordsRemaining;
    this.playerCount = updatedModel.playerCount;
  }
}

/**
 * A react hook to retrieve the occupants of a ConversationAreaController, returning an array of PlayerController.
 *
 * This hook will re-render any components that use it when the set of occupants changes.
 */
export function useCodenamesAreaOccupants(area: CodenamesAreaController): PlayerController[] {
  const [occupants, setOccupants] = useState(area.occupants);
  useEffect(() => {
    area.addListener('occupantsChange', setOccupants);
    return () => {
      area.removeListener('occupantsChange', setOccupants);
    };
  }, [area]);
  return occupants;
}
