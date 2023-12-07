// SignalStrengthModule.java
package com.andrianucef.ims;

import android.content.Context;
import android.telephony.PhoneStateListener;
import android.telephony.SignalStrength;
import android.telephony.TelephonyManager;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.Promise;
public class SignalStrengthModule extends ReactContextBaseJavaModule {
  private TelephonyManager telephonyManager;

  public SignalStrengthModule(ReactApplicationContext reactContext) {
    super(reactContext);
    telephonyManager = (TelephonyManager) reactContext.getSystemService(Context.TELEPHONY_SERVICE);
  }

  @Override
  public String getName() {
    return "SignalStrengthModule";
  }

  @ReactMethod
  public void getSignalStrength(Promise promise) {
      PhoneStateListener signalStrengthListener = new PhoneStateListener() {
          @Override
          public void onSignalStrengthsChanged(SignalStrength signalStrength) {
              super.onSignalStrengthsChanged(signalStrength);
              int signalLevel = signalStrength.getGsmSignalStrength();
              int dbm = -113 + 2 * signalLevel; // GSMの場合の変換式
              // 省略: シグナル強度取得後の処理
              String connectionQuality="";
              try {

                  if (dbm > -70) {
                      connectionQuality = "良好";
                  } else if (dbm > -85) {
                      connectionQuality = "注意";
                  } else {
                      connectionQuality = "不良";
                  }                  
                  promise.resolve(connectionQuality); // 成功した結果を返す
              } catch (Exception e) {
                  promise.reject("ERROR_GETTING_SIGNAL_STRENGTH", e.getMessage()); // エラーを返す
              }

              // コールバックを呼び出した後にリスナーを解除する
              telephonyManager.listen(this, PhoneStateListener.LISTEN_NONE);
          }
      };

      // リスナーを登録する
      telephonyManager.listen(signalStrengthListener, PhoneStateListener.LISTEN_SIGNAL_STRENGTHS);
  }
}
