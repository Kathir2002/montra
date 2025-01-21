package com.montra

import android.content.Intent
import android.content.pm.ShortcutInfo
import android.content.pm.ShortcutManager
import android.graphics.drawable.Icon
import android.os.Build
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class ShortcutModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule() {
    override fun getName(): String = "ShortcutModule"

    @ReactMethod
    fun createShortcuts(promise: Promise) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N_MR1) {
            try {
                reactContext.getSystemService(ShortcutManager::class.java)?.let { shortcutManager ->
                    val shortcuts = listOf(
                        createShortcutInfo(
                        id = "expense",
                        shortLabel = "Add Expense",
                        longLabel = "Add Expense",
                        iconResId = R.drawable.ic_expense,
                        action = "expense"
                    ),
                    createShortcutInfo(
                        id = "income",
                        shortLabel = "Add Income",
                        longLabel = "Add Income",
                        iconResId = R.drawable.ic_income,
                        action = "income"
                    )
                    )
                    shortcutManager.dynamicShortcuts = shortcuts
                    promise.resolve(true)
                } ?: promise.reject("ERROR", "ShortcutManager not available")
            } catch (e: Exception) {
                promise.reject("ERROR", e.message)
            }
        } else {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun removeShortcuts(promise: Promise) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N_MR1) {
            try {
                reactContext.getSystemService(ShortcutManager::class.java)?.let { shortcutManager ->
                    shortcutManager.removeAllDynamicShortcuts()
                    promise.resolve(true)
                } ?: promise.reject("ERROR", "ShortcutManager not available")
            } catch (e: Exception) {
                promise.reject("ERROR", e.message)
            }
        } else {
            promise.resolve(false)
        }
    }

    private fun createShortcutInfo(
        id: String,
        shortLabel: String,
        longLabel: String,
        iconResId: Int,
        action: String
    ): ShortcutInfo {
        val intent = Intent(reactContext, MainActivity::class.java).apply {
            setAction(Intent.ACTION_VIEW)
            putExtra("shortcut_action", action)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
        }

        return ShortcutInfo.Builder(reactContext, id)
            .setShortLabel(shortLabel)
            .setLongLabel(longLabel)
            .setIcon(Icon.createWithResource(reactContext, iconResId))
            .setIntent(intent)
            .build()
    }

    override fun initialize() {
        super.initialize()
        // Add listeners when module is initialized
    }

    @ReactMethod
    fun addListener(eventName: String) {
        // Required for React Native event emitter
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Required for React Native event emitter
    }
}