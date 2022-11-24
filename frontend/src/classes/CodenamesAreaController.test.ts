import { mock, mockClear } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { PlayerLocation, GameCard as GameCardModel } from '../types/CoveyTownSocket';
import CodenamesAreaController, { CodenamesAreaEvents } from './CodenamesAreaController';
import PlayerController from './PlayerController';
import { GameCard } from '../GameCard';

describe('[T2] CodenamesAreaController', () => {
  // A valid CdenamesAreaController to be reused within the tests
  let testArea: CodenamesAreaController;
  const mockListeners = mock<CodenamesAreaEvents>();
  let board: GameCardModel[]; // FACING THE SAME ISSUE AS EARLIER, class GameCard is different from socket GameCard
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
  beforeAll(() => {
    // Make this so we have the same board every test
    // Current this is generating a random board each time so we don't want this!!!
    // Also, not sure if this is the board that the CodenamesAreaController uses, need to access it!
    board = GameCard.initializeCards();
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
    it('Changes game activity to true if all four roles are assigned', () => {
      testArea.joinPlayer(testArea.occupants[0]);
      testArea.joinPlayer(testArea.occupants[1]);
      testArea.joinPlayer(testArea.occupants[2]);
      testArea.joinPlayer(testArea.occupants[3]);
      expect(testArea.isActive).toEqual(true);
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
    it('Emits the playerCountChange and roleChange event when a role is unassigned', () => {
      testArea.joinPlayer(testArea.occupants[0]);
      testArea.removePlayer(testArea.occupants[0]);
      expect(mockListeners.playerCountChange).toBeCalledWith(0);
      expect(mockListeners.roleChange).toBeCalledWith({
        teamOneSpymaster: undefined,
        teamOneOperative: undefined,
        teamTwoSpymaster: undefined,
        teamTwoOperative: undefined,
      });
    });
    it('Changes game activity to false if at least one player leaves and a role is unassigned', () => {
      testArea.joinPlayer(testArea.occupants[0]);
      testArea.joinPlayer(testArea.occupants[1]);
      testArea.joinPlayer(testArea.occupants[2]);
      testArea.joinPlayer(testArea.occupants[3]);
      expect(testArea.isActive).toEqual(true);
      testArea.removePlayer(testArea.occupants[1]);
      expect(testArea.isActive).toEqual(false);
    });
  });
  describe('makeGuess', () => {
    it('Does not change a turn if the guess is correct', () => {
      expect(testArea.turn).toEqual('Spy1');
      expect(board[0].team).toEqual('One');
      // TODO: Make the input string a guess that is actually in the board and correct!!!!
      testArea.makeGuess(board[0].name);
      expect(testArea.turn).toEqual('Spy1');
      expect(mockListeners.turnChange).not.toBeCalled();
    });
    it('Changes a turn and emits a turnChange event if the guess is incorrect', () => {
      // TODO: Make the input string a guess that is acutally in the board BUT INCORRECT!!!!
      testArea.makeGuess('AGENT');
      expect(testArea.turn).toEqual('Op2');
      expect(mockListeners.turnChange).toBeCalledWith('Op2');
    });
    it('Emits a cardChange event if the guess is correct, representing a flipped card in the frontend', () => {
      testArea.makeGuess(board[0].name);
      expect(board[0].guessed).toBe(true);
      expect(mockListeners.cardChange).toBeCalledWith(board);
    });
    it('Throws an error if the guess does not exist on the board', () => {
      expect(() => testArea.makeGuess('WordNotInBoard')).toThrow(
        'Word does not exist on the board',
      );
    });
    it('Throws an error if either Spymaster somehow makes a guess', () => {
      testArea.turn = 'Op2';
      // TODO: Make the input string a valid guess that is correct and in the board!!!!
      expect(() => testArea.makeGuess('AFRICA')).toThrowError(
        'It is not the proper turn to make a guess',
      );
    });
    it("Does not allow for a guess when it is not one of the operative's turn", () => {
      // TODO: Not sure how to properly test this or if this is a logic we implement in the controller
      expect(true).toEqual(true);
    });
    it("Does not allow for a guess when it is either of the spymaster's turn", () => {
      // TODO: Not sure how to properly test this or if this is a logic we implement in the controller
      expect(true).toEqual(true);
    });
  });
});