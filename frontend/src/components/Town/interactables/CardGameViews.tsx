import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
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

  function getDisplayTurn(): string {
    if (currentTurn === 'Spy1') {
      return 'Blue Team Spymaster';
    } else if (currentTurn === 'Spy2') {
      return 'Red Team Spymaster';
    } else if (currentTurn === 'Op1') {
      return 'Blue Team Operative';
    } else {
      return 'Red Team Operative';
    }
  }

  function teamColor(): string {
    if (isTeamOne) {
      return 'blue';
    } else {
      return 'red';
    }
  }

  useEffect(() => {
    const updateIsGameOver = (newGameOverState: { state: boolean; team: string }) => {
      if (newGameOverState.state !== gameOverState) {
        setGameOverState(newGameOverState.state);
      }
      if (newGameOverState.team !== gameOverTeam) {
        setGameOverTeam(newGameOverState.team);
      }
    };
    controller.addListener('turnChange', setCurrentTurn);
    controller.addListener('roleChange', setCurrentRoles);
    controller.addListener('cardChange', setCurrentCards);
    controller.addListener('hintChange', setCurrentHint);
    controller.addListener('isGameOverChange', updateIsGameOver);
    return () => {
      controller.removeListener('turnChange', setCurrentTurn);
      controller.removeListener('roleChange', setCurrentRoles);
      controller.removeListener('cardChange', setCurrentCards);
      controller.removeListener('hintChange', setCurrentHint);
      controller.removeListener('isGameOverChange', updateIsGameOver);
    };
  }, [
    controller,
    setCurrentTurn,
    setCurrentRoles,
    setCurrentCards,
    setCurrentHint,
    setGameOverState,
    setGameOverTeam,
    gameOverState,
    gameOverTeam,
  ]);

  if (
    gameOverState &&
    ((gameOverTeam === 'One' && isTeamOne) || (gameOverTeam === 'Two' && !isTeamOne))
  ) {
    ourPlayer.codenamesWins += 1;
  }

  /* closes screen when exit is pressed */
  const closeModal = useCallback(() => {
    if (controller) {
      townController.interactEnd(codenamesArea);
      townController.unPause();
    }
  }, [codenamesArea, controller, townController]);

  function SpyMasterCardView({ card }: { card: GameCard }) {
    return (
      <>
        <Button
          hidden={card.guessed}
          borderWidth='1px'
          borderRadius='lg'
          overflow='hidden'
          color={card.color}
          boxSize='215'
          height={75}
          justifyContent='center'>
          {card.name}
        </Button>
        <Button
          hidden={!card.guessed}
          borderWidth='1px'
          borderRadius='lg'
          overflow='hidden'
          color={card.color}
          boxSize='215'
          height={75}
          background={'lightgreen'}>
          {card.name}
        </Button>
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
          color='black'
          boxSize='215'
          height={75}
          name={card.name}
          disabled={isDisabled()}
          onClick={() => {
            controller.makeGuess(card.name);
            console.log(controller);
            townController.emitCodenamesAreaUpdate(controller);
            townController.emitPlayerScoreChange(controller);
          }}>
          {card.name}
        </Button>
        <Button
          hidden={!card.guessed}
          borderWidth='1px'
          borderRadius='lg'
          overflow='hidden'
          color={card.color}
          boxSize='215'
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
        <ModalHeader hidden={!isTeamOne} color={teamColor()}>
          Your Team: Blue Team{' '}
        </ModalHeader>
        <ModalHeader hidden={isTeamOne} color={teamColor()}>
          Your Team: Red Team{' '}
        </ModalHeader>
        <ModalHeader>Current Turn: {getDisplayTurn()} </ModalHeader>
        <Wrap className='padding'>
          {currentCards.map(eachCard => (
            <WrapItem key={eachCard.name}>
              <SpyMasterCardView card={eachCard} />
            </WrapItem>
          ))}
        </Wrap>
        <Wrap className='input-style'>
          <Input
            width={500}
            value={hint}
            onChange={event => setHint(event.target.value)}
            name='Hint'
            placeholder='Hint'
          />
          <Input
            width={40}
            value={hintAmount}
            type='number'
            onChange={event => setHintAmount(event.target.value)}
            name='HintAmount'
            placeholder='Amount'
          />
          <Button
            colorScheme={teamColor()}
            type='submit'
            disabled={isDisabled()}
            onClick={async () => {
              controller.hint = { word: hint, quantity: hintAmount };
              townController.emitCodenamesAreaUpdate(controller);
              setHint('');
              setHintAmount('0');
              console.log(controller);
            }}>
            Submit Hint
          </Button>
        </Wrap>
        <ModalBody>
          Hint: {currentHint.word} #: {currentHint.quantity}
        </ModalBody>
      </div>
    );
  }

  function OperativeView({ hidden }: { hidden: boolean }): JSX.Element {
    return (
      <div className='App' hidden={hidden}>
        <ModalHeader hidden={!isTeamOne} color={teamColor()}>
          Your Team: Blue Team{' '}
        </ModalHeader>
        <ModalHeader hidden={isTeamOne} color={teamColor()}>
          Your Team: Red Team{' '}
        </ModalHeader>
        <ModalHeader>Current Turn: {getDisplayTurn()} </ModalHeader>
        <Wrap className='padding'>
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
        <ModalBody
          hidden={
            (isTeamOne && gameOverTeam === 'Two') ||
            (!isTeamOne && gameOverTeam === 'One') ||
            !gameOverState
          }>
          Your team won! Leave the area and rejoin to start a new game.
        </ModalBody>
        <ModalBody
          hidden={
            (isTeamOne && gameOverTeam === 'One') ||
            (!isTeamOne && gameOverTeam === 'Two') ||
            !gameOverState
          }>
          Your team lost! Leave the area and rejoin to start a new game.
        </ModalBody>
        <OperativeView hidden={isSpymaster || gameOverState} />
        <SpyMasterView hidden={!isSpymaster || gameOverState} />
      </ModalContent>
    </Modal>
  );
}
