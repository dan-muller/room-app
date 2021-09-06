const permutations = <T = any>(array: T[]): T[][] => {
  return array.length === 1
    ? [array]
    : array.flatMap((element, index, array) =>
        permutations(array.filter((_, i) => i !== index)).map((c) => [
          element,
          ...c,
        ])
      )
}

export default permutations
