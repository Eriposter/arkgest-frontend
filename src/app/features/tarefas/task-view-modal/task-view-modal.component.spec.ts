import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskViewModalComponent } from './task-view-modal.component';

describe('TaskViewModalComponent', () => {
  let component: TaskViewModalComponent;
  let fixture: ComponentFixture<TaskViewModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskViewModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskViewModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
