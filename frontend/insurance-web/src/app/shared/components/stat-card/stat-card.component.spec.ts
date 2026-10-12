import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatCardComponent } from './stat-card.component';

describe('StatCardComponent', () => {
  let component: StatCardComponent;
  let fixture: ComponentFixture<StatCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(StatCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create stat card component', () => {
    expect(component).toBeTruthy();
  });

  it('should render label and value accurately', () => {
    component.label = 'Active Policies';
    component.value = 142;
    fixture.detectChanges();

    const labelEl = fixture.nativeElement.querySelector('.stat-label');
    const valueEl = fixture.nativeElement.querySelector('.stat-value');

    expect(labelEl.textContent).toContain('Active Policies');
    expect(valueEl.textContent).toContain('142');
  });
});
