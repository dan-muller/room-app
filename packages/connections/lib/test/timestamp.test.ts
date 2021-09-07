import timestamp from '../timestamp'
import permutations from '../permutations'

describe('timestamp', () => {
  describe('compare', () => {
    describe('when used as a sort fn', () => {
      permutations([
        timestamp.from(111111),
        timestamp.from(222222),
        timestamp.from(333333),
        timestamp.from(444444),
        timestamp.from(555555),
      ]).forEach((timestamps) => {
        it(`should sort [${timestamps}]`, () =>
          expect(timestamps.sort(timestamp.compare)).toStrictEqual(timestamps))
      })
    })
  })
})
