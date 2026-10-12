import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlertComponent } from './alert.component';

describe('AlertComponent', () => {
  let component: AlertComponent;
  let fixture: ComponentFixture<AlertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create alert component', () => {
    expect(component).toBeTruthy();
  });

  it('should emit closed event on dismiss click', () => {
    component.dismissible = true;
    fixture.detectChanges();

    spyOn(component.closed, 'emit');
    const closeBtn = fixture.nativeElement.querySelector('.alert-close');
    closeBtn.click();
    expect(component.closed.emit).toHaveBeenCalled();
  });
});
