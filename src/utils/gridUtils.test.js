import { calculateOptimalGrid, getVideoGridPosition } from './gridUtils';

describe('calculateOptimalGrid', () => {
  it.each([
    [0, { rows: 1, cols: 1 }],
    [1, { rows: 1, cols: 1 }],
    [2, { rows: 1, cols: 2 }],
    [3, { rows: 2, cols: 2 }],
    [4, { rows: 2, cols: 2 }],
    [5, { rows: 3, cols: 2 }],
    [9, { rows: 3, cols: 3 }],
  ])('lays out %i videos as %o', (count, layout) => {
    expect(calculateOptimalGrid(count)).toEqual(layout);
  });
});

describe('getVideoGridPosition', () => {
  it('places videos in full rows left to right', () => {
    expect(getVideoGridPosition(0, 4, 2)).toEqual({ gridColumn: 1, gridRow: 1 });
    expect(getVideoGridPosition(3, 4, 2)).toEqual({ gridColumn: 2, gridRow: 2 });
  });

  it('centers a partial last row', () => {
    expect(getVideoGridPosition(3, 4, 3)).toEqual({ gridColumn: 2, gridRow: 2 });
  });
});
