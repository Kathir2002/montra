package com.montra

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class InitialRoute : ReactContextBaseJavaModule() {
    override fun getName(): String = "InitialRoute"

    @ReactMethod
    fun getInitialRoute(promise: Promise) {
        MainActivity.getNavigationIntent()?.let { intent ->
            if (intent.hasExtra("initial_route")) {
                promise.resolve(intent.getStringExtra("initial_route"))
            } else {
                promise.resolve(null)
            }
        } ?: promise.resolve(null)
    }
}