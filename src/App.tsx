import { useState } from 'react'
import { roll3D20 } from './utils/dice'
import PropertyNumber from './components/PropertyNumber'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import './App.css'


function App() {
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
  // Modifier kann auch mit rein
  return (
    <>
    
    <div className='dark flex flex-col items-center'>
      <Tabs defaultValue="account" className="h-[35rem]">
        <TabsList>
          <TabsTrigger value="account">Talentroll</TabsTrigger>
          <TabsTrigger value="password">Einzelroll</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <div className='flex space-x-6'>
            <PropertyNumber label='Eigenschaft 1' value={firstProperty} onChange={setFirstProperty}/>
            <PropertyNumber label='Eigenschaft 2' value={secondProperty} onChange={setSecondProperty}/>
            <PropertyNumber label='Eigenschaft 3' value={thirdProperty} onChange={setThirdProperty} min={-100}/>
            <PropertyNumber label='Modifier' value={modifier} onChange={setModifier} min={-20} max={20}/>
          </div>
          <div>
            <PropertyNumber label='Talentwert' value={talentValue} onChange={setTalentValue}/>
          </div>
          <div className="card">
            <button onClick={handleRoll}>
              {rollResult.length===0?'Roll':rollResult.join(', ')}
            </button>
          </div>
          {talentResults.length >0 && (<div className='card'>
          <ul>
              <li>Eigenschaft 1 - Würfelzahl + Modifier: {talentResults[0]}</li>
              <li>Eigenschaft 2 - Würfelzahl + Modifier: {talentResults[1]}</li>
              <li>Eigenschaft 3 - Würfelzahl + Modifier: {talentResults[2]}</li>
          </ul>
          <p>{getResult()}</p>
          </div>)}
        </TabsContent>
        <TabsContent value="password">
          <div className='flex'>
            <div className="card">D20</div>
            <div className="card">D10</div>
            <div className="card">D6</div>
          </div>
        </TabsContent>
      </Tabs>

    </div>
    </>
  )
}

export default App
