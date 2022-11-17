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
  Box,
  Heading,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import useTownController from '../../../hooks/useTownController';
import { GameCard } from '../../GameCard';

export default function CodenamesModal({
  isOpen,
  close,
  codenamesArea,
  role,
  team,
}: {
  isOpen: boolean;
  close: () => void;
  codenamesArea: CodenamesArea;
  role: boolean;
  team: boolean;
}): JSX.Element {
  const coveyTownController = useTownController();
  const codenamesAreaController = useCodenamesAreaController(codenamesArea?.name);

  useEffect(() => {
    if (isOpen) {
      coveyTownController.pause();
    } else {
      coveyTownController.unPause();
    }
  }, [coveyTownController, isOpen]);

  const closeModal = useCallback(() => {
    coveyTownController.unPause();
    close();
  }, [coveyTownController, close]);

  function SpyMasterCardView({ card }: { card: GameCard }) {
    return (
      <Box boxSize='sm' borderWidth='1px' borderRadius='lg' overflow='hidden' color={card._color}>
        <Heading as='h4'>{card._name}</Heading>
      </Box>
    );
  }

  function OperativeCardView({ card }: { card: GameCard }) {
    return (
      <Button
        boxSize='sm'
        borderWidth='1px'
        borderRadius='lg'
        overflow='hidden'
        color='gray'
        name={card._name}
        disabled={
          !(team && codenamesArea.turn === codenamesAreaController.TeamOneOperative) ||
          !(!team && codenamesArea.turn === codenamesAreaController.TeamTwoOperative)
        }>
        <Heading as='h4'>{card._name}</Heading>
        onClick=
        {async () => {
          //card.style.color = card._color;
          //await validateButton(player, card)
          // update turn
        }}
      </Button>
    );
  }

  function SpyMasterView() {
    const cards = GameCard.initializeCards();
    const [hint, setHint] = useState<string>('');
    const [hintAmount, setHintAmount] = useState<string>('0');
    return (
      <div className='App'>
        <Wrap>
          {cards.map(eachCard => (
            <WrapItem key={eachCard._name}>
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
          // Need to figure out how to disable depending on the turn
          colorScheme='blue'
          type='submit'
          onClick={async () => {
            // Whatever the function in the controller is
            await codenamesAreaController.updateHint(hint, hintAmount);
            setHint('');
            setHintAmount('0');
            // update turn
          }}
          disabled={
            !(team && codenamesArea.turn === codenamesAreaController.TeamOneSpymaster) ||
            !(!team && codenamesArea.turn === codenamesAreaController.TeamTwoSpymaster)
          }>
          Submit Hint
        </Button>
      </div>
    );
  }

  function OperativeView() {
    const cards = GameCard.initializeCards();
    return (
      <div className='App'>
        <Wrap>
          {cards.map(eachCard => (
            <WrapItem key={eachCard._name}>
              <OperativeCardView card={eachCard} />
            </WrapItem>
          ))}
        </Wrap>
      </div>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        closeModal();
        coveyTownController.unPause();
      }}>
      <ModalOverlay />
      <ModalContent hidden={!role}>
        <ModalHeader>Codenames Game In Progress</ModalHeader>
        <ModalCloseButton />
        <SpyMasterView></SpyMasterView>
      </ModalContent>
      <ModalContent hidden={role}>
        <ModalHeader>Codenames Game In Progress</ModalHeader>
        <ModalCloseButton />
        <OperativeView></OperativeView>
      </ModalContent>
    </Modal>
  );
}
