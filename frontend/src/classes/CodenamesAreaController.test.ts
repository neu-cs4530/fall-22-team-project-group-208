import { mock, mockClear } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { PlayerLocation, GameCard as GameCardModel } from '../types/CoveyTownSocket';
import CodenamesAreaController, { CodenamesAreaEvents } from './CodenamesAreaController';
import PlayerController from './PlayerController';

describe('[T2] CodenamesAreaController', () => {
  // A valid CdenamesAreaController to be reused within the tests
  let testArea: CodenamesAreaController;
  const mockListeners = mock<CodenamesAreaEvents>();
  let board: GameCardModel[];
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

    const card1: GameCardModel = { name: 'AFRICA', team: 'One', guessed: false, color: 'blue' };
    const card2: GameCardModel = { name: 'BEACH', team: 'One', guessed: false, color: 'blue' };
    const card3: GameCardModel = { name: 'COPPER', team: 'One', guessed: false, color: 'blue' };
    const card4: GameCardModel = { name: 'DEATH', team: 'One', guessed: false, color: 'blue' };
    const card5: GameCardModel = { name: 'EMBASSY', team: 'One', guessed: false, color: 'blue' };
    const card6: GameCardModel = { name: 'FRANCE', team: 'One', guessed: false, color: 'blue' };
    const card7: GameCardModel = { name: 'GAME', team: 'One', guessed: false, color: 'blue' };
    const card8: GameCardModel = { name: 'HAM', team: 'One', guessed: false, color: 'blue' };
    const card9: GameCardModel = { name: 'ICE', team: 'Two', guessed: false, color: 'red' };
    const card10: GameCardModel = { name: 'JACK', team: 'Two', guessed: false, color: 'red' };
    const card11: GameCardModel = { name: 'KANGAROO', team: 'Two', guessed: false, color: 'red' };
    const card12: GameCardModel = { name: 'LAB', team: 'Two', guessed: false, color: 'red' };
    const card13: GameCardModel = { name: 'MAIL', team: 'Two', guessed: false, color: 'red' };
    const card14: GameCardModel = { name: 'NAIL', team: 'Two', guessed: false, color: 'red' };
    const card15: GameCardModel = { name: 'OCTOPUS', team: 'Two', guessed: false, color: 'red' };
    const card16: GameCardModel = { name: 'PALM', team: 'Bomb', guessed: false, color: 'black' };
    const card17: GameCardModel = { name: 'QUEEN', team: 'Neutral', guessed: false, color: 'gray' };
    const card18: GameCardModel = {
      name: 'RABBIT',
      team: 'Neutral',
      guessed: false,
      color: 'gray',
    };
    const card19: GameCardModel = {
      name: 'SATELLITE',
      team: 'Neutral',
      guessed: false,
      color: 'gray',
    };
    const card20: GameCardModel = { name: 'TABLE', team: 'Neutral', guessed: false, color: 'gray' };
    const card21: GameCardModel = {
      name: 'UNDERTAKER',
      team: 'Neutrale',
      guessed: false,
      color: 'gray',
    };
    const card22: GameCardModel = {
      name: 'VACUUM',
      team: 'Neutral',
      guessed: false,
      color: 'gray',
    };
    const card23: GameCardModel = { name: 'WAKE', team: 'Neutral', guessed: false, color: 'gray' };
    const card24: GameCardModel = {
      name: 'WASHINGTON',
      team: 'Neutral',
      guessed: false,
      color: 'gray',
    };
    const card25: GameCardModel = { name: 'YARD', team: 'Neutral', guessed: false, color: 'gray' };
    board = [
      card1,
      card2,
      card3,
      card4,
      card5,
      card6,
      card7,
      card8,
      card9,
      card10,
      card11,
      card12,
      card13,
      card14,
      card15,
      card16,
      card17,
      card18,
      card19,
      card20,
      card21,
      card22,
      card23,
      card24,
      card25,
    ];
    testArea.board = board;
    testArea.turn = 'Op1';
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
    it('Emits the playerCountChange and roleChange event when assigning a role and updates the model', () => {
      const newRoles = {
        teamOneSpymaster: testArea.occupants[0].id,
        teamOneOperative: undefined,
        teamTwoSpymaster: undefined,
        teamTwoOperative: undefined,
      };
      testArea.joinPlayer(testArea.occupants[0]);
      expect(mockListeners.playerCountChange).toBeCalledWith(1);
      expect(mockListeners.roleChange).toBeCalledWith(newRoles);
      expect(testArea.toCodenamesAreaModel()).toEqual({
        id: testArea.id,
        turn: testArea.turn,
        occupantsID: testArea.occupants.map(player => player.id),
        roles: newRoles,
        hint: testArea.hint,
        teamOneWordsRemaining: testArea.teamOneWordsRemaining,
        teamTwoWordsRemaining: testArea.teamTwoWordsRemaining,
        playerCount: testArea.playerCount,
        board: testArea.board,
        isGameOver: testArea.isGameOver,
      });
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
      expect(testArea.turn).toEqual('Op1');
      expect(board[7].team).toEqual('One');
      // The turn is set to "Op1" above, so the turnChange event is expected to be called once
      expect(mockListeners.turnChange).toBeCalledTimes(1);
      testArea.makeGuess('HAM');
      expect(testArea.turn).toEqual('Op1');
      expect(mockListeners.turnChange).toBeCalledTimes(1);
    });
    it('Changes a turn and emits a turnChange event if the guess is incorrect', () => {
      expect(testArea.turn).toEqual('Op1');
      expect(board[9].team).toEqual('Two');
      testArea.makeGuess('JACK');
      expect(testArea.turn).toEqual('Spy2');
      expect(mockListeners.turnChange).toBeCalledWith('Spy2');
    });
    it('Emits a cardChange event if the guess is correct, and the number of team one words decrements by one', () => {
      expect(testArea.teamOneWordsRemaining).toEqual(8);
      testArea.makeGuess('AFRICA');
      expect(testArea.teamOneWordsRemaining).toEqual(7);
      expect(board[0].guessed).toEqual(true);
      expect(mockListeners.cardChange).toBeCalledWith(board);
    });
    it('Emits a cardChange event even if the guess is incorrect, and the number of team two words decrements by one', () => {
      expect(testArea.teamTwoWordsRemaining).toEqual(8);
      testArea.makeGuess('OCTOPUS');
      expect(testArea.teamTwoWordsRemaining).toEqual(7);
      expect(board[14].guessed).toEqual(true);
      expect(mockListeners.cardChange).toBeCalledWith(board);
    });
    it('Throws an error if the guess does not exist on the board', () => {
      expect(() => testArea.makeGuess('WordNotInBoard')).toThrow(
        'Word does not exist on the board',
      );
    });
    it('Throws an error if either Spymaster somehow makes a guess', () => {
      testArea.turn = 'Spy1';
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
  describe('checkGameOver', () => {
    it('updates the isGameOver field accordingly when a team wins', () => {
      testArea.teamOneWordsRemaining = 0;
      testArea.checkGameOver();
      expect(testArea.isGameOver).toEqual({
        state: true,
        team: 'One',
      });
    });
    it('updates the isGameOver field accordingly when team two wins', () => {
      testArea.teamTwoWordsRemaining = 0;
      testArea.checkGameOver();
      expect(testArea.isGameOver).toEqual({
        state: true,
        team: 'Two',
      });
    });
    it('increments the number of wins for the players on a team if team one wins', () => {
      testArea.joinPlayer(testArea.occupants[0]);
      testArea.joinPlayer(testArea.occupants[1]);
      testArea.joinPlayer(testArea.occupants[2]);
      testArea.joinPlayer(testArea.occupants[3]);
      testArea.teamOneWordsRemaining = 0;
      testArea.checkGameOver();
      expect(testArea.occupants.find(occupant => occupant.id === testArea.roles.teamOneSpymaster)?.codenamesWins).toEqual(1);
      expect(testArea.occupants.find(occupant => occupant.id === testArea.roles.teamOneOperative)?.codenamesWins).toEqual(1);
      expect(testArea.occupants.find(occupant => occupant.id === testArea.roles.teamTwoSpymaster)?.codenamesWins).toEqual(0);
      expect(testArea.occupants.find(occupant => occupant.id === testArea.roles.teamTwoOperative)?.codenamesWins).toEqual(0);
    });
    it('increments the number of wins for the players on a team if team two wins', () => {
      testArea.joinPlayer(testArea.occupants[0]);
      testArea.joinPlayer(testArea.occupants[1]);
      testArea.joinPlayer(testArea.occupants[2]);
      testArea.joinPlayer(testArea.occupants[3]);
      testArea.teamTwoWordsRemaining = 0;
      testArea.checkGameOver();
      expect(testArea.occupants.find(occupant => occupant.id === testArea.roles.teamOneSpymaster)?.codenamesWins).toEqual(0);
      expect(testArea.occupants.find(occupant => occupant.id === testArea.roles.teamOneOperative)?.codenamesWins).toEqual(0);
      expect(testArea.occupants.find(occupant => occupant.id === testArea.roles.teamTwoSpymaster)?.codenamesWins).toEqual(1);
      expect(testArea.occupants.find(occupant => occupant.id === testArea.roles.teamTwoOperative)?.codenamesWins).toEqual(1);
    });
  });
});
