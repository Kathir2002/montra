// RNRestartModule.ts

import {NativeModules} from 'react-native';

interface RNRestartInterface {
  restart(reason: string): void;
}

export const RNRestart = NativeModules.RNRestart as RNRestartInterface;
