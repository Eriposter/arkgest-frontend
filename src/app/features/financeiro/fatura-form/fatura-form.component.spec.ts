import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaturaFormComponent } from './fatura-form.component';

describe('FaturaFormComponent', () => {
  let component: FaturaFormComponent;
  let fixture: ComponentFixture<FaturaFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaturaFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FaturaFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
