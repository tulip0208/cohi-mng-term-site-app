/**-------------------------------------------
 * カスタム通知プロバイダ
 * react内で呼べるようにトップ層でレンダリング処理
 * ---------------------------------------------*/
// app/components/AlertContext.js
import React, { createContext, useState, useContext } from 'react';
import CustomAlertComponent from './CustomAlert'; // ここでUIコンポーネントをインポート
const AlertContext = createContext();
export const useAlert = () => useContext(AlertContext);
export const AlertProvider = ({ children }) => {
    const [alert, setAlert] = useState({ visible: false, title: '', message: '', resolve: null, showCancelButton: true });

    /************************************************
     * カスタム通知呼び出し関数
     ************************************************/
    const showAlert = (title, message, showCancelButton) => {
      return new Promise((resolve) => {
        setAlert({ visible: true, title, message, resolve, showCancelButton });
      });
    };
  
    const hideAlert = (result) => {
      if (alert.resolve) {
        alert.resolve(result);
      }
      setAlert({ ...alert, visible: false });
    };
  
    return (
      <AlertContext.Provider value={{ alert, showAlert, hideAlert }}>
        {children}
        {alert.visible && (
          <CustomAlertComponent
            title={alert.title}
            message={alert.message}
            onConfirm={() => hideAlert(true)}
            onCancel={() => hideAlert(false)}
            showCancelButton={alert.showCancelButton}
          />
        )}
      </AlertContext.Provider>
    );
  };