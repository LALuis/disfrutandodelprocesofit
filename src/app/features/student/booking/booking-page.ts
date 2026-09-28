import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { AuthService } from '@core/auth/auth.service';
import { messageFromError } from '@core/firebase/firebase-error';
import { BookingsService } from '@core/services/bookings.service';
import { ScheduleService } from '@core/services/schedule.service';
import { Badge } from '@shared/components/badge/badge';
import { BookingList } from '@shared/components/booking-list/booking-list';
import { Button } from '@shared/components/button/button';
import { EmptyState } from '@shared/components/empty-state/empty-state';
import { ErrorState } from '@shared/components/error-state/error-state';
import { Icon } from '@shared/components/icon/icon';
import { LoadingState } from '@shared/components/loading-state/loading-state';
import { PageHeader } from '@shared/components/page-header/page-header';
import {
  Booking,
  isSlotFull,
  isSlotPast,
  remainingCapacity,
  ScheduleSlot,
} from '@shared/models/schedule';
import { ConfirmDialogService } from '@shared/services/confirm-dialog.service';
import { ToastService } from '@shared/services/toast.service';
import {
  addDays,
  formatDateLong,
  parseIsoDate,
  todayIso,
  WEEKDAY_LABELS,
} from '@shared/utilities/dates';

const DAYS_AHEAD = 14;

interface DayOption {
  readonly iso: string;
  readonly weekday: string;
  readonly day: number;
}

/** Student agenda: pick a day, book or cancel a slot, review upcoming and past bookings. */
@Component({
  selector: 'app-booking-page',
  imports: [PageHeader, Badge, Button, Icon, BookingList, LoadingState, ErrorState, EmptyState],
  templateUrl: './booking-page.html',
  styleUrl: './booking-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingPage {
  private readonly authService = inject(AuthService);
  private readonly scheduleService = inject(ScheduleService);
  private readonly bookingsService = inject(BookingsService);
  private readonly confirm = inject(ConfirmDialogService);
  private readonly toast = inject(ToastService);

  private readonly uid = computed(() => this.authService.user()?.uid);

  protected readonly today = todayIso();
  protected readonly days: readonly DayOption[] = Array.from({ length: DAYS_AHEAD }, (_, i) => {
    const iso = addDays(this.today, i);
    const date = parseIsoDate(iso);
    return { iso, weekday: WEEKDAY_LABELS[date.getDay()], day: date.getDate() };
  });

  protected readonly selectedDate = signal(this.today);
  protected readonly busySlotId = signal<string | null>(null);
  protected readonly showPast = signal(false);

  protected readonly slots = rxResource({
    params: () => this.selectedDate(),
    stream: ({ params }) => this.scheduleService.slotsForDate$(params),
  });

  protected readonly bookings = rxResource({
    params: () => this.uid(),
    stream: ({ params }) => this.bookingsService.myBookings$(params),
  });

  protected readonly confirmedSlotIds = computed(
    () =>
      new Set(
        (this.bookings.hasValue() ? this.bookings.value() : [])
          .filter((b) => b.status === 'confirmed')
          .map((b) => b.slotId),
      ),
  );

  protected readonly visibleSlots = computed(() =>
    (this.slots.hasValue() ? this.slots.value() : []).filter((s) => s.enabled && !isSlotPast(s)),
  );

  protected readonly upcoming = computed(() =>
    (this.bookings.hasValue() ? this.bookings.value() : [])
      .filter((b) => b.status === 'confirmed' && b.startsAt > Date.now())
      .sort((a, b) => a.startsAt - b.startsAt),
  );

  protected readonly past = computed(() =>
    (this.bookings.hasValue() ? this.bookings.value() : []).filter(
      (b) => b.status === 'cancelled' || b.startsAt <= Date.now(),
    ),
  );

  protected readonly remaining = remainingCapacity;
  protected readonly isFull = isSlotFull;
  protected readonly formatDate = formatDateLong;

  protected isBooked(slot: ScheduleSlot): boolean {
    return this.confirmedSlotIds().has(slot.id);
  }

  protected async book(slot: ScheduleSlot): Promise<void> {
    this.busySlotId.set(slot.id);
    try {
      await this.bookingsService.book(slot.id);
      this.toast.success(
        `Reserva confirmada para el ${formatDateLong(slot.date)} a las ${slot.startTime}.`,
      );
    } catch (error) {
      this.toast.error(messageFromError(error));
    } finally {
      this.busySlotId.set(null);
    }
  }

  protected async cancel(booking: Pick<Booking, 'slotId' | 'date' | 'startTime'>): Promise<void> {
    const ok = await this.confirm.ask({
      title: 'Cancelar reserva',
      message: `¿Querés cancelar tu turno del ${formatDateLong(booking.date)} a las ${booking.startTime}?`,
      confirmLabel: 'Cancelar reserva',
      cancelLabel: 'Volver',
      danger: true,
    });
    if (!ok) {
      return;
    }
    this.busySlotId.set(booking.slotId);
    try {
      await this.bookingsService.cancel(booking.slotId);
      this.toast.success('Reserva cancelada.');
    } catch (error) {
      this.toast.error(messageFromError(error));
    } finally {
      this.busySlotId.set(null);
    }
  }
}
