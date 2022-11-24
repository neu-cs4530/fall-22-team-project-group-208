import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  ModalBody,
  ModalContent,
  ModalFooter,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import CodenamesAreaController from '../../../classes/CodenamesAreaController';
import PlayerController from '../../../classes/PlayerController';
import TownController from '../../../classes/TownController';
import { GameCard } from '../../../types/CoveyTownSocket';

export default function CardGameViews({
  controller,
  ourPlayer,
  townController,
}: {
  controller: CodenamesAreaController;
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
  const isSpymaster =
    ourPlayer.id === currentRoles.teamOneSpymaster ||
    ourPlayer.id === currentRoles.teamTwoSpymaster;
  const isTeamOne =
    ourPlayer.id === currentRoles.teamOneSpymaster ||
    ourPlayer.id === currentRoles.teamOneOperative;

  useEffect(() => {
    controller.addListener('turnChange', setCurrentTurn);
    controller.addListener('roleChange', setCurrentRoles);
    controller.addListener('cardChange', setCurrentCards);
    controller.addListener('hintChange', setCurrentHint);
    return () => {
      controller.removeListener('turnChange', setCurrentTurn);
      controller.removeListener('roleChange', setCurrentRoles);
      controller.removeListener('cardChange', setCurrentCards);
      controller.removeListener('hintChange', setCurrentHint);
    };
  }, [controller]);

  function SpyMasterCardView({ card }: { card: GameCard }) {
    return (
      <>
        <ModalContent hidden={card.guessed}>
          <Box
            boxSize='sm'
            borderWidth='1px'
            borderRadius='lg'
            overflow='hidden'
            borderColor='gray'
            color={card.color}>
            <Heading as='h4'>{card.name}</Heading>
          </Box>
        </ModalContent>
        <ModalContent hidden={!card.guessed}>
          <Box
            boxSize='sm'
            borderWidth='1px'
            borderRadius='lg'
            overflow='hidden'
            color={card.color}
            borderColor={card.color}>
            <Heading as='h4'>{card.name}</Heading>
          </Box>
        </ModalContent>
      </>
    );
  }

  function OperativeCardView({ card }: { card: GameCard }) {
    return (
      <>
        <ModalContent hidden={card.guessed}>
          <Button
            boxSize='sm'
            borderWidth='1px'
            borderRadius='lg'
            overflow='hidden'
            color='gray'
            name={card.name}
            // disable if isTeamOne is true and teamOneSpyorOp === ourPlayer id is false
            // or if isTeamOne is false and teamTwoSpyorOp === ourPlayer id is false
            disabled={true}>
            <Heading as='h4'>{card.name}</Heading>
            onClick=
            {async () => {
              // Call makeGuess with card name
              // emit with town controller
            }}
          </Button>
        </ModalContent>
        <ModalContent hidden={!card.guessed}>
          <Button
            boxSize='sm'
            borderWidth='1px'
            borderRadius='lg'
            overflow='hidden'
            color={card.color}
            name={card.name}
            disabled={card.guessed}>
            <Heading as='h4'>{card.name}</Heading>
          </Button>
        </ModalContent>
      </>
    );
  }

  function SpyMasterView({ hidden }: { hidden: boolean }): JSX.Element {
    const cards: GameCard[] = controller.board;
    const [hint, setHint] = useState<string>('');
    const [hintAmount, setHintAmount] = useState<string>('0');
    return (
      <div className='App' hidden={hidden}>
        <Wrap>
          {cards.map(eachCard => (
            <WrapItem key={eachCard.name}>
              <SpyMasterCardView card={eachCard} />
            </WrapItem>
          ))}
        </Wrap>
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
          // Need to figure out how to disable depending on the turn
          // disable if isTeamOne is true and teamOneSpyorOp === ourPlayer id is false
          // or if isTeamOne is false and teamTwoSpyorOp === ourPlayer id is false
          disabled={true}
          onClick={async () => {
            controller.hint = { word: hint, quantity: hintAmount };
            // update turn
            // controller.updateTurn(currentTurn);
            townController.emitCodenamesAreaUpdate(controller);
            setHint('');
            setHintAmount('0');
          }}>
          Submit Hint
        </Button>
      </div>
    );
  }

  function OperativeView({ hidden }: { hidden: boolean }): JSX.Element {
    const cards: GameCard[] = controller.board;
    return (
      <div className='App' hidden={hidden}>
        <Wrap>
          {cards.map(eachCard => (
            <WrapItem key={eachCard.name}>
              <OperativeCardView card={eachCard} />
            </WrapItem>
          ))}
        </Wrap>
      </div>
    );
  }
  return (
    <>
      <OperativeView hidden={isSpymaster} />
      <SpyMasterView hidden={!isSpymaster} />
    </>
    // add endgame screen
  );
}
