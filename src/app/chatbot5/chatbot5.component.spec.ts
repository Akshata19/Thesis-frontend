import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Chatbot5Component } from './chatbot5.component';

describe('Chatbot5Component', () => {
  let component: Chatbot5Component;
  let fixture: ComponentFixture<Chatbot5Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Chatbot5Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Chatbot5Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
