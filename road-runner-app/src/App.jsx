
import { useState } from 'react';
import StartPage from './components/StartPage';
import MainPage from './components/MainPage';

function App() {
  const [runMode, setRunMode] = useState(null); // null | 'roundTrip' | 'oneWay'

  if (!runMode) {
    return <StartPage onStart={(mode) => setRunMode(mode)} />;
  }

  return <MainPage runMode={runMode} onBack={() => setRunMode(null)} />;
}

export default App;
