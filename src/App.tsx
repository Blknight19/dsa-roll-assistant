
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import './App.css'
import TalentRoll from './components/TalentRoll'
import SimpleRoll from "./components/SimpleRoll"


function App() {
  return (
    <>
    <div className='dark flex flex-col items-center'>
      <Tabs defaultValue="talentRoll" className="min-h-[35rem]">
        <TabsList>
          <TabsTrigger value="talentRoll">Talentroll</TabsTrigger>
          <TabsTrigger value="simpleRoll">Einzelroll</TabsTrigger>
        </TabsList>
        <TabsContent value="talentRoll">
          <TalentRoll/>
        </TabsContent>
        <TabsContent value="simpleRoll">
          <SimpleRoll/>
        </TabsContent>
      </Tabs>
    </div>
    </>
  )
}

export default App
