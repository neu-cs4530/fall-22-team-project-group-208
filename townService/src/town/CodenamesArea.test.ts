import { mock, mockClear } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import Player from '../lib/Player';
import { getLastEmittedEvent } from '../TestUtils';
import { TownEmitter } from '../types/CoveyTownSocket';
import CodenamesArea from './CodenamesArea';

describe('CodenamesArea', () => {
  const testAreaBox = { x: 100, y: 100, width: 100, height: 100 };
  let testArea: CodenamesArea;
  const townEmitter = mock<TownEmitter>();
  const id = nanoid();
  let newPlayer: Player;
  let roles = {};

  beforeEach(() => {
    mockClear(townEmitter);
    testArea = new CodenamesArea(id, testAreaBox, townEmitter);
    newPlayer = new Player(nanoid(), mock<TownEmitter>());
    testArea.add(newPlayer);
    roles = {
      teamOneSpymaster: undefined,
      teamOneOperative: undefined,
      teamTwoSpymaster: undefined,
      teamTwoOperative: undefined,
    };
  });

  describe('add', () => {
    it('Adds the player to the occupants list and emits an interactableUpdate event', () => {
      expect(testArea.occupantsByID).toEqual([newPlayer.id]);

      const lastEmittedUpdate = getLastEmittedEvent(townEmitter, 'interactableUpdate');
      expect(lastEmittedUpdate).toEqual({
        id,
        turn: 'Spy1',
        occupantsID: [newPlayer.id],
        roles,
        hint: { word: '', quantity: '0' },
        teamOneWordsRemaining: 8,
        teamTwoWordsRemaining: 8,
        playerCount: 0,
        board: [],
        isGameOver: { state: false, team: '' },
      });
    });
    it("Sets the player's conversationLabel and emits an update for their location", () => {
      expect(newPlayer.location.interactableID).toEqual(id);

      const lastEmittedMovement = getLastEmittedEvent(townEmitter, 'playerMoved');
      expect(lastEmittedMovement.location.interactableID).toEqual(id);
    });
  });
  describe('remove', () => {
    it('Removes the player from the list of occupants and emits an interactableUpdate event', () => {
      // Add another player so that we are not also testing what happens when the last player leaves
      const extraPlayer = new Player(nanoid(), mock<TownEmitter>());
      testArea.add(extraPlayer);
      testArea.remove(newPlayer);

      expect(testArea.occupantsByID).toEqual([extraPlayer.id]);
      const lastEmittedUpdate = getLastEmittedEvent(townEmitter, 'interactableUpdate');
      expect(lastEmittedUpdate).toEqual({
        id,
        turn: 'Spy1',
        occupantsID: [extraPlayer.id],
        roles,
        hint: { word: '', quantity: '0' },
        teamOneWordsRemaining: 8,
        teamTwoWordsRemaining: 8,
        playerCount: 0,
        board: [],
        isGameOver: { state: false, team: '' },
      });
    });
  });
  test('toModel sets the properties needed for a simple CodenamesAreaModel', () => {
    const model = testArea.toModel();
    expect(model).toEqual({
      id,
      turn: 'Spy1',
      occupantsID: [newPlayer.id],
      roles,
      hint: { word: '', quantity: '0' },
      teamOneWordsRemaining: 8,
      teamTwoWordsRemaining: 8,
      playerCount: 0,
      board: [],
      isGameOver: { state: false, team: '' },
    });
  });
  describe('fromMapObject', () => {
    it('Throws an error if the width or height are missing', () => {
      expect(() =>
        CodenamesArea.fromMapObject(
          { id: 1, name: nanoid(), visible: true, x: 0, y: 0 },
          townEmitter,
        ),
      ).toThrowError();
    });
    it('Creates a new codenames area using the provided boundingBox and id, with an empty occupants list', () => {
      const x = 30;
      const y = 20;
      const width = 10;
      const height = 20;
      const name = 'name';
      const val = CodenamesArea.fromMapObject(
        { x, y, width, height, name, id: 10, visible: true },
        townEmitter,
      );
      expect(val.boundingBox).toEqual({ x, y, width, height });
      expect(val.id).toEqual(name);
      expect(val.occupantsByID).toEqual([]);
    });
  });
});
