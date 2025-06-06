import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Feedback5Component } from './feedback5.component';

describe('Feedback5Component', () => {
  let component: Feedback5Component;
  let fixture: ComponentFixture<Feedback5Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Feedback5Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Feedback5Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
