import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MembershipPlan } from '@shared/models/membership-plan';
import { PlanCard } from './plan-card';

const PLAN: MembershipPlan = {
  id: 'p1',
  name: '3 días',
  description: 'Equilibrio',
  price: 2500,
  currency: 'UYU',
  frequency: 'monthly',
  features: ['3 sesiones', 'Ficha'],
  highlighted: true,
  active: true,
  displayOrder: 1,
};

describe('PlanCard', () => {
  let fixture: ComponentFixture<PlanCard>;

  async function create(plan: MembershipPlan, whatsapp = ''): Promise<HTMLElement> {
    await TestBed.configureTestingModule({
      imports: [PlanCard],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(PlanCard);
    fixture.componentRef.setInput('plan', plan);
    fixture.componentRef.setInput('whatsapp', whatsapp);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('renders price, frequency, features and the highlighted badge', async () => {
    const el = await create(PLAN);
    const amount = el.querySelector('.plan-card__amount')?.textContent?.replace(/\s/g, '');
    expect(amount).toBe('$2.500');
    expect(el.querySelector('.plan-card__frequency')?.textContent).toContain('por mes');
    expect(el.querySelectorAll('.plan-card__features li').length).toBe(2);
    expect(el.querySelector('.plan-card__badge')).not.toBeNull();
    expect(el.classList.contains('plan-card--highlighted')).toBe(true);
  });

  it('links to WhatsApp with the plan name when a number is configured', async () => {
    const el = await create(PLAN, '+598 99 000 000');
    const cta = el.querySelector<HTMLAnchorElement>('.plan-card__cta a');
    expect(cta?.getAttribute('href')).toBe(
      'https://wa.me/59899000000?text=Hola!%20Quiero%20consultar%20por%20el%20plan%20%223%20d%C3%ADas%22.',
    );
    expect(cta?.getAttribute('rel')).toContain('noopener');
  });

  it('falls back to the contact page when there is no WhatsApp number', async () => {
    const el = await create({ ...PLAN, highlighted: false });
    const cta = el.querySelector<HTMLAnchorElement>('.plan-card__cta a');
    expect(cta?.getAttribute('href')).toBe('/contacto');
    expect(el.querySelector('.plan-card__badge')).toBeNull();
  });
});
