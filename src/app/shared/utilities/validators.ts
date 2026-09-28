import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { isIsoDate, isTime } from './dates';

/** Accepts empty or `YYYY-MM-DD`. Pair with `Validators.required` when the date is mandatory. */
export const isoDateValidator: ValidatorFn = (control: AbstractControl<string>) =>
  control.value === '' || isIsoDate(control.value) ? null : { isoDate: true };

/** Accepts empty or `HH:mm`. */
export const timeValidator: ValidatorFn = (control: AbstractControl<string>) =>
  control.value === '' || isTime(control.value) ? null : { time: true };

/** Standard Spanish messages for the validators used across the app. */
export function validationMessage(errors: ValidationErrors | null): string {
  if (!errors) {
    return '';
  }
  if (errors['required']) {
    return 'Este campo es obligatorio.';
  }
  if (errors['email']) {
    return 'El email no es válido.';
  }
  if (errors['isoDate']) {
    return 'Usá el formato AAAA-MM-DD.';
  }
  if (errors['time']) {
    return 'Usá el formato HH:MM.';
  }
  if (errors['min'] !== undefined) {
    return `El valor mínimo es ${errors['min'].min}.`;
  }
  if (errors['max'] !== undefined) {
    return `El valor máximo es ${errors['max'].max}.`;
  }
  if (errors['minlength']) {
    return `Mínimo ${errors['minlength'].requiredLength} caracteres.`;
  }
  if (errors['maxlength']) {
    return `Máximo ${errors['maxlength'].requiredLength} caracteres.`;
  }
  if (errors['dateOrder']) {
    return 'La fecha de fin debe ser posterior a la de inicio.';
  }
  return 'El valor no es válido.';
}

/** Error text for a control, only once the user interacted with it. */
export function controlError(control: AbstractControl): string {
  return control.touched && control.invalid ? validationMessage(control.errors) : '';
}
