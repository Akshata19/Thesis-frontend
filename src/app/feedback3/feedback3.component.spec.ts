import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Feedback3Component } from './feedback3.component';

describe('Feedback3Component', () => {
  let component: Feedback3Component;
  let fixture: ComponentFixture<Feedback3Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Feedback3Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Feedback3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
