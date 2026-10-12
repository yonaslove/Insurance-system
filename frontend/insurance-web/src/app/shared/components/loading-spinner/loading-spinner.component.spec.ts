import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingSpinnerComponent } from './loading-spinner.component';

describe('LoadingSpinnerComponent', () => {
  let component: LoadingSpinnerComponent;
  let fixture: ComponentFixture<LoadingSpinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingSpinnerComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create loading spinner component', () => {
    expect(component).toBeTruthy();
  });

  it('should display message when provided', () => {
    component.message = 'Loading policy data...';
    fixture.detectChanges();

    const msgEl = fixture.nativeElement.querySelector('.spinner-message');
    expect(msgEl.textContent).toContain('Loading policy data...');
  });
});
