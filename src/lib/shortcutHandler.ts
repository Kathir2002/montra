import {
    Platform,
    NativeEventEmitter,
    type EventSubscription,
    type NativeModule,
    NativeModules
} from 'react-native';
import { type ShortcutParamsType, type ShortcutResponseType } from './../../specs/NativeShortcut';

const RNShortcuts = require("../../specs/NativeShortcut").default

const emitterModule = Platform.select({
    ios: RNShortcuts,
    android: null
}) as unknown as NativeModule | undefined

const shortcutsEventEmitter = new NativeEventEmitter(emitterModule);

async function addShortcut(
    params: ShortcutParamsType
): Promise<ShortcutResponseType> {
    if (!params.id || !params.title) {
        return Promise.reject('Invalid request parameters');
    }

    return RNShortcuts.addShortcut(params);
}

async function updateShortcut(
    params: ShortcutParamsType
): Promise<ShortcutResponseType> {
    if (!params.id || !params.title) {
        return Promise.reject('Invalid request parameters');
    }

    return RNShortcuts.updateShortcut(params);
}

async function removeShortcut(id: string): Promise<boolean> {
    if (!id) {
        return Promise.reject('Invalid id');
    }
    return RNShortcuts.removeShortcut(id);
}

async function removeAllShortcuts(): Promise<boolean> {
    return RNShortcuts.removeAllShortcuts();
}

async function getShortcutById(id: string): Promise<ShortcutResponseType> {
    if (!id) {
        return Promise.reject('Invalid id');
    }
    return RNShortcuts.getShortcutById(id);
}

async function isShortcutExists(id: string): Promise<boolean> {
    if (!id) {
        return Promise.reject('Invalid id');
    }
    return RNShortcuts.isShortcutExists(id);
}

async function isShortcutSupported(): Promise<boolean> {
    return RNShortcuts.isShortcutSupported();
}

async function getInitialShortcutId(): Promise<string> {
    return RNShortcuts.getInitialShortcutId();
}

function addOnShortcutUsedListener(
    callback: (id: string) => void
): EventSubscription {
    return shortcutsEventEmitter.addListener('onShortcutUsed', callback);
}

export {
    addShortcut,
    removeShortcut,
    removeAllShortcuts,
    getShortcutById,
    isShortcutExists,
    isShortcutSupported,
    getInitialShortcutId,
    addOnShortcutUsedListener
};