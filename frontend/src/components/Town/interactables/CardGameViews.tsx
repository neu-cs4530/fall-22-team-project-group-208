import {
  Box,
  Button,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  useToast,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import CodenamesAreaController from '../../../classes/CodenamesAreaController';
import PlayerController from '../../../classes/PlayerController';
import TownController from '../../../classes/TownController';
import CodenamesAreaInteractable from './GameArea';
import { GameCard } from '../../../types/CoveyTownSocket';

export default function CardGameViews({
  controller,
  codenamesArea,
  ourPlayer,
  townController,
}: {
  controller: CodenamesAreaController;
  codenamesArea: CodenamesAreaInteractable;
  ourPlayer: PlayerController;
  townController: TownController;
}): JSX.Element {
  const [currentTurn, setCurrentTurn] = useState<string>(controller.turn);
  const [currentCards, setCurrentCards] = useState<GameCard[]>(controller.board);
  const [currentRoles, setCurrentRoles] = useState<{
    teamOneSpymaster: string | undefined;
    teamOneOperative: string | undefined;
    teamTwoSpymaster: string | undefined;
    teamTwoOperative: string | undefined;
  }>(controller.roles);
  const [currentHint, setCurrentHint] = useState<{ word: string; quantity: string }>(
    controller.hint,
  );
  const [gameOverTeam, setGameOverTeam] = useState<string>(controller.isGameOver.team);
  const [gameOverState, setGameOverState] = useState<boolean>(controller.isGameOver.state);
  const isSpymaster =
    ourPlayer.id === currentRoles.teamOneSpymaster ||
    ourPlayer.id === currentRoles.teamTwoSpymaster;
  const isTeamOne =
    ourPlayer.id === currentRoles.teamOneSpymaster ||
    ourPlayer.id === currentRoles.teamOneOperative;
  const isOpen = controller !== undefined;

  function isDisabled(): boolean {
    if (isTeamOne && isSpymaster) {
      return currentTurn !== 'Spy1';
    } else if (!isTeamOne && isSpymaster) {
      return currentTurn !== 'Spy2';
    } else if (isTeamOne && !isSpymaster) {
      return currentTurn !== 'Op1';
    } else {
      return currentTurn !== 'Op2';
    }
  }

  useEffect(() => {
    // const updateIsGameOver = (newGameOverState: { state: boolean; team: string }) => {
    //   if (newGameOverState.state !== gameOverState) {
    //     setGameOverState(newGameOverState.state);
    //   }
    //   if (newGameOverState.team !== gameOverTeam) {
    //     setGameOverTeam(newGameOverState.team);
    //   }
    // };
    controller.addListener('turnChange', setCurrentTurn);
    controller.addListener('roleChange', setCurrentRoles);
    controller.addListener('cardChange', setCurrentCards);
    controller.addListener('hintChange', setCurrentHint);
    // controller.addListener('isGameOverChange', updateIsGameOver);
    return () => {
      controller.removeListener('turnChange', setCurrentTurn);
      controller.removeListener('roleChange', setCurrentRoles);
      controller.removeListener('cardChange', setCurrentCards);
      controller.removeListener('hintChange', setCurrentHint);
      // controller.removeListener('isGameOverChange', updateIsGameOver);
    };
  }, [
    controller,
    setCurrentTurn,
    setCurrentRoles,
    setCurrentCards,
    setCurrentHint,
    // setGameOverState,
    // setGameOverTeam,
    // gameOverState,
    // gameOverTeam,
  ]);

  /* closes screen when exit is pressed */
  const closeModal = useCallback(() => {
    if (controller) {
      townController.interactEnd(codenamesArea);
      townController.unPause();
    }
  }, [codenamesArea, controller, townController]);

  const toast = useToast();

  function SpyMasterCardView({ card }: { card: GameCard }) {
    return (
      <>
        <Box
          hidden={card.guessed}
          borderWidth='1px'
          borderRadius='lg'
          overflow='hidden'
          borderColor='gray'
          color={card.color}
          boxSize='200'
          height={75}
          justifyContent='center'>
          {card.name}
        </Box>
        <Box
          hidden={!card.guessed}
          borderWidth='1px'
          borderRadius='lg'
          overflow='hidden'
          color={card.color}
          boxSize='200'
          height={75}
          borderColor={card.color}
          background={'lightgreen'}>
          {card.name}
        </Box>
      </>
    );
  }

  function OperativeCardView({ card }: { card: GameCard }) {
    return (
      <>
        <Button
          hidden={card.guessed}
          borderWidth='1px'
          borderRadius='lg'
          overflow='hidden'
          color='gray'
          boxSize='200'
          height={75}
          name={card.name}
          disabled={isDisabled()}
          onClick={() => {
            controller.makeGuess(card.name);
            console.log(controller);
            townController.emitCodenamesAreaUpdate(controller);
            console.log('clicked card');
          }}>
          {card.name}
        </Button>
        <Button
          hidden={!card.guessed}
          borderWidth='1px'
          borderRadius='lg'
          overflow='hidden'
          color={card.color}
          boxSize='200'
          height={75}
          name={card.name}
          disabled={card.guessed}>
          {card.name}
        </Button>
      </>
    );
  }

  function SpyMasterView({ hidden }: { hidden: boolean }): JSX.Element {
    const [hint, setHint] = useState<string>('');
    const [hintAmount, setHintAmount] = useState<string>('0');
    return (
      <div className='App' hidden={hidden}>
        <ModalHeader hidden={!isTeamOne}>Your Team: Blue Team </ModalHeader>
        <ModalHeader hidden={isTeamOne}>Your Team: Red Team </ModalHeader>
        <ModalHeader>Current Turn: {currentTurn} </ModalHeader>
        <Wrap>
          {currentCards.map(eachCard => (
            <WrapItem key={eachCard.name}>
              <SpyMasterCardView card={eachCard} />
            </WrapItem>
          ))}
          <Wrap></Wrap>
          <Input
            value={hint}
            onChange={event => setHint(event.target.value)}
            name='Hint'
            placeholder='Hint'
          />
          <Input
            value={hintAmount}
            type='number'
            onChange={event => setHintAmount(event.target.value)}
            name='HintAmount'
            placeholder='Amount'
          />
          <Button
            colorScheme='blue'
            type='submit'
            disabled={isDisabled()}
            onClick={async () => {
              controller.hint = { word: hint, quantity: hintAmount };
              townController.emitCodenamesAreaUpdate(controller);
              setHint('');
              setHintAmount('0');
              console.log('set hint');
              console.log(controller);
            }}>
            Submit Hint
          </Button>
        </Wrap>
      </div>
    );
  }

  function OperativeView({ hidden }: { hidden: boolean }): JSX.Element {
    if (
      ((isTeamOne && gameOverTeam === 'Two') || (!isTeamOne && gameOverTeam === 'One')) &&
      gameOverState
    ) {
      toast({
        title: 'Your team lost!',
        description: 'Leave the area and rejoin to start a new game.',
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
    } else if (
      ((isTeamOne && gameOverTeam === 'One') || (!isTeamOne && gameOverTeam === 'Two')) &&
      gameOverState
    ) {
      toast({
        title: 'Your team won!',
        description: 'Leave the area and rejoin to start a new game.',
        status: 'success',
        duration: 9000,
        isClosable: true,
      });
    }
    return (
      <div className='App' hidden={hidden}>
        <ModalHeader hidden={!isTeamOne}>
          Your Team: Blue Team and teamCards = {controller.teamOneWordsRemaining}
        </ModalHeader>
        <ModalHeader hidden={isTeamOne}>Your Team: Red Team </ModalHeader>
        <ModalHeader>Current Turn: {currentTurn} </ModalHeader>
        <Wrap>
          {currentCards.map(eachCard => (
            <WrapItem key={eachCard.name}>
              <OperativeCardView card={eachCard} />
            </WrapItem>
          ))}
        </Wrap>
        <ModalBody>
          Hint: {currentHint.word} #: {currentHint.quantity}
        </ModalBody>
      </div>
    );
  }

  return (
    <Modal
      size='6xl'
      isOpen={isOpen}
      onClose={() => {
        controller.removePlayer(ourPlayer);
        townController.emitCodenamesAreaUpdate(controller);
        closeModal();
      }}>
      <ModalContent>
        <ModalCloseButton />
        <OperativeView hidden={isSpymaster || gameOverState} />
        <SpyMasterView hidden={!isSpymaster || gameOverState} />
      </ModalContent>
    </Modal>
  );
}
