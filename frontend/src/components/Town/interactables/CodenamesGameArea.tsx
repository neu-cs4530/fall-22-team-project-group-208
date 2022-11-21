import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useToast,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import { useCodenamesAreaController, useInteractable } from '../../../classes/TownController';
import useTownController from '../../../hooks/useTownController';
import { CodenamesArea as CodenamesAreaModel } from '../../../types/CoveyTownSocket';
import CodenamesAreaInteractable from './GameArea';

export function CodenamesGameArea({
  codenamesArea,
}: {
  codenamesArea: CodenamesAreaInteractable;
}): JSX.Element {
  const coveyTownController = useTownController();
  const codenamesAreaController = useCodenamesAreaController(codenamesArea.id);
  const [isGameFull, setIsGameFull] = useState<boolean>(false);
  const [currentTurn, setCurrentTurn] = useState<string>('Spy1');
  const [occupants, setOccupants] = useState(codenamesAreaController.occupants);
  const isSpymaster =
    coveyTownController.ourPlayer.id === codenamesAreaController.roles.teamOneSpymaster ||
    coveyTownController.ourPlayer.id === codenamesAreaController.roles.teamTwoSpymaster;
  const isTeamOne =
    coveyTownController.ourPlayer.id === codenamesAreaController.roles.teamOneSpymaster ||
    coveyTownController.ourPlayer.id === codenamesAreaController.roles.teamOneOperative;
  const isOpen = codenamesArea !== undefined;

  useEffect(() => {
    if (codenamesArea) {
      coveyTownController.pause();
    } else {
      coveyTownController.unPause();
    }
  }, [coveyTownController, codenamesArea]);

  /* closes screen when exit is pressed */
  const closeGame = useCallback(() => {
    if (codenamesArea) {
      coveyTownController.interactEnd(codenamesArea);
    }
  }, [coveyTownController, codenamesArea]);

  /* when the players are updated, checks whether the game is full */
  /** listen for role change, hint change, turn change */
  useEffect(() => {
    //codenamesAreaController.addListener('occupantsChange', setOccupants);
    if (occupants.length === 4) {
      setIsGameFull(true);
    } else {
      setIsGameFull(false);
    }
    return () => {
      //codenamesAreaController.removeListener('occupantsChange', setOccupants);
    };
  }, [codenamesAreaController, occupants]);

  const toast = useToast();

  const createCodenames = useCallback(async () => {
    if (codenamesArea) {
      const codenamesToCreate: CodenamesAreaModel = {
        id: codenamesAreaController.id,
        occupantsID: [],
        turn: 'Spy1',
        roles: {
          teamOneSpymaster: undefined,
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
      };
      try {
        await coveyTownController.createCodenamesArea(codenamesToCreate);
        toast({
          title: 'Codenames Created!',
          status: 'success',
        });
      } catch (err) {
        if (err instanceof Error) {
          toast({
            title: 'Unable to create game',
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
  }, [codenamesArea, codenamesAreaController, coveyTownController, toast]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        closeGame();
        coveyTownController.unPause();
      }}>
      {/** Displays the waiting screen and changes to the gameboard if the game is now full. */}
      <ModalOverlay />
      <ModalContent hidden={isGameFull}>
        <ModalHeader>New Codenames Game</ModalHeader>
        <ModalCloseButton />
        <Button colorScheme='blue' mr={3} onClick={createCodenames}>
          Join Game
        </Button>
        <ModalBody>Waiting for {4 - occupants.length} more players.</ModalBody>
      </ModalContent>
      <ModalContent hidden={!isGameFull}>
        <ModalHeader>New Codenames Game</ModalHeader>
        <ModalCloseButton />
        <ModalBody>Gameboard</ModalBody>
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
