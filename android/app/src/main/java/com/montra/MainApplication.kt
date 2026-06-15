package com.montra

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost // Import this
import com.facebook.react.ReactPackage // Import this
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.soloader.SoLoader
import com.stallion.Stallion

class MainApplication : Application(), ReactApplication {

    // 1. Define the ReactNativeHost explicitly. 
    // This allows us to override getJSBundleFile correctly.
    override val reactNativeHost: ReactNativeHost =
        object : DefaultReactNativeHost(this) {
            override fun getPackages(): List<ReactPackage> =
                PackageList(this).packages.apply {
                    // add(NativeInitialRoutePackage())
                    // add(NativeRestartPackage())
                    // add(NativeShortcutPackage())
                    // Add your TurboReactPackage here
                    add(MontraTurboPackage())
                }

            override fun getJSMainModuleName(): String = "index"

            override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

            override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED

            // Correct placement of the Stallion override
            override fun getJSBundleFile(): String? {
                return Stallion.getJSBundleFile(applicationContext)
            }
        }

    // 2. Use the host defined above to create the ReactHost
    override val reactHost: ReactHost by lazy {
        getDefaultReactHost(
            context = applicationContext,
            reactNativeHost = reactNativeHost
        )
    }

    override fun onCreate() {
        super.onCreate()
        loadReactNative(this)
    }
}