/**-------------------------------------------
 * ボタン連続押しを制御するフック
 * hooks/buttonControl.tsx
 * ---------------------------------------------*/
import {useState, useCallback} from 'react';
const time = 1.5 * 1000; //ボタン無効化秒数
//カスタムフック
export function useButton(): [boolean, () => void] {
  const [isEnabled, setIsEnabled] = useState<boolean>(true);

  const toggleButton = useCallback(() => {
    setIsEnabled(false);
    setTimeout(() => setIsEnabled(true), time); //指定秒数後有効化
  }, []);

  return [isEnabled, toggleButton];
}
