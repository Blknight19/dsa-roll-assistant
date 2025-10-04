declare module 'rpg-dice-roller' {
  export interface RollResult {
    value: number;
  }

  export interface RollGroup {
    rolls: RollResult[];
  }

  export class DiceRoll {
    rolls: RollGroup[];
    total: number;
    notation: string;
    output: string;
    constructor(notation: string);
  }
}