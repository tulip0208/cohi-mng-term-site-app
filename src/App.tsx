// App.tsx
import AppNavigator from './navigation/AppNavigator';
import React, { useEffect } from 'react';
import { Buffer } from 'buffer';
global.Buffer = Buffer;
const App = () => {
  global.locationStarted = false;
  global.locationStopped = false;
  global.locationErrored = false;
  global.watchId = null;

  useEffect(() => {
  }, []);
  
  return (
    <AppNavigator />      
  );
}
export default App;
