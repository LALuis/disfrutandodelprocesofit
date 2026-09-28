import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { combineLatest, map, of, switchMap } from 'rxjs';
import { BookingsService } from '@core/services/bookings.service';
import { ScheduleService } from '@core/services/schedule.service';
import { Badge } from '@shared/components/badge/badge';
import { DateNav } from '@shared/components/date-nav/date-nav';
import { EmptyState } from '@shared/components/empty-state/empty-state';
import { ErrorState } from '@shared/components/error-state/error-state';
import { LoadingState } from '@shared/components/loading-state/loading-state';
import { PageHeader } from '@shared/components/page-header/page-header';
import { UserAvatar } from '@shared/components/user-avatar/user-avatar';
import { Booking, remainingCapacity, ScheduleSlot } from '@shared/models/schedule';
import { todayIso } from '@shared/utilities/dates';

interface SlotWithBookings {
  readonly slot: ScheduleSlot;
  readonly bookings: readonly Booking[];
}

/** Admin bookings: who is booked in each slot of the selected day. */
@Component({
  selector: 'app-bookings-page',
  imports: [
    RouterLink,
    PageHeader,
    DateNav,
    Badge,
    UserAvatar,
    LoadingState,
    ErrorState,
    EmptyState,
  ],
  templateUrl: './bookings-page.html',
  styleUrl: './bookings-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingsPage {
  private readonly scheduleService = inject(ScheduleService);
  private readonly bookingsService = inject(BookingsService);

  protected readonly date = signal(todayIso());
  protected readonly remaining = remainingCapacity;

  protected readonly day = rxResource({
    params: () => this.date(),
    stream: ({ params }) =>
      this.scheduleService
        .slotsForDate$(params)
        .pipe(
          switchMap((slots) =>
            slots.length === 0
              ? of([] as SlotWithBookings[])
              : combineLatest(
                  slots.map((slot) =>
                    this.bookingsService
                      .slotBookings$(slot.id)
                      .pipe(map((bookings): SlotWithBookings => ({ slot, bookings }))),
                  ),
                ),
          ),
        ),
  });

  protected totalBookings(entries: readonly SlotWithBookings[]): number {
    return entries.reduce((sum, e) => sum + e.bookings.length, 0);
  }

  protected nameParts(name: string): { first: string; last: string } {
    const [first = '', ...rest] = name.split(' ');
    return { first, last: rest.join(' ') };
  }
}
