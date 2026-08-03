import { InjectionToken } from '@angular/core';

/**
 * API configuration shared across remotes.
 * Shell (and standalone remote serves) provide the value; never hard-code URLs in features.
 */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');
