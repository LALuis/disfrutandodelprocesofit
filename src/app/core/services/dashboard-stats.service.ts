import { inject, Injectable } from '@angular/core';
import { combineLatest, map, Observable } from 'rxjs';
import { isSlotFull } from '@shared/models/schedule';
import { addDays, todayIso } from '@shared/utilities/dates';
import { ScheduleService } from './schedule.service';
import { UsersService } from './users.service';

export interface AdminStats {
  readonly activeStudents: number;
  readonly todayBookings: number;
  readonly upcomingBookings: number;
  readonly availableSlots: number;
  readonly fullSlots: number;
  readonly nutritionEnabled: number;
  readonly recipesEnabled: number;
}

const UPCOMING_DAYS = 7;

/** Aggregates for the admin dashboard, derived from realtime streams the admin can read. */
@Injectable({ providedIn: 'root' })
export class DashboardStatsService {
  private readonly usersService = inject(UsersService);
  private readonly scheduleService = inject(ScheduleService);

  stats$(): Observable<AdminStats> {
    const today = todayIso();
    const now = Date.now();
    return combineLatest([
      this.usersService.students$,
      this.scheduleService.slotsBetween$(today, addDays(today, UPCOMING_DAYS)),
    ]).pipe(
      map(([students, slots]) => {
        const upcoming = slots.filter((s) => s.startsAt > now);
        return {
          activeStudents: students.filter((s) => s.active).length,
          todayBookings: slots
            .filter((s) => s.date === today)
            .reduce((sum, s) => sum + s.bookedCount, 0),
          upcomingBookings: upcoming.reduce((sum, s) => sum + s.bookedCount, 0),
          availableSlots: upcoming.filter((s) => s.enabled && !isSlotFull(s)).length,
          fullSlots: upcoming.filter((s) => s.enabled && isSlotFull(s)).length,
          nutritionEnabled: students.filter((s) => s.active && s.features.nutritionEnabled).length,
          recipesEnabled: students.filter((s) => s.active && s.features.recipesEnabled).length,
        };
      }),
    );
  }
}
