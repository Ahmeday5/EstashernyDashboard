import { ComponentFixture, TestBed } from '@angular/core/testing';

import { addDoctorComponent } from './AddDoctor.component';

describe('AddDoctor', () => {
  let component: addDoctorComponent;
  let fixture: ComponentFixture<addDoctorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [addDoctorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(addDoctorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
