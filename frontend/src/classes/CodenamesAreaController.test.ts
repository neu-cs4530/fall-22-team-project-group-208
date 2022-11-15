import { mock, mockClear } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { PlayerLocation } from '../types/CoveyTownSocket';
import CodenamesAreaController, { CodenamesAreaEvents } from './CodenamesAreaController';
import PlayerController from './PlayerController';

describe('[T2] CodenamesAreaController', () => {
  // A valid CdenamesAreaController to be reused within the tests
  let testArea: CodenamesAreaController;
  const mockListeners = mock<CodenamesAreaEvents>();
  beforeEach(() => {
    const playerLocation: PlayerLocation = {
      moving: false,
      x: 0,
      y: 0,
      rotation: 'front',
    };
    testArea = new CodenamesAreaController(nanoid());
    testArea.occupants = [
      new PlayerController(nanoid(), nanoid(), playerLocation),
      new PlayerController(nanoid(), nanoid(), playerLocation),
      new PlayerController(nanoid(), nanoid(), playerLocation),
      new PlayerController(nanoid(), nanoid(), playerLocation),
    ];
    mockClear(mockListeners.occupantsChange);
    mockClear(mockListeners.roleChange);
    mockClear(mockListeners.turnChange);
    // mockClear(mockListeners.cardChange);
    mockClear(mockListeners.hintChange);
    testArea.addListener('occupantsChange', mockListeners.occupantsChange);
    testArea.addListener('roleChange', mockListeners.roleChange);
    testArea.addListener('turnChange', mockListeners.turnChange);
    // testArea.addListener('cardChange', mockListeners.cardChange);
    testArea.addListener('hintChange', mockListeners.hintChange);
  });
  describe('joinPlayer', () => {
    it('Does not assign a player if they are not an occupant of this area', () => {
      const playerLocation: PlayerLocation = {
        moving: false,
        x: 0,
        y: 0,
        rotation: 'front',
      };
      const newPlayer = new PlayerController(nanoid(), nanoid(), playerLocation);
      expect(() => testArea.joinPlayer(newPlayer)).toThrow('Player is not inside the area');
    });
    it('Assigns the first two players to join as spymasters', () => {
      const firstPlayer = testArea.occupants[0];
      const secondPlayer = testArea.occupants[1];
      testArea.joinPlayer(firstPlayer);
      expect(testArea.teamOneSpymaster).toEqual(firstPlayer);
      testArea.joinPlayer(secondPlayer);
      expect(testArea.teamTwoSpymaster).toEqual(secondPlayer);
    });
    it('Assigns the remaining two players to join as operatives', () => {
      testArea.joinPlayer(testArea.occupants[0]);
      testArea.joinPlayer(testArea.occupants[1]);
      testArea.joinPlayer(testArea.occupants[2]);
      expect(testArea.teamOneOperative).toEqual(testArea.occupants[2]);
      testArea.joinPlayer(testArea.occupants[3]);
      expect(testArea.teamTwoOperative).toEqual(testArea.occupants[3]);
    });
    it('Emits the roleChange event when assigning a role', () => {
      testArea.joinPlayer(testArea.occupants[0]);
      expect(mockListeners.roleChange).toBeCalledWith(testArea.occupants[0]);
    });
    it('Does not assign a player if all roles have been assigned', () => {
      const playerLocation: PlayerLocation = {
        moving: false,
        x: 0,
        y: 0,
        rotation: 'front',
      };
      testArea.occupants = [
        ...testArea.occupants,
        new PlayerController(nanoid(), nanoid(), playerLocation),
      ];
      testArea.joinPlayer(testArea.occupants[0]);
      testArea.joinPlayer(testArea.occupants[1]);
      testArea.joinPlayer(testArea.occupants[2]);
      testArea.joinPlayer(testArea.occupants[3]);
      expect(() => testArea.joinPlayer(testArea.occupants[4])).toThrow(
        'All roles have been filled!',
      );
    });
    it('Assigns one of the spymaster roles to a new player if a spymaster leaves the game', () => {
      testArea.joinPlayer(testArea.occupants[0]);
      testArea.joinPlayer(testArea.occupants[1]);
      testArea.joinPlayer(testArea.occupants[2]);
      testArea.removePlayer(testArea.occupants[0]);
      expect(testArea.teamOneSpymaster).toEqual(null);
      testArea.joinPlayer(testArea.occupants[3]);
      expect(testArea.teamOneSpymaster).toEqual(testArea.occupants[3]);
    });
  });
  describe('removePlayer', () => {
    it('Removes the given player from the game and its role', () => {
      const firstPlayer = testArea.occupants[0];
      testArea.joinPlayer(firstPlayer);
      expect(testArea.teamOneSpymaster).toEqual(firstPlayer);
      testArea.removePlayer(firstPlayer);
      expect(testArea.teamOneSpymaster).toEqual(null);
    });
    it('Does not remove a player that is not assigned a role', () => {
      expect(() => testArea.removePlayer(testArea.occupants[0])).toThrow(
        'This player is not assigned to any roles!',
      );
    });
  });
  describe('setHint', () => {
    it('Sets the current hint and amount of words the hint belongs to', () => {
      expect(testArea.hint).toEqual('');
      expect(testArea.hintAmount).toEqual(0);
      testArea.setHint({ word: 'animals', quantity: 3 });
      expect(testArea.hint).toEqual('animals');
      expect(testArea.hintAmount).toEqual(3);
    });
    it("Only if the current turn is a spymaster's turn can a hint be set", () => {
      // TODO: Finish this test!!!
    });
  });
});
