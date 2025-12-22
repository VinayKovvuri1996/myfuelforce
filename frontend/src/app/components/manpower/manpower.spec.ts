import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Manpower } from './manpower';

describe('Manpower', () => {
  let component: Manpower;
  let fixture: ComponentFixture<Manpower>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Manpower]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Manpower);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
