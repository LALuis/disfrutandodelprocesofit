import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
  withRouterConfig,
} from '@angular/router';
import { environment } from '@env/environment';
import { provideFirebase } from '@core/firebase/firebase.providers';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }),
      // Child routes (e.g. student tabs) receive the parent's :id as an input.
      withRouterConfig({ paramsInheritanceStrategy: 'always' }),
    ),
    provideFirebase(environment),
  ],
};
