
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import './App.css';
import TalentRoll from './components/TalentRoll';
import SimpleRoll from './components/SimpleRoll';
import RollHistory from './components/RollHistory';
import ThemeToggle from './components/ThemeToggle';

function App() {
  return (
    <>
      <div className='min-h-screen bg-background text-foreground p-4 flex flex-col items-center'>
        {/* Desktop: Toggle oben rechts */}
        <div className="hidden md:block absolute top-4 right-4">
          <ThemeToggle />
        </div>

        {/* Mobile: Toggle unten mittig */}
        <div className="block md:hidden fixed bottom-4 left-1/2 transform -translate-x-1/2">
          <ThemeToggle />
        </div>
        <h1 className="text-4xl font-bold mb-4">🧙 DSA Roll Assistant</h1>
        <div className='flex flex-col items-center'>
          <Tabs defaultValue="talentRoll" className="min-h-[35rem]">
            <TabsList>
              <TabsTrigger value="talentRoll">Talentroll</TabsTrigger>
              <TabsTrigger value="simpleRoll">Einzelroll</TabsTrigger>
              <TabsTrigger value="history">Historie</TabsTrigger>
            </TabsList>
            <TabsContent value="talentRoll">
              <TalentRoll />
            </TabsContent>
            <TabsContent value="simpleRoll">
              <SimpleRoll />
            </TabsContent>
            <TabsContent value="history">
              <RollHistory />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}

export default App;
