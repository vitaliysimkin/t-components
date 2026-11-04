import type { Extension } from '@codemirror/state'

export type CodeLanguage = 'json' | 'markdown' | 'xml' | 'text'

export async function loadLanguage(lang: CodeLanguage | undefined): Promise<Extension> {
  switch (lang) {
    case 'json': return (await import('@codemirror/lang-json')).json()
    case 'markdown': return (await import('@codemirror/lang-markdown')).markdown()
    case 'xml': return (await import('@codemirror/lang-xml')).xml()
    default: return []
  }
}
