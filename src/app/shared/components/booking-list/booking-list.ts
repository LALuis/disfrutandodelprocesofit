import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Booking } from '@shared/models/schedule';
import { formatDateLong } from '@shared/utilities/dates';
import { Badge } from '../badge/badge';
import { Button } from '../button/button';
import { Icon } from '../icon/icon';

/** Compact list of bookings. Cancel is offered for confirmed, upcoming ones when enabled. */
@Component({
  selector: 'app-booking-list',
  imports: [Badge, Button, Icon],
  template: `
    <ul class="bookings">
      @for (booking of bookings(); track booking.slotId) {
        <li class="booking" [class.booking--cancelled]="booking.status === 'cancelled'">
          <span class="booking__icon"><app-icon name="calendar" [size]="18" /></span>
          <span class="booking__main">
            <span class="booking__date">{{ formatDate(booking.date) }}</span>
            <span class="booking__time">{{ booking.startTime }} hs</span>
          </span>
          @if (booking.status === 'cancelled') {
            <app-badge tone="neutral">Cancelada</app-badge>
          } @else if (booking.startsAt <= now) {
            <app-badge tone="success">Realizada</app-badge>
          } @else {
            <app-badge tone="accent">Confirmada</app-badge>
          }
          @if (canCancel() && booking.status === 'confirmed' && booking.startsAt > now) {
            <button
              app-button
              variant="ghost"
              size="sm"
              type="button"
              [disabled]="busySlotId() === booking.slotId"
              [loading]="busySlotId() === booking.slotId"
              (click)="cancelBooking.emit(booking)"
            >
              Cancelar
            </button>
          }
        </li>
      }
    </ul>
  `,
  styles: `
    .bookings {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .booking {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
    }

    .booking--cancelled {
      opacity: 0.6;
    }

    .booking__icon {
      display: grid;
      place-items: center;
      width: 36px;
      height: 36px;
      border-radius: var(--radius-md);
      background: var(--color-accent-soft);
      color: var(--color-accent);
      flex-shrink: 0;
    }

    .booking__main {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 0;
    }

    .booking__date {
      font-weight: var(--weight-medium);
    }

    .booking__date::first-letter {
      text-transform: uppercase;
    }

    .booking__time {
      font-size: var(--text-sm);
      color: var(--color-text-muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingList {
  readonly bookings = input.required<readonly Booking[]>();
  readonly canCancel = input(false);
  readonly busySlotId = input<string | null>(null);
  readonly cancelBooking = output<Booking>();

  protected readonly now = Date.now();
  protected readonly formatDate = formatDateLong;
}
