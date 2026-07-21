export function generateSecureRandomNumber(min: number, max: number): number {
  const range = max - min + 1
  const bytes = new Uint32Array(1)
  crypto.getRandomValues(bytes)
  return min + (bytes[0] % range)
}

export function generateMultipleWinners(
  min: number,
  max: number,
  quantity: number,
  exclude: number[] = []
): number[] {
  const available: number[] = []
  for (let i = min; i <= max; i++) {
    if (!exclude.includes(i)) {
      available.push(i)
    }
  }

  if (available.length < quantity) {
    throw new Error("Números insuficientes disponíveis para o sorteio")
  }

  const results: number[] = []
  const pool = [...available]

  for (let i = 0; i < quantity; i++) {
    const index = generateSecureRandomNumber(0, pool.length - 1)
    results.push(pool[index])
    pool.splice(index, 1)
  }

  return results
}

export function validateNumberBelongsToRaffle(
  number: number,
  min: number,
  max: number,
  participants: { number: number }[]
): boolean {
  if (number < min || number > max) return false
  return participants.some((p) => p.number === number)
}

export function formatDrawDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeStyle: "medium",
  }).format(date)
}
