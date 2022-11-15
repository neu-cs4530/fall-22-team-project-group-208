import {
  Box,
  Button,
  Heading,
  Input,
  Wrap,
  WrapItem
} from '@chakra-ui/react';
import { GameCard } from '@material-ui/core';
import { useState } from 'react';
import './App.css';

function SpyMasterCardView({ card }: { card: GameCard }) {
  return (
    <Box boxSize='sm' borderWidth='1px' borderRadius='lg' overflow='hidden' color={card._team}>
      <Heading as='h4'>
        {card._name}
      </Heading>
    </Box>
  );
}

function OperativeCardView({ card }: { card: GameCard }) {
  return (
    <Button boxSize='sm' borderWidth='1px' borderRadius='lg' overflow='hidden' color="gray" name={card._name}>
      <Heading as='h4'>
        {card._name}
      </Heading>
      onClick={async () => {
        card._name.style.color = card._team
        //await validateButton(player, card)
        // update turn
      }}
    </Button>
  );
}

function SpyMasterView() {
  const cards = initializeCards()
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
          setHintAmount(0);
          // update turn
        }}>
        Submit Hint
      </Button>
    </div>
  );

  function OperativeView() {
    const cards = initializeCards()
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