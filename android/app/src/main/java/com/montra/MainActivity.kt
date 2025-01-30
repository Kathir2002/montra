package com.montra

import android.content.Intent
import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.facebook.react.bridge.Arguments
import com.facebook.react.modules.core.DeviceEventManagerModule
import org.devio.rn.splashscreen.SplashScreen; 

class MainActivity : ReactActivity() {
    companion object {
        private var navigationIntent: Intent? = null
        
        fun getNavigationIntent(): Intent? {
            val temp = navigationIntent
            navigationIntent = null
            return temp
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        SplashScreen.show(this,R.style.SplashTheme,true)
        super.onCreate(savedInstanceState)
        handleShortcutIntent(intent)
    }

    override fun onNewIntent(intent: Intent?) {
        super.onNewIntent(intent)
        handleShortcutIntent(intent)
    }

    private fun handleShortcutIntent(intent: Intent?) {
        intent?.let { safeIntent ->
            if (safeIntent.hasExtra("shortcut_action")) {
                val action = safeIntent.getStringExtra("shortcut_action")
                
                // If React context is ready, emit event directly
                reactInstanceManager?.currentReactContext?.let { reactContext ->
                    val params = Arguments.createMap().apply {
                        putString("route", action)
                    }
                    reactContext
                        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                        .emit("handleShortcut", params)
                } ?: run {
                    // If React context is not ready, store for later
                    navigationIntent = Intent().apply {
                        putExtra("initial_route", action)
                    }
                }
            }
        }
    }

    override fun getMainComponentName(): String = "montra"

    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
