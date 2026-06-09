// js/NativeHardExit.ts
import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
    hardExit(): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeHardExit');