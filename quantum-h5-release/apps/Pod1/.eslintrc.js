module.exports = {
    "env": {
        "browser": true,
        "es2021": true,
        "node": true,
        "commonjs": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:vue/vue3-essential",
    ],
    "overrides": [
        {
            "env": {
                "node": true
            },
            "files": [
                ".eslintrc.{js,cjs}"
            ],
            "parserOptions": {
                "sourceType": "script"
            }
        },
        {
            "files": [
                "*.vue"
            ],
            "parser": "vue-eslint-parser",
            "parserOptions": {
                "parser": "@typescript-eslint/parser",
                "sourceType": "module",
                "ecmaFeatures": {
                    "jsx": true
                }
            }
        }
    ],
    "parserOptions": {
        "ecmaVersion": "latest",
        "parser": "@typescript-eslint/parser",
        "sourceType": "module",
        "ecmaFeatures": {
            "jsx": true
        }
    },
    "plugins": [
        "@typescript-eslint",
        "vue"
    ],
    "rules": {
        'vue/multi-word-component-names': 0,
        '@typescript-eslint/no-unused-vars': 1,
    },
    "globals": {
        "AipptIframe": "readonly"
    }
}