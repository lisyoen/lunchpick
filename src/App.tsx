import { useState } from 'react';
import './App.css';
import { CreateRoomScreen } from './screens/CreateRoomScreen';
import { HomeScreen } from './screens/HomeScreen';
import { RoomScreen } from './screens/RoomScreen';
import type { Screen } from './types';

function App() {
  const [screen, setScreen] = useState<Screen>({ type: 'home' });

  return (
    <div>
      {screen.type === 'home' && <HomeScreen onNavigate={setScreen} />}
      {screen.type === 'create' && <CreateRoomScreen onNavigate={setScreen} />}
      {screen.type === 'room' && (
        <RoomScreen code={screen.code} onNavigate={setScreen} />
      )}
    </div>
  );
}

export default App;
