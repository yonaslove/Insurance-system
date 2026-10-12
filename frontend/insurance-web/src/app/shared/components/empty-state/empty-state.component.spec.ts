import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmptyStateComponent } from './empty-state.component';

describe('EmptyStateComponent', () => {
  let component: EmptyStateComponent;
  let fixture: ComponentFixture<EmptyStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyStateComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(EmptyStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create empty state component', () => {
    expect(component).toBeTruthy();
  });

  it('should display customized title and message', () => {
    component.title = 'No Claims Found';
    component.message = 'No active claims match your query.';
    fixture.detectChanges();

    const titleEl = fixture.nativeElement.querySelector('.empty-title');
    const msgEl = fixture.nativeElement.querySelector('.empty-description');

    expect(titleEl.textContent).toContain('No Claims Found');
    expect(msgEl.textContent).toContain('No active claims match your query.');
  });
});
