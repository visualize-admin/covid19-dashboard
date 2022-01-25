// match opening AND closing tags
const HTML_TAG_REGEX = /(<\/?[a-z\-]+[^><]*>)/i

export function splitByHtmlTags(text: string): string[] {
  const parts = []

  let temp = text
  while (temp.length) {
    const m = HTML_TAG_REGEX.exec(temp)
    if (!m) {
      break
    }
    parts.push(
      temp.substring(0, m.index), // the part before the match
      m[1], // the match itself
    )
    // continue with the rest
    temp = temp.substring(m.index + m[1].length)
  }
  parts.push(temp)
  return parts.filter((v) => v.length)
}
