import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Feedback4Component } from './feedback4.component';

describe('Feedback4Component', () => {
  let component: Feedback4Component;
  let fixture: ComponentFixture<Feedback4Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Feedback4Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Feedback4Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
