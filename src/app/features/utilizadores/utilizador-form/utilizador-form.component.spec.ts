import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UtilizadorFormComponent } from './utilizador-form.component';

describe('UtilizadorFormComponent', () => {
  let component: UtilizadorFormComponent;
  let fixture: ComponentFixture<UtilizadorFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UtilizadorFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UtilizadorFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
