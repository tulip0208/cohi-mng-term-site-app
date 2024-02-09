import React, {useState, useEffect} from 'react';
import {
  View,
  TextInput,
  Modal,
  TouchableOpacity,
  FlatList,
  Text,
} from 'react-native';
import {styles} from '../styles/CommonStyle'; // 共通スタイル

interface CustomDropdownInputProps {
  options: string[];
  selectedValue: string;
  onSelect: (item: string) => void;
  onBlur?: () => void;
  numericOnly?: boolean;
}

const CustomDropdownInput = ({
  options,
  selectedValue,
  onSelect,
  onBlur,
  numericOnly = false,
}: CustomDropdownInputProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [value, setValue] = useState(selectedValue || '');

  useEffect(() => {
    setValue(selectedValue || '');
  }, [selectedValue]);

  const handleChangeText = (text: string) => {
    if (numericOnly) {
      if (/^\d*\.?\d*$/.test(text)) {
        // 数値と小数点のみを許可
        setValue(text); // 入力値をローカルステートにセット
        onSelect(text); // 入力値を親コンポーネントに通知
      }
    } else {
      setValue(text); // 入力値をローカルステートにセット
      onSelect(text); // 入力値を親コンポーネントに通知
    }
  };
  const selectItem = (item: string) => {
    setValue(item);
    onSelect(item);
    setIsVisible(false);
  };

  return (
    <View style={styles.containerCdi}>
      <TextInput
        style={styles.inputCdi}
        value={String(value)} // 数値を文字列に変換
        onChangeText={handleChangeText}
        onFocus={() => {
          setIsVisible(false);
        }}
        onBlur={() => {
          if (onBlur) {
            onBlur(); // 任意の追加のブラー処理があれば実行
          }
        }}
        keyboardType={numericOnly ? 'numeric' : 'default'} // numericOnlyに応じてキーボードタイプを変更
      />
      <TouchableOpacity
        style={styles.iconCdi}
        onPress={() => {
          if (options.length > 0) {
            setIsVisible(true);
          }
        }}>
        <Text style={styles.iconTextCdi}>▼</Text>
      </TouchableOpacity>
      <Modal
        animationType="fade"
        transparent={true}
        visible={isVisible}
        onRequestClose={() => setIsVisible(false)}>
        <TouchableOpacity
          style={styles.modalOverlayCdi}
          onPress={() => setIsVisible(false)}>
          <View style={styles.modalContentCdi}>
            <FlatList
              data={options}
              renderItem={({item}) => (
                <TouchableOpacity onPress={() => selectItem(item)}>
                  <Text style={styles.itemTextCdi}>{item}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item, index) => index.toString()}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default CustomDropdownInput;
