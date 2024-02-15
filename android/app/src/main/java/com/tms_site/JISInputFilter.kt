package com.tms_site

import android.text.InputFilter
import android.text.Spanned
import java.nio.charset.Charset

class JISInputFilter : InputFilter {
    override fun filter(
        source: CharSequence, 
        start: Int, 
        end: Int, 
        dest: Spanned, 
        dstart: Int, 
        dend: Int
    ): CharSequence {
        val encoder = Charset.forName("Shift_JIS").newEncoder()

        for (i in start until end) {
            val c = source[i]
            if (!encoder.canEncode(c)) {
                return "" // この文字は許可しない
            }
        }
        return source // この部分の文字列は許可する
    }
}
