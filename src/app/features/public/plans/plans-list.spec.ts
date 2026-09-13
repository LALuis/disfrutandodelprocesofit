import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject } from 'rxjs';
import { GymSettingsService } from '@core/services/gym-settings.service';
import { MembershipPlansService } from '@core/services/membership-plans.service';
import { DEFAULT_GYM_SETTINGS } from '@shared/models/gym-settings';
import { MembershipPlan } from '@shared/models/membership-plan';
import { PlansList } from './plans-list';

const PLAN: MembershipPlan = {
  id: 'p1',
  name: 'Plan',
  description: '',
  price: 1000,
  currency: 'UYU',
  frequency: 'monthly',
  features: [],
  highlighted: false,
  active: true,
  displayOrder: 1,
};

describe('PlansList', () => {
  let fixture: ComponentFixture<PlansList>;
  let activePlans$: Subject<MembershipPlan[]>;

  function text(): string {
    return (fixture.nativeElement as HTMLElement).textContent ?? '';
  }

  beforeEach(async () => {
    activePlans$ = new Subject<MembershipPlan[]>();
    await TestBed.configureTestingModule({
      imports: [PlansList],
      providers: [
        provideRouter([]),
        { provide: MembershipPlansService, useValue: { activePlans$ } },
        { provide: GymSettingsService, useValue: { settings: signal(DEFAULT_GYM_SETTINGS) } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(PlansList);
    // whenStable() would wait for the pending resource; detectChanges renders the loading state.
    fixture.detectChanges();
  });

  it('shows the loading state until plans arrive', () => {
    expect(text()).toContain('Cargando planes');
  });

  it('renders a card per plan once loaded', async () => {
    activePlans$.next([PLAN, { ...PLAN, id: 'p2' }]);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('app-plan-card').length).toBe(2);
  });

  it('shows the empty state when there are no active plans', async () => {
    activePlans$.next([]);
    await fixture.whenStable();
    expect(text()).toContain('Todavía no hay planes publicados');
  });

  it('shows the error state when the stream fails', async () => {
    activePlans$.error(new Error('permission-denied'));
    await fixture.whenStable();
    expect(text()).toContain('No pudimos cargar los planes');
    expect(fixture.nativeElement.querySelector('app-error-state button')).not.toBeNull();
  });
});
