/** Node of a file tree built from paths: a folder has `children`, a file does not. */
export interface TPathNode {
  /** File: the original path; folder: the path prefix */
  key: string
  label: string
  children?: TPathNode[]
}

/** Build a tree from `/`-separated paths: folders first, single-folder chains merged into one `a/b` row. */
export function buildPathTree(paths: string[]): TPathNode[] {
  const root: TPathNode[] = []
  for (const path of paths) {
    const parts = path.split('/').filter(Boolean)
    let list = root
    parts.forEach((label, i) => {
      const file = i === parts.length - 1
      const key = file ? path : parts.slice(0, i + 1).join('/')
      let node = list.find((n) => n.key === key)
      if (!node) {
        node = file ? { key, label } : { key, label, children: [] }
        list.push(node)
      }
      if (node.children) list = node.children
    })
  }
  return mergeChains(root)
}

function mergeChains(nodes: TPathNode[]): TPathNode[] {
  return nodes
    .map((n) => {
      if (!n.children) return n
      let cur = n
      let label = n.label
      while (cur.children?.length === 1 && cur.children[0]!.children) {
        cur = cur.children[0]!
        label += `/${cur.label}`
      }
      return { ...cur, label, children: mergeChains(cur.children ?? []) }
    })
    .sort((a, b) => Number(!a.children) - Number(!b.children))
}

/** Long label → [head, tail]: the head is ellipsized, the tail (extension, date, last folder) stays visible. Short → null. */
export function splitMiddle(label: string, tail = 13): [string, string] | null {
  if (label.length <= tail + 8) return null
  const slash = label.lastIndexOf('/')
  if (slash > 0 && label.length - slash - 1 <= 20) return [label.slice(0, slash + 1), label.slice(slash + 1)]
  return [label.slice(0, -tail), label.slice(-tail)]
}

/** Nodes from the root down to the node with `key` (inclusive), or null. */
export function findPath(nodes: TPathNode[], key: string): TPathNode[] | null {
  for (const n of nodes) {
    if (n.key === key) return [n]
    const sub = n.children && findPath(n.children, key)
    if (sub) return [n, ...sub]
  }
  return null
}

export function countFiles(n: TPathNode): number {
  return n.children ? n.children.reduce((s, c) => s + countFiles(c), 0) : 1
}

/** Files of a folder for a dropdown: one section per folder (path from `dir`), the folder's own files first. */
export function flyoutSections(dir: TPathNode): { path: string; files: TPathNode[] }[] {
  const out: { path: string; files: TPathNode[] }[] = []
  const walk = (n: TPathNode, path: string) => {
    const files = (n.children ?? []).filter((c) => !c.children)
    if (files.length) out.push({ path, files })
    for (const c of n.children ?? []) if (c.children) walk(c, `${path} / ${c.label}`)
  }
  walk(dir, dir.label)
  return out
}
