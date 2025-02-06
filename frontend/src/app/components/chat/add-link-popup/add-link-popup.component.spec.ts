import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddLinkPopupComponent } from './add-link-popup.component';

describe('AddLinkPopupComponent', () => {
  let component: AddLinkPopupComponent;
  let fixture: ComponentFixture<AddLinkPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddLinkPopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddLinkPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
