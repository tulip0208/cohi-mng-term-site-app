// App.tsx
import AppNavigator from './navigation/AppNavigator';
import React, { useEffect } from 'react';
import { Buffer } from 'buffer';
import { RecoilRoot } from 'recoil';
global.Buffer = Buffer;
const App = () => {
  global.locationStarted = false;
  global.locationStopped = false;
  global.locationErrored = false;
  global.watchId = null;

  useEffect(() => {
  }, []);
  
  return (
    <RecoilRoot>
      <AppNavigator />      
    </RecoilRoot>
  );
}
export default App;
