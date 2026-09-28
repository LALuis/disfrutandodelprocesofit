import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { BookingsService } from '@core/services/bookings.service';
import { BookingList } from '@shared/components/booking-list/booking-list';
import { EmptyState } from '@shared/components/empty-state/empty-state';
import { ErrorState } from '@shared/components/error-state/error-state';
import { LoadingState } from '@shared/components/loading-state/loading-state';

@Component({
  selector: 'app-student-bookings-tab',
  imports: [BookingList, LoadingState, ErrorState, EmptyState],
  template: `
    @if (bookings.isLoading()) {
      <app-loading-state message="Cargando reservas…" />
    } @else if (bookings.error()) {
      <app-error-state title="No pudimos cargar las reservas" (retry)="bookings.reload()" />
    } @else if (bookings.hasValue() && bookings.value().length) {
      <app-booking-list [bookings]="bookings.value()" />
    } @else {
      <app-empty-state
        icon="calendar"
        title="Sin reservas"
        description="Este alumno todavía no reservó ningún turno."
      />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentBookingsTab {
  private readonly bookingsService = inject(BookingsService);

  readonly id = input.required<string>();

  protected readonly bookings = rxResource({
    params: () => this.id(),
    stream: ({ params }) => this.bookingsService.myBookings$(params),
  });
}
