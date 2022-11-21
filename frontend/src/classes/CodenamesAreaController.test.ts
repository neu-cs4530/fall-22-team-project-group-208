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
});
