/**
 * Copy text to the clipboard. Uses `navigator.clipboard.writeText` and falls
 * back to a hidden `<textarea>` + `execCommand('copy')`.
 * Resolves `true` on success, `false` otherwise.
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch { /* fallback below */ }
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    ta.remove()
    return ok
  } catch {
    return false
  }
}
