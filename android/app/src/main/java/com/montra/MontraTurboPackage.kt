package com.montra

import com.facebook.react.TurboReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider
import com.nativeModule.shortcutModule.NativeShortcutModule
import com.nativeModule.restartModule.NativeRestartModule
import com.nativeModule.hardExitModule.NativeHardExitModule

class MontraTurboPackage : TurboReactPackage() {

    override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
        return when (name) {
            NativeShortcutModule.NAME -> NativeShortcutModule(reactContext)
            NativeRestartModule.NAME -> NativeRestartModule(reactContext)
            NativeHardExitModule.NAME -> NativeHardExitModule(reactContext)
            else -> null
        }
    }

    override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
        return ReactModuleInfoProvider {
            mapOf(
                NativeShortcutModule.NAME to ReactModuleInfo(
                    NativeShortcutModule.NAME,
                    NativeShortcutModule::class.java.name,
                    false,
                    false,
                    true,
                    true
                ),
                NativeRestartModule.NAME to ReactModuleInfo(
                    NativeRestartModule.NAME,
                    NativeRestartModule::class.java.name,
                    false,
                    false,
                    true,
                    true
                ),
                NativeHardExitModule.NAME to ReactModuleInfo(
                    NativeHardExitModule.NAME,
                    NativeHardExitModule::class.java.name,
                    false,
                    false,
                    true,
                    true
                )
            )
        }
    }
}