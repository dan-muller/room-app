import permutations from '../permutations'

describe('permutations', () => {
  it('should provide all permutations of a 2 element array', () => {
    const twoElementArray = ['a', 'b']
    const twoElementPermutations = [
      ['a', 'b'],
      ['b', 'a'],
    ]
    expect(permutations(twoElementArray)).toStrictEqual(twoElementPermutations)
  })
  it('should provide all permutations of a 3 element array', () => {
    const threeElementArray = ['a', 'b', 'c']
    const threeElementPermutations = [
      ['a', 'b', 'c'],
      ['a', 'c', 'b'],
      ['b', 'a', 'c'],
      ['b', 'c', 'a'],
      ['c', 'a', 'b'],
      ['c', 'b', 'a'],
    ]
    expect(permutations(threeElementArray)).toStrictEqual(
      threeElementPermutations
    )
  })
  it('should provide all permutations of a 4 element array', () => {
    const fourElementArray = ['a', 'b', 'c', 'd']
    const fourElementPermutations = [
      ['a', 'b', 'c', 'd'],
      ['a', 'b', 'd', 'c'],
      ['a', 'c', 'b', 'd'],
      ['a', 'c', 'd', 'b'],
      ['a', 'd', 'b', 'c'],
      ['a', 'd', 'c', 'b'],
      ['b', 'a', 'c', 'd'],
      ['b', 'a', 'd', 'c'],
      ['b', 'c', 'a', 'd'],
      ['b', 'c', 'd', 'a'],
      ['b', 'd', 'a', 'c'],
      ['b', 'd', 'c', 'a'],
      ['c', 'a', 'b', 'd'],
      ['c', 'a', 'd', 'b'],
      ['c', 'b', 'a', 'd'],
      ['c', 'b', 'd', 'a'],
      ['c', 'd', 'a', 'b'],
      ['c', 'd', 'b', 'a'],
      ['d', 'a', 'b', 'c'],
      ['d', 'a', 'c', 'b'],
      ['d', 'b', 'a', 'c'],
      ['d', 'b', 'c', 'a'],
      ['d', 'c', 'a', 'b'],
      ['d', 'c', 'b', 'a'],
    ]
    expect(permutations(fourElementArray)).toStrictEqual(
      fourElementPermutations
    )
  })
})
