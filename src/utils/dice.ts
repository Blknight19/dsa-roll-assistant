import { DiceRoll } from 'rpg-dice-roller';
/**
 roll.rolls sieht so aus
 [
  {
    "rolls": [
      {
        "calculationValue": 4,
        "initialValue": 4,
        "modifierFlags": "",
        "modifiers": [],
        "type": "result",
        "useInTotal": true,
        "value": 4
      },
      {
        "calculationValue": 2,
        "initialValue": 2,
        "modifierFlags": "",
        "modifiers": [],
        "type": "result",
        "useInTotal": true,
        "value": 2
      },
      {
        "calculationValue": 16,
        "initialValue": 16,
        "modifierFlags": "",
        "modifiers": [],
        "type": "result",
        "useInTotal": true,
        "value": 16
      }
    ],
    "type": "roll-results",
    "value": 22
  }
 ]
 */

export const roll3D20 = () => new DiceRoll('3d20').rolls.flatMap(group => group.rolls.map(die => die.value));

export const roll = (dices:string) => new DiceRoll(dices).rolls.flatMap(group => group.rolls.map(die => die.value));
