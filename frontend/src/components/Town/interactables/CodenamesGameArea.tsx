import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import { useInteractable } from '../../../classes/TownController';
import useTownController from '../../../hooks/useTownController';

export default function CodenamesGameArea(): JSX.Element {
  const coveyTownController = useTownController();
  const newCodenames = useInteractable('gameArea');
  const [isGameFull, setIsGameFull] = useState<boolean>(false);
  const isOpen = newCodenames !== undefined;

  /* closes screen when exit is pressed */
  const closeGame = useCallback(() => {
    if (newCodenames) {
      coveyTownController.interactEnd(newCodenames);
    }
  }, [coveyTownController, newCodenames]);

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
      }}>
      {/** Displays the waiting screen and changes to the gameboard if the game is now full. */}
      <ModalOverlay />
      <ModalContent hidden={isGameFull}>
        <ModalHeader>New Codenames Game</ModalHeader>
        <ModalCloseButton />
        <ModalBody>Waiting for {4 - coveyTownController.players.length} players.</ModalBody>
      </ModalContent>
      <ModalContent hidden={!isGameFull}>
        <ModalHeader>New Codenames Game</ModalHeader>
        <ModalCloseButton />
        <ModalBody>Gameboard</ModalBody>
      </ModalContent>
    </Modal>
  );
}
