import pluginVue from 'eslint-plugin-vue'
import vueTsEslintConfig from '@vue/eslint-config-typescript'

export default [
  ...pluginVue.configs['flat/recommended'],
  ...vueTsEslintConfig(),
  {
    rules: {
      'no-console': ['error', { allow: ['warn', 'error'] }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unsafe-function-type': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      'prefer-const': 'warn',
      // vue/require-default-prop will be re-enabled after tasks #03 (form-API unification)
      // and #08 (TFormField wrapper) land, which rewrite these prop definitions.
      // TODO: re-enable after #03 + #08 land
      'vue/require-default-prop': 'off',
    },
  },
  {
    files: ['playground/**'],
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },
  { ignores: ['dist/', 'node_modules/', 'playground/dist/'] },
]
