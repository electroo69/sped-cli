function levenshtein(a, b) {
  const left = String(a);
  const right = String(b);
  const matrix = Array.from({ length: left.length + 1 }, () => new Array(right.length + 1).fill(0));

  for (let i = 0; i <= left.length; i += 1) {
    matrix[i][0] = i;
  }

  for (let j = 0; j <= right.length; j += 1) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= left.length; i += 1) {
    for (let j = 1; j <= right.length; j += 1) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[left.length][right.length];
}

function suggestAlias(input, aliases) {
  let best = null;

  for (const alias of aliases) {
    const distance = levenshtein(input, alias);
    if (!best || distance < best.distance) {
      best = { alias, distance };
    }
  }

  if (!best) {
    return null;
  }

  const threshold = Math.max(2, Math.ceil(String(input).length / 2));
  return best.distance <= threshold ? best.alias : null;
}

module.exports = {
  levenshtein,
  suggestAlias
};
