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
import {
  CodenamesArea as CodenamesAreaModel,
  // GameCard as GameCardModel,
} from '../../../types/CoveyTownSocket';
import CardGameViews from './CardGameViews';
import CodenamesAreaInteractable from './GameArea';

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
  const isOpen = codenamesArea !== undefined;

  useEffect(() => {
    if (codenamesArea) {
      coveyTownController.pause();
    } else {
      coveyTownController.unPause();
    }
    // change to if boolean that all 4 players have been assigned roles returns true
    if (playersInGame === 4) {
      setIsGameFull(true);
    } else {
      setIsGameFull(false);
    }
    codenamesAreaController.addListener('playerCountChange', setPlayersInGame);
    return () => {
      codenamesAreaController.removeListener('playerCountChange', setPlayersInGame);
    };
  }, [
    coveyTownController,
    codenamesArea,
    codenamesAreaController,
    setPlayersInGame,
    playersInGame,
  ]);

  /* closes screen when exit is pressed */
  const closeModal = useCallback(() => {
    if (codenamesArea) {
      coveyTownController.interactEnd(codenamesArea);
      coveyTownController.unPause();
    }
  }, [codenamesArea, coveyTownController]);

  const toast = useToast();

  const createCodenames = useCallback(async () => {
    if (codenamesAreaController) {
      const codenamesToCreate: CodenamesAreaModel = {
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
      };
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

  /**
   * add an else if checking if game is full
   */
  function joinCodenames() {
    if (codenamesAreaController.occupants.length === 0) {
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
    console.log(codenamesAreaController);
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
      <ModalContent hidden={!joinedGame || isGameFull}>
        <ModalHeader>Joined the {codenamesArea.name} </ModalHeader>
        <ModalCloseButton />
        <ModalBody>Waiting for {4 - playersInGame} more players...</ModalBody>
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
