import { TurboModuleRegistry, TurboModule } from 'react-native';

export interface Spec extends TurboModule {
    getInitialRoute(): string | null;  // synchronous return
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeInitialRoute');
