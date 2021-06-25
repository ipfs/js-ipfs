import { TestBed } from '@angular/core/testing';

import { IpfsService } from './ipfs.service';

describe('IpfsService', () => {
  let service: IpfsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IpfsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
