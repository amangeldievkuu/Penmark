type TransliterationRule = {
  latin: string
  kyrgyz: string
}

const transliterationRules: TransliterationRule[] = [
  { latin: 'shch', kyrgyz: 'щ' },
  { latin: 'yo', kyrgyz: 'ё' },
  { latin: 'jo', kyrgyz: 'ё' },
  { latin: 'yu', kyrgyz: 'ю' },
  { latin: 'ju', kyrgyz: 'ю' },
  { latin: 'ya', kyrgyz: 'я' },
  { latin: 'ja', kyrgyz: 'я' },
  { latin: 'zh', kyrgyz: 'ж' },
  { latin: 'ng', kyrgyz: 'ң' },
  { latin: 'oe', kyrgyz: 'ө' },
  { latin: 'ue', kyrgyz: 'ү' },
  { latin: 'ch', kyrgyz: 'ч' },
  { latin: 'sh', kyrgyz: 'ш' },
  { latin: 'ts', kyrgyz: 'ц' },
  { latin: 'kh', kyrgyz: 'х' },
  { latin: 'eh', kyrgyz: 'э' },
]

const singleCharacterMap: Record<string, string> = {
  a: 'а',
  b: 'б',
  c: 'с',
  d: 'д',
  e: 'е',
  f: 'ф',
  g: 'г',
  h: 'х',
  i: 'и',
  j: 'й',
  k: 'к',
  l: 'л',
  m: 'м',
  n: 'н',
  o: 'о',
  p: 'п',
  q: 'к',
  r: 'р',
  s: 'с',
  t: 'т',
  u: 'у',
  v: 'в',
  w: 'в',
  x: 'кс',
  y: 'ы',
  z: 'з',
}

function applyMatchCase(source: string, target: string) {
  if (source.toUpperCase() === source) {
    return target.toUpperCase()
  }

  if (source[0] && source[0] === source[0].toUpperCase()) {
    return target[0].toUpperCase() + target.slice(1)
  }

  return target
}

export function isLatinTransliterationInput(text: string) {
  return /^[A-Za-z]+$/.test(text)
}

export function transliterateLatinToKyrgyz(text: string) {
  let result = ''
  let index = 0

  while (index < text.length) {
    const currentCharacter = text[index]

    if (!currentCharacter || !/[A-Za-z]/.test(currentCharacter)) {
      result += currentCharacter ?? ''
      index += 1
      continue
    }

    const remaining = text.slice(index)
    const matchedRule = transliterationRules.find((rule) =>
      remaining.toLowerCase().startsWith(rule.latin),
    )

    if (matchedRule) {
      const source = text.slice(index, index + matchedRule.latin.length)
      result += applyMatchCase(source, matchedRule.kyrgyz)
      index += matchedRule.latin.length
      continue
    }

    const mappedCharacter = singleCharacterMap[currentCharacter.toLowerCase()]
    result += mappedCharacter ? applyMatchCase(currentCharacter, mappedCharacter) : currentCharacter
    index += 1
  }

  return result
}
