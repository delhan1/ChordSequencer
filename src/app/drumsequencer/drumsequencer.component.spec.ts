import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DrumsequencerComponent } from './drumsequencer.component';

describe('DrumsequencerComponent', () => {
  let component: DrumsequencerComponent;
  let fixture: ComponentFixture<DrumsequencerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DrumsequencerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DrumsequencerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
