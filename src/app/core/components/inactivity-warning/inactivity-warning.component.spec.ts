import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InactivityWarningComponent } from './inactivity-warning.component';

describe('InactivityWarningComponent', () => {
  let component: InactivityWarningComponent;
  let fixture: ComponentFixture<InactivityWarningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InactivityWarningComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InactivityWarningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
