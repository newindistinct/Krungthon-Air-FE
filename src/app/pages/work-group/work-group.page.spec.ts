import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkGroupPage } from './work-group.page';

describe('WorkGroupPage', () => {
  let component: WorkGroupPage;
  let fixture: ComponentFixture<WorkGroupPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(WorkGroupPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
