import { InjectionToken } from '@angular/core';
import type { NativeFederationResult } from '@angular-architects/native-federation';

export const FEDERATION = new InjectionToken<NativeFederationResult>('FEDERATION');
