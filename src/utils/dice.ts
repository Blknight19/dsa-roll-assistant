export const rollDie = (sides: number): number => Math.floor(Math.random() * sides) + 1;

export const rollDice = (count: number, sides: number): number[] =>
  Array.from({ length: count }, () => rollDie(sides));

export const roll3D20 = (): [number, number, number] => [rollDie(20), rollDie(20), rollDie(20)];
