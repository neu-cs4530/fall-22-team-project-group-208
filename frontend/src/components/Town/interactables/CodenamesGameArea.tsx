import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useToast,
} from '@chakra-ui/react';
import { isEmpty } from 'lodash';
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
    // change to if boolean that all 4 players have been assigned roles returns true
    if (codenamesAreaController.isActive) {
      setIsGameFull(true);
    } else {
      setIsGameFull(false);
    }
  }, [coveyTownController, codenamesArea, codenamesAreaController]);

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
  }, [codenamesAreaController, coveyTownController, toast]);

  /**
   * add an else if checking if game is full
   */
  function joinCodenames() {
    if (codenamesAreaController.occupants.length === 0) {
      createCodenames();
      closeModal();
    } else {
      toast({
        title: 'Game is currently full!',
        status: 'error',
      });
      closeModal();
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        closeModal();
        coveyTownController.unPause();
      }}>
      <ModalOverlay />
      <ModalContent hidden={!isGameFull}>
        <ModalHeader>Game is currently full!</ModalHeader>
        <ModalCloseButton />
        <ModalBody>Please try joining again once the game is finished.</ModalBody>
      </ModalContent>
      <ModalContent hidden={isGameFull}>
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
