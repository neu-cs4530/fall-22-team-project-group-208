export {};
// import { Box, Button, Heading, Input, ModalContent, Wrap, WrapItem } from '@chakra-ui/react';
// import React, { useState } from 'react';
// import { GameCard } from '../../../types/CoveyTownSocket';
// import './App.css';

// function SpyMasterCardView({ card }: { card: GameCard }) {
//   return (
//     <>
//       <ModalContent hidden={card.guessed}>
//         <Box
//           boxSize='sm'
//           borderWidth='1px'
//           borderRadius='lg'
//           overflow='hidden'
//           borderColor='gray'
//           color={card.color}>
//           <Heading as='h4'>{card.name}</Heading>
//         </Box>
//       </ModalContent>
//       <ModalContent hidden={!card.guessed}>
//         <Box
//           boxSize='sm'
//           borderWidth='1px'
//           borderRadius='lg'
//           overflow='hidden'
//           color={card.color}
//           borderColor={card.color}>
//           <Heading as='h4'>{card.name}</Heading>
//         </Box>
//       </ModalContent>
//     </>
//   );
// }

// function OperativeCardView({ card }: { card: GameCard }) {
//   return (
//     <>
//       <ModalContent hidden={card.guessed}>
//         <Button
//           boxSize='sm'
//           borderWidth='1px'
//           borderRadius='lg'
//           overflow='hidden'
//           color='gray'
//           name={card.name}>
//           <Heading as='h4'>{card.name}</Heading>
//           onClick=
//           {async () => {
//             // Call makeGuess with card name
//           }}
//         </Button>
//       </ModalContent>
//       <ModalContent hidden={!card.guessed}>
//         <Button
//           boxSize='sm'
//           borderWidth='1px'
//           borderRadius='lg'
//           overflow='hidden'
//           color={card.color}
//           name={card.name}
//           disabled={card.guessed}>
//           <Heading as='h4'>{card.name}</Heading>
//         </Button>
//       </ModalContent>
//     </>
//   );
// }

// function SpyMasterView() {
//   // const cards: GameCard[] = codenamesArea._board;
//   const cards: GameCard[] = []; // JUST A FILLER
//   const [hint, setHint] = useState<string>('');
//   const [hintAmount, setHintAmount] = useState<string>('0');
//   return (
//     <div className='App'>
//       <Wrap>
//         {cards.map(eachCard => (
//           <WrapItem key={eachCard.name}>
//             <SpyMasterCardView card={eachCard} />
//           </WrapItem>
//         ))}
//       </Wrap>
//       <Input
//         value={hint}
//         onChange={event => setHint(event.target.value)}
//         name='Hint'
//         placeholder='Hint'
//       />
//       <Input
//         value={hintAmount}
//         type='number'
//         onChange={event => setHintAmount(event.target.value)}
//         name='HintAmount'
//         placeholder='Amount'
//       />
//       <Button
//         // Need to figure out how to disable depending on the turn
//         colorScheme='blue'
//         type='submit'
//         onClick={async () => {
//           // Whatever the function in the controller is
//           // await updateHint(hint, hintAmount);
//           setHint('');
//           setHintAmount('0');
//           // update turn
//         }}>
//         Submit Hint
//       </Button>
//     </div>
//   );
// }

// function OperativeView() {
//   // const cards: GameCard[] = codenamesArea.board;
//   const cards: GameCard[] = []; // JUST A FILLER
//   return (
//     <div className='App'>
//       <Wrap>
//         {cards.map(eachCard => (
//           <WrapItem key={eachCard.name}>
//             <OperativeCardView card={eachCard} />
//           </WrapItem>
//         ))}
//       </Wrap>
//     </div>
//   );
// }
