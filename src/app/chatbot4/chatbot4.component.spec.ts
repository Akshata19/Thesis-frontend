import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Chatbot4Component } from './chatbot4.component';

describe('Chatbot4Component', () => {
  let component: Chatbot4Component;
  let fixture: ComponentFixture<Chatbot4Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Chatbot4Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Chatbot4Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
