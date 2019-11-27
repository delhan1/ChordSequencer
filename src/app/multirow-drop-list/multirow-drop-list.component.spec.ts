import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultirowDropListComponent } from './multirow-drop-list.component';

describe('MultirowDropListComponent', () => {
  let component: MultirowDropListComponent;
  let fixture: ComponentFixture<MultirowDropListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultirowDropListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultirowDropListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
