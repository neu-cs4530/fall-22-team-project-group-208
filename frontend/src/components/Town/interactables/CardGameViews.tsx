import {
  Box,
  Button,
  Heading,
  Input,
  ModalContent,
  Wrap,
  WrapItem
} from '@chakra-ui/react';
import { useState } from 'react';
import { GameCard } from '../../GameCard';
import './App.css';

function SpyMasterCardView({ card }: { card: GameCard }) {
  return (
    <><ModalContent hidden={card._guessed}>
      <Box boxSize='sm' borderWidth='1px' borderRadius='lg' overflow='hidden' borderColor="gray" color={card._color}>
        <Heading as='h4'>
          {card._name}
        </Heading>
      </Box>
    </ModalContent><ModalContent hidden={!card._guessed}>
        <Box boxSize='sm' borderWidth='1px' borderRadius='lg' overflow='hidden' color={card._color} borderColor={card._color}>
          <Heading as='h4'>
            {card._name}
          </Heading>
        </Box>
      </ModalContent></>
  );
}

function OperativeCardView({ card }: { card: GameCard }) {
  return (
    <><ModalContent hidden={card._guessed}>
      <Button boxSize='sm' borderWidth='1px' borderRadius='lg' overflow='hidden' color="gray" name={card._name}>
        <Heading as='h4'>
          {card._name}
        </Heading>
        onClick={async () => {
          // Call makeGuess with card name
        } }
      </Button>
    </ModalContent><ModalContent hidden={!card._guessed}>
        <Button boxSize='sm' borderWidth='1px' borderRadius='lg' overflow='hidden' color={card._color} name={card._name} disabled={card._guessed}>
          <Heading as='h4'>
            {card._name}
          </Heading>
        </Button>
      </ModalContent></>
  );
}

function SpyMasterView() {
  const cards: GameCard[] = codenamesArea._board;
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
        type="number"
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
          await updateHint(hint, hintAmount);
          setHint('');
          setHintAmount('0');
          // update turn
        }}>
        Submit Hint
      </Button>
    </div>
  );

  function OperativeView() {
    const cards: GameCard[] = codenamesArea._board;
    return (
      <div className='App'>
        <Wrap>
          {cards.map(eachCard: GameCard => (
            <WrapItem key={eachCard._name}>
              <OperativeCardView card={eachCard} />
            </WrapItem>
          ))}
        </Wrap>
      </div>
    );
  }
}