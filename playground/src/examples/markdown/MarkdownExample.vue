<script setup lang="ts">
import { TMarkdown } from '@vitaliysimkin/t-components/markdown'

const source = `### Release notes

Fixed **login** on *slow* networks, see [docs](https://example.com) and \`config.json\`.

- Checks
  - lint
  - tests
1. Build

> Deploy only after review.

| Module | Status |
|---|:-:|
| core | ok |

\`\`\`
npm run check
\`\`\`

<script>alert(1)<\/script>`
</script>

<template>
  <TMarkdown :source="source" />
</template>
