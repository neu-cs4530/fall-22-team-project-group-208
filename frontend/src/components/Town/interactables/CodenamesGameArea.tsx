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
import { useInteractable } from '../../../classes/TownController';
import useTownController from '../../../hooks/useTownController';

export default function CodenamesGameArea({
  controller,
}: {
  controller: CodenamesAreaController;
}): JSX.Element {
  const coveyTownController = useTownController();
  const newCodenames = useInteractable('gameArea');
  const [isGameFull, setIsGameFull] = useState<boolean>(false);
  const [currentTurn, setCurrentTurn] = useState<Turn>(Turn.TeamOneSpymaster);
  const isOpen = newCodenames !== undefined;
  const isSpymaster =
    coveyTownController.ourPlayer === controller.TeamOneSpymaster ||
    coveyTownController.ourPlayer === controller.TeamTwoSpymaster;

  /* closes screen when exit is pressed */
  const closeGame = useCallback(() => {
    if (newCodenames) {
      coveyTownController.interactEnd(newCodenames);
    }
  }, [coveyTownController, newCodenames]);

  useEffect(() => {
    /* when the players are updated, checks whether the game is full. */
    if (controller.occupants.length >= 4) {
      setIsGameFull(true);
    } else {
      setIsGameFull(false);
    }
    /* when the turn is updated in the controller, set the turn to be the next turn */
    const changeTurn = (updatedTurn: Turn) => {
      setCurrentTurn(updatedTurn);
      switch (updatedTurn) {
        case Turn.TeamOneSpymaster:
          setCurrentTurn(Turn.TeamOneOperative);
          break;
        case Turn.TeamTwoSpymaster:
          setCurrentTurn(Turn.TeamTwoOperative);
          break;
        case Turn.TeamOneOperative:
          setCurrentTurn(Turn.TeamTwoSpymaster);
          break;
        case Turn.TeamTwoOperative:
          setCurrentTurn(Turn.TeamOneSpymaster);
          break;
        default:
          throw new Error('has to have a next turn');
      }
    };
    const changeCards = (updatedCards: GameCard[][]) => {
      /* set controller cards to updated cards and emit an event */
    };
    const changeHint = (newHint: { word: string; quantity: number }) => {
      /* set controller hint to updated hint and emit an event */
    };
    controller.addListener('turnChange', changeTurn);
    controller.addListener('cardChange', changeCards);
    controller.addListener('hintChange', changeHint);
    return () => {
      controller.removeListener('turnChange', changeTurn);
      controller.removeListener('cardChange', changeCards);
      controller.removeListener('hintChange', changeHint);
    };
  }, [controller]);

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
        <ModalBody>Waiting for {4 - controller.occupants.length} more players.</ModalBody>
      </ModalContent>
      <CodenamesModal
        isOpen={isGameFull}
        close={() => setIsGameFull(false)}
        turn={currentTurn}
        role={isSpymaster}
      />
    </Modal>
  );
}
