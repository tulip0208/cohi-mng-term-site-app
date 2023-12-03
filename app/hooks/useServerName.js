/**
 * 接続先名称取得フック
 * 
 */
// hooks/useServerName.js
import { useState, useEffect } from 'react';
import { getGlobalServerName } from '../utils/Realm';

export const useServerName = () => {
  const [serverName, setServerName] = useState('');

  useEffect(() => {
    const fetchServerName = async () => {
      const name = await getGlobalServerName();
      setServerName(name);
    };

    fetchServerName();
  }, []);

  return serverName;
};