import { setGlobalOptions } from 'firebase-functions/v2';

// Region must match `functionsRegion` in the Angular environment files.
setGlobalOptions({ region: 'us-central1', maxInstances: 10 });

// Functions are organised by domain; each domain folder exports its callables here.
export { createStudent } from './auth/create-student';
export { setUserActive } from './auth/set-user-active';
export { setUserRole } from './auth/set-user-role';
export { createBooking } from './booking/create-booking';
export { cancelBooking } from './booking/cancel-booking';
export { ping } from './system/ping';
