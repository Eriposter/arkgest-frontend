import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LicensesListComponent } from './licenses-list.component';

describe('LicensesListComponent', () => {
  let component: LicensesListComponent;
  let fixture: ComponentFixture<LicensesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LicensesListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LicensesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
