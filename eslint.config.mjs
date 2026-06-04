// ESLint v9 flat config — TypeScript + Astro (recommandés, non type-checkés : rapide).
import js from '@eslint/js';
import ts from 'typescript-eslint';
import astro from 'eslint-plugin-astro';

export default ts.config(
  // docs/ = outillage couleurs autonome (CDN Tailwind + scripts Node CJS),
  // hors périmètre lint comme il l'est déjà de check:tokens.
  { ignores: ['dist/', '.astro/', 'node_modules/', 'docs/'] },
  js.configs.recommended,
  ...ts.configs.recommended,
  ...astro.configs.recommended,
  {
    rules: {
      // Les variables préfixées par _ sont volontairement inutilisées.
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // `as any` ponctuel (polymorphisme de balise Astro) toléré.
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  // Scripts Node (outillage) — globals Node.
  {
    files: ['scripts/**/*.mjs', '*.mjs', '*.config.*'],
    languageOptions: {
      globals: { process: 'readonly', console: 'readonly', URL: 'readonly' },
    },
  },
  // Déclarations Astro générées.
  {
    files: ['**/*.d.ts'],
    rules: { '@typescript-eslint/triple-slash-reference': 'off' },
  },
);
