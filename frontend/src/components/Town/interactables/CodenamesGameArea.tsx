import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useToast,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import { useCodenamesAreaController, useInteractable } from '../../../classes/TownController';
import { GameCard } from '../../../GameCard';
import useTownController from '../../../hooks/useTownController';
import { CodenamesArea as CodenamesAreaModel } from '../../../types/CoveyTownSocket';
import CardGameViews from './CardGameViews';
import CodenamesAreaInteractable from './GameArea';

/**
 * The CodenamesGameArea monitors the player's interaction with a CodenamesArea on the map: displaying a join game screen if the game does not have 4 players yet, a waiting screen if the player has joined the game but there are not 4 players that have joined yet, a game full screen if the game is in progress, or the game board for the codenames game if the game now has 4 players.
 *
 * @param props: the codenames area interactable that is being interacted with
 */
export function CodenamesGameArea({
  codenamesArea,
}: {
  codenamesArea: CodenamesAreaInteractable;
}): JSX.Element {
  const coveyTownController = useTownController();
  const codenamesAreaController = useCodenamesAreaController(codenamesArea.id);
  const ourPlayer = coveyTownController.ourPlayer;
  const [isGameFull, setIsGameFull] = useState<boolean>(false);
  const [joinedGame, setJoinedGame] = useState<boolean>(false);
  const [playersInGame, setPlayersInGame] = useState<number>(codenamesAreaController.playerCount);
  const [gameOverState, setGameOverState] = useState<boolean>(
    codenamesAreaController.isGameOver.state,
  );
  const isOpen = codenamesArea !== undefined;

  useEffect(() => {
    if (codenamesArea) {
      coveyTownController.pause();
    } else {
      coveyTownController.unPause();
    }
    if (playersInGame === 0) {
      setIsGameFull(false);
      setJoinedGame(false);
    }
    if (playersInGame === 4) {
      setIsGameFull(true);
    } else {
      setIsGameFull(false);
    }
    const updateIsGameOver = (newGameOverState: { state: boolean; team: string }) => {
      if (newGameOverState.state !== gameOverState) {
        setGameOverState(newGameOverState.state);
      }
    };
    codenamesAreaController.addListener('playerCountChange', setPlayersInGame);
    codenamesAreaController.addListener('isGameOverChange', updateIsGameOver);
    return () => {
      codenamesAreaController.removeListener('playerCountChange', setPlayersInGame);
      codenamesAreaController.removeListener('isGameOverChange', updateIsGameOver);
    };
  }, [
    coveyTownController,
    codenamesArea,
    codenamesAreaController,
    setPlayersInGame,
    playersInGame,
    gameOverState,
  ]);

  const closeModal = useCallback(() => {
    if (codenamesArea) {
      coveyTownController.interactEnd(codenamesArea);
      coveyTownController.unPause();
    }
  }, [codenamesArea, coveyTownController]);

  const toast = useToast();

  const createCodenames = useCallback(async () => {
    if (codenamesAreaController) {
      let codenamesToCreate: CodenamesAreaModel;
      if (codenamesAreaController.isGameOver.state) {
        codenamesToCreate = {
          id: codenamesAreaController.id,
          occupantsID: [ourPlayer.id],
          turn: 'Spy1',
          roles: {
            teamOneSpymaster: ourPlayer.id,
            teamOneOperative: undefined,
            teamTwoSpymaster: undefined,
            teamTwoOperative: undefined,
          },
          hint: {
            word: '',
            quantity: '0',
          },
          teamOneWordsRemaining: 8,
          teamTwoWordsRemaining: 8,
          playerCount: codenamesAreaController.playerCount + 1,
          board: GameCard.initializeCards(),
          isGameOver: { state: false, team: '' },
        };
      } else {
        codenamesToCreate = {
          id: codenamesAreaController.id,
          occupantsID: [ourPlayer.id],
          turn: 'Spy1',
          roles: {
            teamOneSpymaster: ourPlayer.id,
            teamOneOperative: undefined,
            teamTwoSpymaster: undefined,
            teamTwoOperative: undefined,
          },
          hint: {
            word: '',
            quantity: '0',
          },
          teamOneWordsRemaining: 8,
          teamTwoWordsRemaining: 8,
          playerCount: 1,
          board: GameCard.initializeCards(),
          isGameOver: { state: false, team: '' },
        };
      }
      try {
        await coveyTownController.createCodenamesArea(codenamesToCreate);
        toast({
          title: 'Codenames joined!',
          status: 'success',
        });
      } catch (err) {
        if (err instanceof Error) {
          toast({
            title: 'Unable to join game',
            description: err.toString(),
            status: 'error',
          });
        } else {
          console.trace(err);
          toast({
            title: 'Unexpected Error',
            status: 'error',
          });
        }
      }
    }
  }, [codenamesAreaController, coveyTownController, ourPlayer.id, toast]);

  function joinCodenames() {
    if (codenamesAreaController.playerCount === 0) {
      createCodenames();
    } else {
      toast({
        title: 'Joined the game!',
        status: 'success',
      });
    }
    setJoinedGame(true);
    codenamesAreaController.joinPlayer(ourPlayer);
    coveyTownController.emitCodenamesAreaUpdate(codenamesAreaController);
  }

  if (joinedGame && isGameFull) {
    return (
      <CardGameViews
        controller={codenamesAreaController}
        ourPlayer={ourPlayer}
        townController={coveyTownController}
        codenamesArea={codenamesArea}
      />
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setJoinedGame(false);
        if (
          codenamesAreaController.roles.teamOneOperative === ourPlayer.id ||
          codenamesAreaController.roles.teamTwoOperative === ourPlayer.id ||
          codenamesAreaController.roles.teamOneSpymaster === ourPlayer.id ||
          codenamesAreaController.roles.teamTwoSpymaster === ourPlayer.id
        ) {
          codenamesAreaController.removePlayer(ourPlayer);
          coveyTownController.emitCodenamesAreaUpdate(codenamesAreaController);
        }
        closeModal();
      }}>
      <ModalOverlay />
      <ModalContent hidden={!joinedGame || isGameFull || gameOverState}>
        <ModalHeader>Joined the {codenamesArea.name} </ModalHeader>
        <ModalCloseButton />
        <ModalBody>Waiting for {4 - playersInGame} more players...</ModalBody>
      </ModalContent>
      <ModalContent hidden={!gameOverState}>
        <ModalHeader>Game is over!</ModalHeader>
        <ModalCloseButton />
        <ModalBody>Please close out of the game and rejoin to play again.</ModalBody>
      </ModalContent>
      <ModalContent hidden={!isGameFull || joinedGame}>
        <ModalHeader>Game is currently full!</ModalHeader>
        <ModalCloseButton />
        <ModalBody>Please try joining again once the game is finished.</ModalBody>
      </ModalContent>
      <ModalContent hidden={isGameFull || joinedGame}>
        <ModalHeader>Press the button to join the {codenamesArea.name} </ModalHeader>
        <ModalCloseButton />
        <form
          onSubmit={ev => {
            ev.preventDefault();
            joinCodenames();
          }}>
          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={joinCodenames}>
              Join Game
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}

/**
 * The CodenamesAreaWrapper is suitable to be *always* rendered inside of a town, and
 * will activate only if the player begins interacting with a codenames area.
 */
export default function CodenamesAreaWrapper(): JSX.Element {
  const codenamesArea = useInteractable<CodenamesAreaInteractable>('codenamesArea');
  if (codenamesArea) {
    return <CodenamesGameArea codenamesArea={codenamesArea} />;
  }
  return <></>;
}
