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
};

/**
 * A CodenamesAreaController manages the local behavior of a codenames area in the frontend,
 * implementing the logic to bridge between the townService's interpretation of codenames areas and the
 * frontend's. The CodenamesAreaController emits events when the codenames area changes.
 */
export default class CodenamesAreaController extends (EventEmitter as new () => TypedEmitter<CodenamesAreaEvents>) {
  // INSTEAD OF ALL THESE FIELDS, THERE IS NOW A SINGLE CodenamesAreaModel which also has all these fields
  private _model: CodenamesAreaModel;

  private _occupants: PlayerController[] = [];

  // private _id: string;

  // /* Whether or not the game is currently active in play,
  //  * and game can only be active if all roles are filled.
  //  */
  private _isActive: boolean;

  // /* The current player whose turn is active.
  //  * Default value is represented by null when game has not started yet
  //  */
  // private _turn: string;

  // /* The spymaster for team one. */
  private _roles: {
    teamOneSpymaster: string | undefined;
    teamOneOperative: string | undefined;
    teamTwoSpymaster: string | undefined;
    teamTwoOperative: string | undefined;
  };

  // /* The game board */
  // // private board: GameCard[][];

  // /* The currently active hint word issued by the spymaster. */
  // private _hint: { word: string; quantity: string };

  // /* The amount of words for Team 1 that have not been correctly guessed */
  // private _teamOneWordsRemaining: number;

  // /* The amount of words for Team 2 that have not been correctly guessed */
  // private _teamTwoWordsRemaining: number;

  /**
   * Create a new CodenamesAreaController
   * @param codenamesAreaModel the model from the backend to represent this codenames area
   */
  constructor(codenamesAreaModel: CodenamesAreaModel) {
    super();
    this._model = codenamesAreaModel;
    this._isActive = false;
    // this._id = id;
    // this._turn = 'Spy1';
    this._roles = {
      teamOneSpymaster: undefined,
      teamOneOperative: undefined,
      teamTwoSpymaster: undefined,
      teamTwoOperative: undefined,
    };
    // this._hint = { word: '', quantity: '0' };
    // this._teamOneWordsRemaining = 8;
    // this._teamTwoWordsRemaining = 8;
  }

  /**
   * The ID of the codenames area represented by this codenames area controller
   * This property is read-only: once a CodenamesAreaController is created, it will always be
   * tied to the same codenames area ID.
   */
  get id() {
    return this._model.id;
  }

  /**
   * The current model representing this Codenames area. Changing any field in the model
   * will emit a respective event.
   */
  set model(newModel: CodenamesAreaModel) {
    // TODO: Check if the turn changed
    // TOOD: Check if the role struct changed
    // TODO: Check if the hint struct changed
  }

  /**
   * A helper method that checks if all of the spymaster and operative roles are filled
   *
   * @returns True if all roles are filled
   */
  public areRolesFilled(): boolean {
    const teamOneSpymaster = this._model.roles.teamOneSpymaster;
    const teamOneOperative = this._model.roles.teamOneOperative;
    const teamTwoSpymaster = this._model.roles.teamTwoSpymaster;
    const teamTwoOperative = this._model.roles.teamTwoOperative;
    return (
      teamOneSpymaster === undefined ||
      teamOneOperative === undefined ||
      teamTwoSpymaster === undefined ||
      teamTwoOperative === undefined
    );
  }

