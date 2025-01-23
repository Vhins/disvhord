import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlsBarComponent } from './controls-bar.component';

describe('ControlsBarComponent', () => {
  let component: ControlsBarComponent;
  let fixture: ComponentFixture<ControlsBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ControlsBarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ControlsBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
