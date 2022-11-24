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
    mockClear(mockListeners.roleChange);
    mockClear(mockListeners.turnChange);
    mockClear(mockListeners.cardChange);
    mockClear(mockListeners.hintChange);
    mockClear(mockListeners.playerCountChange);
    testArea.addListener('roleChange', mockListeners.roleChange);
    testArea.addListener('turnChange', mockListeners.turnChange);
    testArea.addListener('cardChange', mockListeners.cardChange);
    testArea.addListener('hintChange', mockListeners.hintChange);
    testArea.addListener('playerCountChange', mockListeners.playerCountChange);
  });
  describe('joinPlayer', () => {
    it('Assigns the first two players to join as spymasters', () => {
      const firstPlayer = testArea.occupants[0];
      const secondPlayer = testArea.occupants[1];
      testArea.joinPlayer(firstPlayer);
      expect(testArea.roles.teamOneSpymaster).toEqual(firstPlayer.id);
      testArea.joinPlayer(secondPlayer);
      expect(testArea.roles.teamTwoSpymaster).toEqual(secondPlayer.id);
    });
    it('Assigns the remaining two players to join as operatives', () => {
      testArea.joinPlayer(testArea.occupants[0]);
      testArea.joinPlayer(testArea.occupants[1]);
      testArea.joinPlayer(testArea.occupants[2]);
      expect(testArea.roles.teamOneOperative).toEqual(testArea.occupants[2].id);
      testArea.joinPlayer(testArea.occupants[3]);
      expect(testArea.roles.teamTwoOperative).toEqual(testArea.occupants[3].id);
    });
    it('Emits the playerCountChange and roleChange event when assigning a role', () => {
      const newRoles = {
        teamOneSpymaster: testArea.occupants[0].id,
        teamOneOperative: undefined,
        teamTwoSpymaster: undefined,
        teamTwoOperative: undefined,
      };
      testArea.joinPlayer(testArea.occupants[0]);
      expect(mockListeners.playerCountChange).toBeCalledWith(1);
      expect(mockListeners.roleChange).toBeCalledWith(newRoles);
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
      expect(testArea.roles.teamOneSpymaster).toEqual(undefined);
      testArea.joinPlayer(testArea.occupants[3]);
      expect(testArea.roles.teamOneSpymaster).toEqual(testArea.occupants[3].id);
    });
  });
  describe('removePlayer', () => {
    it('Removes the given player from the game and its role', () => {
      const firstPlayer = testArea.occupants[0];
      testArea.joinPlayer(firstPlayer);
      expect(testArea.roles.teamOneSpymaster).toEqual(firstPlayer.id);
      testArea.removePlayer(firstPlayer);
      expect(testArea.roles.teamOneSpymaster).toEqual(undefined);
    });
    it('Does not remove a player that is not assigned a role', () => {
      expect(() => testArea.removePlayer(testArea.occupants[0])).toThrow(
        'This player is not assigned to any roles!',
      );
    });
  });
});
