package com.cms_site

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import android.text.Editable
import android.text.SpannableStringBuilder
import com.cms_site.JISInputFilter; // インポートを追加
class JISInputFilterModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "JISInputFilter"
    }

    @ReactMethod
    fun checkJISText(text: String?, promise: Promise) {
        // Elvis演算子(?:)を使用してnullのテキスト入力を安全に処理
        val nonNullText: CharSequence = text ?: ""
        val filter = JISInputFilter()
        val result: CharSequence = filter.filter(
            nonNullText,
            0,
            nonNullText.length,
            SpannableStringBuilder(), // destには空のSpannableStringBuilderを使用
            0,
            0
        )
        // toStringを使用してStringが返されるようにする、CharSequenceではなく
        promise.resolve(result.toString())
    }
}
