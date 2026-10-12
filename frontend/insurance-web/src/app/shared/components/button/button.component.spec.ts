import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create button component', () => {
    expect(component).toBeTruthy();
  });

  it('should emit click event when enabled', () => {
    spyOn(component.btnClick, 'emit');
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    expect(component.btnClick.emit).toHaveBeenCalled();
  });

  it('should not emit click event when disabled', () => {
    component.disabled = true;
    fixture.detectChanges();
    spyOn(component.btnClick, 'emit');
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    expect(component.btnClick.emit).not.toHaveBeenCalled();
  });
});
