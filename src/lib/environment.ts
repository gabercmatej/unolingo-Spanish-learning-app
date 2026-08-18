import { Platform } from 'react-native';
import Constants from 'expo-constants';

import { STATE_VERSION } from '@/learning/schema';
import type { Environment } from '@/learning/diagnostics';

/**
 * What build this is, gathered in the one file allowed to ask the platform.
 *
 * `expo-constants` alone, on purpose: the exact native build number would want
 * `expo-application`, and a whole dependency to print one integer in a
 * diagnostics report is a poor trade — especially with no native project checked
 * in for it to read. The declared version and the runtime version identify a
 * build well enough to reproduce a complaint against it.
 *
 * The report that consumes this lives in `learning/diagnostics.ts` and is pure,
 * so the interesting half — what the numbers mean — stays testable while this
 * half stays a lookup.
 */
const config = Constants.expoConfig;

export const environment: Environment = {
  appVersion: config?.version ?? '1.0.0',
  buildVersion:
    Platform.OS === 'ios'
      ? (config?.ios?.buildNumber ?? 'dev')
      : Platform.OS === 'android'
        ? String(config?.android?.versionCode ?? 'dev')
        : 'web',
  platform: Platform.OS,
  osVersion: String(Platform.Version ?? ''),
  stateVersion: STATE_VERSION,
  updateId: Constants.expoConfig?.runtimeVersion
    ? String(Constants.expoConfig.runtimeVersion)
    : undefined,
};
