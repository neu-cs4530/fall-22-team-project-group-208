import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import CodenamesAreaController from '../../../classes/CodenamesAreaController';
import { useCodenamesAreaController, useInteractable } from '../../../classes/TownController';
import useTownController from '../../../hooks/useTownController';
import CodenamesArea from './GameArea';

export default function CodenamesGameArea(): JSX.Element {
  const coveyTownController = useTownController();
  const newCodenamesArea = useInteractable('codenamesArea');
  //const codenamesController = useCodenamesAreaController(newCodenamesArea?.name);
  const [isGameFull, setIsGameFull] = useState<boolean>(false);
  const isOpen = newCodenamesArea !== undefined;

  useEffect(() => {
    if (newCodenamesArea) {
      coveyTownController.pause();
    } else {
      coveyTownController.unPause();
    }
  }, [coveyTownController, newCodenamesArea]);

  /* closes screen when exit is pressed */
  const closeGame = useCallback(() => {
    if (newCodenamesArea) {
      coveyTownController.interactEnd(newCodenamesArea);
    }
  }, [coveyTownController, newCodenamesArea]);

  /* when the players are updated, checks whether the game is full */
  useEffect(() => {
    // consider when more than 4 players join
    if (coveyTownController.players.length === 4) {
      setIsGameFull(true);
    } else {
      setIsGameFull(false);
    }
  }, [coveyTownController]);

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
        <ModalBody>Waiting for {4 - coveyTownController.players.length} more players.</ModalBody>
      </ModalContent>
      <ModalContent hidden={!isGameFull}>
        <ModalHeader>New Codenames Game</ModalHeader>
        <ModalCloseButton />
        <ModalBody>Gameboard</ModalBody>
      </ModalContent>
    </Modal>
  );
}

// /**
//  * The CodenamesAreaWrapper is suitable to be *always* rendered inside of a town, and
//  * will activate only if the player begins interacting with a codenames area.
//  */
// export default function CodenamesAreaWrapper(): JSX.Element {
//   const codenamesArea = useInteractable('codenamesArea');
//   if (codenamesArea) {
//     return <CodenamesGameArea codenamesArea={codenamesArea} />;
//   }
//   return <></>;
// }
