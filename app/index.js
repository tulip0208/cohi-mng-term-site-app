// index.js
import AppNavigator from './navigation/AppNavigator';
import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import axios from 'axios';
import { Buffer } from 'buffer';
import WA1020 from './screens/WA1020';
global.Buffer = Buffer;
const App = () => {

  useEffect(() => {
  }, []);
  
  return (
    <AppNavigator />      
  );
}
export default App;
