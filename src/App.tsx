import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toaster } from '@/components/ui/sonner';
import './App.css';
import TalentRoll from './components/TalentRoll';
import SimpleRoll from './components/SimpleRoll';
import RollHistory from './components/RollHistory';
import ThemeToggle from './components/ThemeToggle';
import Character from './components/Character';
import { Scroll, Dices, History, User } from 'lucide-react';

function App() {
  return (
    <>
      {/* Aventurian Gradient Background */}
      <div className='min-h-screen bg-aventurian-gradient p-4 flex flex-col'>
        
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-sm bg-background/80 border-b border-aventurian-400 dark:border-aventurian-600 mb-6 -mx-4 px-4 py-3">
          <div className="container mx-auto flex items-center justify-between">
            {/* Logo/Title */}
            <div className="flex items-center gap-3">
              <span className="text-4xl">⚔️</span>
              <div>
                <h1 className="text-2xl md:text-3xl font-heading font-bold text-aventurian-700 dark:text-aventurian-200">
                  Roll-Assistent
                </h1>
              </div>
            </div>
            
            {/* Theme Toggle - Desktop */}
            <div className="hidden md:block">
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto flex-1 flex flex-col items-center">
          <div className='w-full max-w-6xl'>
            <Tabs defaultValue="talentRoll" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6 bg-aventurian-100 dark:bg-aventurian-800">
                <TabsTrigger value="talentRoll"  className="font-heading flex items-center gap-2">
                  <Scroll className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline">Talentprobe</span>
                </TabsTrigger>
                <TabsTrigger value="simpleRoll"  className="font-heading flex items-center gap-2">
                  <Dices className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline">Einzelwurf</span>
                </TabsTrigger>
                <TabsTrigger value="history"  className="font-heading flex items-center gap-2">
                  <History className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline">Historie</span>
                </TabsTrigger>
                <TabsTrigger value="character"  className="font-heading flex items-center gap-2">
                  <User className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline">Charakter</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="talentRoll" className="mt-0">
                <TalentRoll />
              </TabsContent>
              <TabsContent value="simpleRoll" className="mt-0">
                <SimpleRoll />
              </TabsContent>
              <TabsContent value="history" className="mt-0">
                <RollHistory />
              </TabsContent>
              <TabsContent value="character" className="mt-0">
                <Character />
              </TabsContent>
            </Tabs>
          </div>
        </main>

        {/* Mobile Theme Toggle */}
        <div className="md:hidden fixed bottom-6 right-6 z-50">
          <ThemeToggle />
        </div>
      </div>

      <Toaster />
    </>
  );
}

export default App;