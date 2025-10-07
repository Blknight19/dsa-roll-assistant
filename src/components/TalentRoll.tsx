import { useState } from 'react'
import { roll3D20 } from '../utils/dice'
import PropertyNumber from './PropertyNumber'


const TalentRoll =() => {

  const [firstProperty,setFirstProperty] = useState<number>(10)
  const [secondProperty,setSecondProperty] = useState<number>(10)
  const [thirdProperty,setThirdProperty] = useState<number>(10)
  const [modifier,setModifier] = useState<number>(0)
  const [talentValue,setTalentValue] =useState<number>(10)
  const [rollResult,setRollResult]= useState<number[]>([])
  const [talentResults,setTalentResults] =useState<number[]>([])

  const getCorrectPropertyValue=(rollResult:number): number => rollResult < 0 ? rollResult: 0

  const handleRoll=()=>{
    const roll= roll3D20()
    setRollResult(roll)
    const results= [
      getCorrectPropertyValue(firstProperty + modifier - roll[0]),
      getCorrectPropertyValue(secondProperty + modifier - roll[1]),
      getCorrectPropertyValue(thirdProperty + modifier - roll[2])
    ]
    setTalentResults(results)
  }

  const getTalentEvaluation=():number=>talentValue +talentResults[0]+talentResults[1]+talentResults[2]

  const getQualityLevel=():number=> {
    const level= Math.ceil(getTalentEvaluation()/3)
    return level >=0 ? level: 0
  }

  const getResult =()=>{
    const talentEvaluation =getTalentEvaluation() 
    let output= `Ergebnis: ${getTalentEvaluation()} `
    output += talentEvaluation >= 0? `(QS: ${getQualityLevel()})`: `(Misslungen)`
    return output
  }

    return (
        <div className='flex flex-col items-center space-y-6'>
            <div className='grid grid-cols-3 gap-4 max-w-[800px] place-items-center'>
              <PropertyNumber label='Eigenschaft 1' value={firstProperty} onChange={setFirstProperty}/>
              <PropertyNumber label='Eigenschaft 2' value={secondProperty} onChange={setSecondProperty}/>
              <PropertyNumber label='Eigenschaft 3' value={thirdProperty} onChange={setThirdProperty} min={-100}/>
              <div className="col-start-2">
                <PropertyNumber label='Modifier' value={modifier} onChange={setModifier} min={-20} max={20} size='s'/>
              </div>
            </div>
            
              <PropertyNumber label='Talentwert' value={talentValue} onChange={setTalentValue}/>
            <div className="p-4">
              <button onClick={handleRoll}>
                {rollResult.length===0?'Roll':rollResult.join(', ')}
              </button>
            </div>
            {talentResults.length >0 && (<div>
            <p>{getResult()}</p>
            <ul className='text-muted-foreground mt-4'>
                <li>Eigenschaft 1 - Würfelzahl + Modifier: {talentResults[0]}</li>
                <li>Eigenschaft 2 - Würfelzahl + Modifier: {talentResults[1]}</li>
                <li>Eigenschaft 3 - Würfelzahl + Modifier: {talentResults[2]}</li>
            </ul>
            </div>)}
          </div>
    )
}

export default TalentRoll