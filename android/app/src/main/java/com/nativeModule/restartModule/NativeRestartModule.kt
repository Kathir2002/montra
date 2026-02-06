package com.nativeModule.restartModule

import android.content.Intent
import android.os.Handler
import android.os.Looper
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.montra.nativeModule.NativeRestartSpec
import kotlin.system.exitProcess

class NativeRestartModule(
    reactContext: ReactApplicationContext
) : NativeRestartSpec(reactContext) {

    private var restartReason: String? = null

    companion object {
        const val NAME = "NativeRestart"
    }

    override fun getName() = NAME

    /**
     * This is the only reliable way to restart a New Architecture app.
     * It restarts the entire application process.
     */
    @ReactMethod
    override fun restart(reason: String?) {
        restartReason = reason

        // We must run this on the main UI thread
        Handler(Looper.getMainLooper()).post {
            try {
                val context = reactApplicationContext
                val packageName = context.packageName

                // Get the launch intent for the app's main activity
                val launchIntent = context.packageManager.getLaunchIntentForPackage(packageName)
                
                if (launchIntent != null) {
                    // These flags are essential:
                    // 1. FLAG_ACTIVITY_NEW_TASK: Starts the activity in a new task.
                    // 2. FLAG_ACTIVITY_CLEAR_TASK: Clears any existing task stack.
                    launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
                    
                    // Start the new activity
                    context.startActivity(launchIntent)

                    // Immediately kill the current process
                    // This is crucial to clear all C++ static state from JSI.
                    android.os.Process.killProcess(android.os.Process.myPid())
                    exitProcess(0)
                } else {
                    // This should not happen, but handle it
                    android.util.Log.e(NAME, "Could not get launch intent to restart app")
                }
            } catch (e: Throwable) {
                android.util.Log.e(NAME, "Failed to restart app process", e)
            }
        }
    }

    @ReactMethod
    fun getReason(promise: Promise) {
        try {
            promise.resolve(restartReason)
        } catch (e: Exception) {
            promise.reject("ERR_REASON", e)
        }
    }
}