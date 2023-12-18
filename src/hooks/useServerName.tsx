/**-------------------------------------------
 * 接続先名称取得フック
 * hooks/useServerName.tsx
 * ---------------------------------------------*/
import { useState, useEffect } from 'react';
import { getGlobalServerName } from '../utils/Realm';

export const useServerName = () => {
  const [serverName, setServerName] = useState<string>('');

  useEffect(() => {
    const fetchServerName = async () => {
      const name = getGlobalServerName();
      setServerName(name as string);
    };

    fetchServerName();
  }, []);

  return serverName;
};