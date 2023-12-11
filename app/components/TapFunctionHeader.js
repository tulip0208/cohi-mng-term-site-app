/**-------------------------------------------
 * 共通_機能・アプリ種別ヘッダ・タップ機能
 * 
 * ---------------------------------------------*/
// app/components/TapFunctionHeader.js
import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, View  } from 'react-native';
import { styles } from '../styles/CommonStyle'; // 共通スタイル
import { logScreen,logUserAction } from '../utils/Log';

const TapFunctionHeader = ({appType,viewTitle,functionTitle,navigation,sourceScreenId}) => {
  const [tapCount, setTapCount] = useState(0);
  const [timerId, setTimerId] = useState(null);

  useEffect(() => {
    if (tapCount === 5) {
      // 画面遷移後はタップカウンターをリセット
      setTapCount(0);      
      clearTimeout(timerId);
      logUserAction(`ボタン押下:端末設定`);
      logScreen(`画面遷移: WA1050_端末設定`);
      navigation.navigate('WA1050',{ sourceScreenId:sourceScreenId }); // 画面遷移のロジック
    }
  }, [tapCount]);

  const handleTitleTap = () => {
    console.log("count tap ",tapCount+1);
    // タイマーがすでにある場合はリセット
    if (timerId) {
      clearTimeout(timerId)
    };

    // タップカウンターを更新
    setTapCount(prevCount => prevCount + 1);

    // 5秒後にタップカウンターをリセットするタイマーを設定
    const newTimerId = setTimeout(() => {
      if (tapCount < 5) {
        setTapCount(0);
        console.log("count tap reset 0")
      }
    }, 5000);

    setTimerId(newTimerId);
  };
    
  return (
    <TouchableOpacity onPress={handleTitleTap}>
      <View style={styles.functionHeaderContainer}>
        <Text style={styles.functionHeaderLeft}>{appType}</Text>
        <Text style={styles.functionHeaderMiddle}>{viewTitle}</Text>
        <Text style={styles.functionHeaderRight}>{functionTitle}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default TapFunctionHeader;
