import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LicenseExpiredComponent } from './license-expired.component';

describe('LicenseExpiredComponent', () => {
  let component: LicenseExpiredComponent;
  let fixture: ComponentFixture<LicenseExpiredComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LicenseExpiredComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LicenseExpiredComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
