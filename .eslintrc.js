/* !minOnSave */

module.exports = {
  root: true,
  parserOptions: {
    project: ["./tsconfig.json", "./public/javascripts/tsconfig.json"]
  },
  plugins: [
    "@typescript-eslint"
  ],
  extends: "standard-with-typescript",
  rules: {
    "no-multiple-empty-lines": ["error", {
      max: 2,
      maxEOF: 1
    }],
    "no-prototype-builtins": "off",
    "padded-blocks": "off",
    quotes: ["error", "double"],
    semi: ["error", "always"],

    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/indent": "off",
    "@typescript-eslint/member-delimiter-style": ["error", {
      multiline: {
        delimiter: "semi",
        requireLast: true
      },
      singleline: {
        delimiter: "semi",
        requireLast: false
      }
    }],
    "@typescript-eslint/naming-convention": "off",
    "@typescript-eslint/semi": ["error", "always"],
    "@typescript-eslint/space-before-function-paren": "off",
    "@typescript-eslint/strict-boolean-expressions": "off",
    "@typescript-eslint/quotes": ["error", "double"]
  }
};
