import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PresenterComponent } from './presenter.component';

describe('PresenterComponent', () => {
  let component: PresenterComponent;
  let fixture: ComponentFixture<PresenterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PresenterComponent]
    });
    fixture = TestBed.createComponent(PresenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
