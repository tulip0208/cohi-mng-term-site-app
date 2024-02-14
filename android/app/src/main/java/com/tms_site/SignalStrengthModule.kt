package com.tms_site

import android.telephony.PhoneStateListener
import android.telephony.SignalStrength
import android.telephony.TelephonyManager
import android.content.Context
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

class SignalStrengthModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val telephonyManager: TelephonyManager = reactContext.getSystemService(Context.TELEPHONY_SERVICE) as TelephonyManager

    override fun getName(): String {
        return "SignalStrengthModule"
    }

    @ReactMethod
    fun getSignalStrength(promise: Promise) {
        telephonyManager.listen(object : PhoneStateListener() {
            override fun onSignalStrengthsChanged(signalStrength: SignalStrength) {
                super.onSignalStrengthsChanged(signalStrength)
                val asu = signalStrength.gsmSignalStrength
                val dBm = 2 * asu - 113 // ASUをdBmに変換

                val signalLevel = when {
                    dBm >= -70 -> "良好" // 強信号
                    dBm >= -85 -> "注意" // 中信号
                    else -> "不良" // 弱信号
                }

                promise.resolve(signalLevel)
            }
        }, PhoneStateListener.LISTEN_SIGNAL_STRENGTHS)
    }
}