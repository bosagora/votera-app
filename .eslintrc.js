module.exports = {
    "env": {
        "es2021": true,
        "node": true,
        "react-native/react-native": true
    },
    "extends": [
        "airbnb",
        "airbnb/hooks",
        "prettier",
        "eslint:recommended",
        "plugin:prettier/recommended",
        "plugin:react/recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "plugin:react-native/all"
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "project": "./tsconfig.json",
        "ecmaFeatures": {
            "jsx": true,
            "tsx": true,
        },
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "plugins": [
        "react",
        "react-native",
        "react-hooks",
        "@typescript-eslint",
        "prettier"
    ],
    "rules": {
        "import/no-unresolved": 0,
        "import/no-extraneous-dependencies": 0,
        "react-native/no-unused-styles": 2,
        "react-native/split-platform-components": 2,
        "react-native/no-inline-styles": 0,
        "react-native/no-color-literals": 0,
        "react-native/no-raw-text": 2,
        "react-native/no-single-element-style-arrays": 0,
        "prettier/prettier": "error",
        "react/jsx-filename-extension": [2, { 'extensions': ['.js', '.jsx', '.ts', '.tsx']}],
        '@typescript-eslint/explicit-function-return-type': 'off',
        "no-use-before-define": "off",
        "@typescript-eslint/no-use-before-define": ["error"],
        "no-shadow": "off",
        "@typescript-eslint/no-shadow": ["error"],
        "react-hooks/exhaustive-deps": 'warn',
        'import/extensions': [ 
            "error",
            { 
                js: 'never', 
                jsx: 'never', 
                ts: 'never', 
                tsx: 'never',
                json: 'always'
            }, 
        ],
        "react-native/no-raw-text": [2, { skip: ['NSText', 'Text.Text'] }],
        "camelcase": ["error", { ignoreImports: true }],
    }
}
