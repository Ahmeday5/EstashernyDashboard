import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlldoctorComponent } from './alldoctor.component';

describe('OrdersComponent', () => {
  let component: AlldoctorComponent;
  let fixture: ComponentFixture<AlldoctorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlldoctorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AlldoctorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
