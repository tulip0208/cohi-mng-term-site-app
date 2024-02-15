package com.tms_site

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class SignalStrengthPackage : ReactPackage {

    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        return listOf(SignalStrengthModule(reactContext))
    }

    // override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*>> {
    //     return emptyList()
    // }

    override fun createViewManagers(
        reactContext: ReactApplicationContext
    ): List<ViewManager<*, *>> { // <- 修正された型引数
        return emptyList()
    }
        
}
