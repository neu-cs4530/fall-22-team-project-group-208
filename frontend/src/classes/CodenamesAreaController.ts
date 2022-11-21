import EventEmitter from 'events';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import TypedEmitter from 'typed-emitter';
import { CodenamesArea as CodenamesAreaModel } from '../types/CoveyTownSocket';
import { GameCard } from '../components/GameCard';
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
  cardChange: (newCards: GameCard[]) => void;
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
  private _blueSpymasterId?: number;

  /* The operative for team one. */
  private _blueOperativeId?: number;

  /* The spymaster for team two */
  private _redSpymasterId?: number;

  /* The operative for team two */
  private _redOperativeId?: number;

  /**
   * Create a new CodenamesAreaController
   * @param id
   */
  constructor(id: string) {
    super();
    this._id = id;
    this._isActive = false;
    this._turn = null;
  }

  /**
   * The PlayerController that represents team one's spymaster
   */
  get blueSpymasterId() {
    return this._blueSpymasterId;
  }

  /**
   * The PlayerController that represents team one's operative
   */
  get blueOperativeId() {
    return this._blueOperativeId;
  }

  /**
   * The PlayerController that represents team two's spymaster
   */
  get redSpymasterId() {
    return this._redSpymasterId;
  }

  /**
   * The PlayerController that represents team two's operative
   */
  get redOperativeId() {
    return this._blueOperativeId;
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
  toCodenamesAreaModel(): CodenamesAreaModel {
    return {
      id: this.id,
      occupantsByID: this.occupants.map(player => player.id),
    };
  }

  /**
   * Create a new CodenamesreaController to match a given CodenamesAreaModel
   * @param codenamesAreaModel Codenames area to represent
   * @param playerFinder A function that will return a list of PlayerController's
   *                     matching a list of Player ID's
   */
  static fromCodenamesAreaModel(
    convAreaModel: CodenamesAreaModel,
    playerFinder: (playerIDs: string[]) => PlayerController[],
  ): CodenamesAreaController {
    const ret = new CodenamesAreaController(convAreaModel.id);
    ret.occupants = playerFinder(convAreaModel.occupantsByID);
    return ret;
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
