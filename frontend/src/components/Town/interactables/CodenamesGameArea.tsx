import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import { useCodenamesAreaController, useInteractable } from '../../../classes/TownController';
import useTownController from '../../../hooks/useTownController';
import CodenamesAreaInteractable from './GameArea';

export function CodenamesGameArea({
  codenamesArea,
}: {
  codenamesArea: CodenamesAreaInteractable;
}): JSX.Element {
  const coveyTownController = useTownController();
  const codenamesAreaController = useCodenamesAreaController(codenamesArea.id);
  const [isGameFull, setIsGameFull] = useState<boolean>(false);
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
  useEffect(() => {
    console.log(codenamesAreaController.occupants.length);
    if (codenamesAreaController.occupants.length === 4) {
      setIsGameFull(true);
    } else {
      setIsGameFull(false);
    }
  }, [codenamesAreaController]);

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
        <ModalBody>
          Waiting for {4 - codenamesAreaController.occupants.length} more players.
        </ModalBody>
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
