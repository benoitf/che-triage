// eslint-disable-next-line no-undef
module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',  
    rules: {
      "@typescript-eslint/class-name-casing": "error",
      "@typescript-eslint/consistent-type-definitions": "error",
      "@typescript-eslint/indent": "off",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/quotes": [
          "error",
          "single",
          {
              "avoidEscape": true
          }
      ],
      "@typescript-eslint/semi": [
          "error",
          "always"
      ],
      "@typescript-eslint/type-annotation-spacing": "error",
      "arrow-body-style": [
          "error",
          "as-needed"
      ],
      "arrow-parens": [
          "error",
          "as-needed"
      ],
      "camelcase": "off",
      "comma-dangle": "off",
      "curly": "error",
      "eol-last": "error",
      "eqeqeq": [
          "error",
          "smart"
      ],
      "guard-for-in": "error",
      "id-blacklist": "off",
      "id-match": "off",
      "import/no-deprecated": "error",
      "import/no-extraneous-dependencies": "off",
      "max-len": [
          "error",
          {
              "code": 180
          }
      ],
      "no-magic-numbers": "off",
      "no-multiple-empty-lines": [
          "error",
          {
              "max": 1
          }
      ],
      "no-new-wrappers": "error",
      "no-null/no-null": "error",
      "no-shadow": [
          "error",
          {
              "hoist": "all"
          }
      ],
      "no-throw-literal": "error",
      "no-trailing-spaces": "error",
      "no-underscore-dangle": "off",
      "no-unused-expressions": "error",
      "no-var": "error",
      "no-void": "error",
      "one-var": [
          "error",
          "never"
      ],
      "prefer-const": [
          "error",
          {
              "destructuring": "all"
          }
      ],
      "radix": "off",
      "space-before-function-paren": [
          "error",
          {
              "anonymous": "always",
              "named": "never",
              "asyncArrow": "always"
          }
      ],
      "spaced-comment": [
          "error",
          "always",
          {
              "exceptions": [
                  "*",
                  "+",
                  "-",
                  "/"
              ]
          }
      ],
    },
    plugins: [
      '@typescript-eslint',
      'jest',
      'import',
      "no-null",
    ],
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/eslint-recommended',
      'plugin:@typescript-eslint/recommended',
      'prettier/@typescript-eslint',
      'plugin:jest/recommended',
    ],

  };
