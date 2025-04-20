import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Chatbot3Component } from './chatbot3.component';

describe('Chatbot3Component', () => {
  let component: Chatbot3Component;
  let fixture: ComponentFixture<Chatbot3Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Chatbot3Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Chatbot3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
