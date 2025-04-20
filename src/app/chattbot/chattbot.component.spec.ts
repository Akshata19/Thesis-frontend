import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChattbotComponent } from './chattbot.component';

describe('ChattbotComponent', () => {
  let component: ChattbotComponent;
  let fixture: ComponentFixture<ChattbotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChattbotComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChattbotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
