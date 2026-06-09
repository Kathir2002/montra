package com.nativeModule.hardExitModule

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModule
import com.montra.nativeModule.NativeHardExitSpec
import android.app.Activity

@ReactModule(name = NativeHardExitModule.NAME)
class NativeHardExitModule(reactContext: ReactApplicationContext) : NativeHardExitSpec(reactContext) {

    override fun getName(): String {
        return NAME
    }

    override fun hardExit() {
        val activity = currentActivity
        activity?.finishAffinity() // Finishes this activity and all parent activities
        
        // Optional: Add a slight delay before process exit for smoother transition
        android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({
            android.os.Process.killProcess(android.os.Process.myPid())
        }, 100)
    }

    companion object {
        const val NAME = "NativeHardExit"
    }
}