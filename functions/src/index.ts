import { setGlobalOptions } from 'firebase-functions/v2';

// Region must match `functionsRegion` in the Angular environment files.
setGlobalOptions({ region: 'us-central1', maxInstances: 10 });

// Functions are organised by domain; each domain folder exports its callables here.
export { ping } from './system/ping';