  /**
   * The list of occupants in this Codenames area. Changing the set of occupants
   * will emit an occupantsChange event.
   */
  set occupants(newOccupants: PlayerController[]) {
    // TODO: Not sure if we need to fire an occupantsChange event?? Seems to be specific to ConversationAreaController
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
  public isEmpty(): boolean {
    return this._model.occupantsID.length === 0;
  }

  /**
   * Return a representation of this CodenamesnAreaController that matches the
   * townService's representation and is suitable for transmitting over the network.
   */
  public toCodenamesAreaModel(): CodenamesAreaModel {
    // return {
    //   id: this.id,
    //   turn: this.turn,
    //   occupantsID: this.occupants.map(player => player.id),
    //   roles: this.roles,
    //   hint: this.hint,
    //   teamOneWordsRemaining: this.teamOneWordsRemaining,
    //   teamTwoWordsRemaining: this.teamTwoWordsRemaining,
    // };
    return this._model;
  }

  /**
   * Create a new CodenamesAreaController to match a given CodenamesAreaModel
   * @param codenamesAreaModel codenames area to represent
   * @param playerFinder A function that will return a list of PlayerController's
   *                     matching a list of Player ID's
   */
  public static fromCodenamesAreaModel(
    codenamesAreaModel: CodenamesAreaModel,
    playerFinder: (playerIDs: string[]) => PlayerController[],
  ): CodenamesAreaController {
    const ret = new CodenamesAreaController(codenamesAreaModel);
    ret.occupants = playerFinder(codenamesAreaModel.occupantsID);
    return ret;
  }

  /**
   *
   */
  public updateFrom(updatedModel: CodenamesAreaModel): void {
    // this.hint = updatedModel.hint;
    // this.roles = updatedModel.roles;
    // this.turn = updatedModel.turn;
    // this.teamOneWordsRemaining = updatedModel.teamOneWordsRemaining;
    // this.teamTwoWordsRemaining = updatedModel.teamTwoWordsRemaining;
    this._model = updatedModel;
  }

  // /**
  //  * Assigns the player to a role, if there is any undefined role. Assigning a role will
  //  * emit a roleChange event.
  //  * Roles are assigned based on which roles have not been filled yet.
  //  * The player must already be in the CodenamesArea to join an undefined role.
  //  * @param player Player to add.
  //  */
  // public joinPlayer(player: PlayerController): void {
  //   if (this._occupants.find(occupant => occupant.id === player.id) === undefined) {
  //     throw new Error('Player is not inside the area');
  //   }
  //   if (this._roles.teamOneSpymaster === undefined) {
  //     this._roles.teamOneSpymaster = player.id;
  //   } else if (this._roles.teamTwoSpymaster === undefined) {
  //     this._roles.teamTwoSpymaster = player.id;
  //   } else if (this._roles.teamOneOperative === undefined) {
  //     this._roles.teamOneOperative = player.id;
  //   } else if (this._roles.teamTwoOperative === undefined) {
  //     this._roles.teamTwoOperative = player.id;
  //   } else {
  //     throw new Error('All roles have been filled!');
  //   }
  // }

  // /**
  //  * Removes the player from the game, and removes the player from its role.
  //  * The player must be assigned to a role to be removed.
  //  * @param player Player to remove.
  //  */
  // public removePlayer(player: PlayerController): void {
  //   throw new Error('Not implemeneted yet');
  //   // if (this._teamOneSpymaster !== undefined && this._teamOneSpymaster.id === player.id) {
  //   //   this.teamOneSpymaster = undefined;
  //   // } else if (this._teamOneOperative !== undefined && this._teamOneOperative.id === player.id) {
  //   //   this.teamOneOperative = undefined;
  //   // } else if (this._teamTwoSpymaster !== undefined && this._teamTwoSpymaster.id === player.id) {
  //   //   this.teamTwoSpymaster = undefined;
  //   // } else if (this._teamTwoOperative !== undefined && this._teamTwoOperative.id === player.id) {
  //   //   this.teamTwoOperative = undefined;
  //   // } else {
  //   //   throw new Error('This player is not assigned to any roles!');
  //   // }
  // }

  // /**
  //  * Submits a guess for specific GameCards, and updates the game board based on the guesses.
  //  * Guesses must be unrevealed and within the bounds of the game board.
  //  * Only an operative whose turn is the current turn can make a guess.
  //  * @param guesses The coordinates of the GameCard that is being guessed.
  //  */
  // public makeGuess(guesses: number) {
  //   throw new Error('Not yet implemented');
  // }

  get roles() {
    return this._roles;
  }

  // public set roles(newRoles: {
  //   teamOneSpymaster: string | undefined;
  //   teamOneOperative: string | undefined;
  //   teamTwoSpymaster: string | undefined;
  //   teamTwoOperative: string | undefined;
  // }) {
  //   if (
  //     this._roles.teamOneSpymaster !== newRoles.teamOneSpymaster ||
  //     this._roles.teamOneOperative !== newRoles.teamOneOperative ||
  //     this._roles.teamTwoSpymaster !== newRoles.teamTwoSpymaster ||
  //     this._roles.teamTwoOperative !== newRoles.teamTwoOperative
  //   ) {
  //     this._roles = newRoles;
  //     this.emit('roleChange', newRoles);
  //   }
  // }

  get isActive() {
    return this._isActive;
  }

  // /**
  //  * The current turn
  //  */
  // get turn() {
  //   return this._turn;
  // }

  // public set turn(newTurn: string) {
  //   if (this._turn !== newTurn) {
  //     this._turn = newTurn;
  //     this.emit('turnChange', newTurn);
  //   }
  // }

  // /**
  //  * The current hint
  //  */
  // get hint() {
  //   return this._hint;
  // }

  // /**
  //  * Sets the current hint and the amount of words the hint belongs to.
  //  * Only a spymaster whose turn is the current turn can make a hint.
  //  * @param newHint The word to set as the hint and the amount of words within the board that this hint correlates with.
  //  */
  // public set hint(newHint: { word: string; quantity: string }) {
  //   if (this._hint.word !== newHint.word || this._hint.quantity !== newHint.quantity) {
  //     this._hint = newHint;
  //     this.emit('hintChange', newHint);
  //   }
  // }

  // get teamOneWordsRemaining() {
  //   return this._teamOneWordsRemaining;
  // }

  // public set teamOneWordsRemaining(newWordsRemaining: number) {
  //   if (this._teamOneWordsRemaining !== newWordsRemaining) {
  //     this._teamOneWordsRemaining = newWordsRemaining;
  //   }
  // }

  // get teamTwoWordsRemaining() {
  //   return this._teamTwoWordsRemaining;
  // }

  // public set teamTwoWordsRemaining(newWordsRemaining: number) {
  //   if (this._teamTwoWordsRemaining !== newWordsRemaining) {
  //     this._teamTwoWordsRemaining = newWordsRemaining;
  //   }
  // }
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
