# blood_recall_web

## ディレクトリ構成

```
src/
├── assets/          # 画像やフォントなどの静的アセット
├── components/      # アプリ全体で使う「汎用的な」UIパーツ
│   ├── ui/          # ボタン、入力欄など最小単位 (shadcn/uiなどのライブラリ由来)
│   └── layout/      # ヘッダー、サイドバーなどのレイアウト枠
├── features/        # ★ここが核心。機能（ドメイン）ごとに分割
│   ├── auth/        # 例: 認証機能
│   │   ├── api/     # 認証関連のAPI通信
│   │   ├── components/ # 認証画面専用のコンポーネント (LoginFormなど)
│   │   ├── hooks/   # 認証関連のロジック (useAuthなど)
│   │   └── types/   # 認証関連の型定義
│   └── game/        # 例: ゲーム機能 (TCGシミュレーターならここが厚くなる)
├── hooks/           # アプリ全体で使う汎用hooks (useToggle, useScrollなど)
├── lib/             # サードパーティライブラリの設定・ラッパー (axios, firebase, utilsの再エクスポート)
├── routes/          # ルーティング定義
├── stores/          # グローバルステート (Zustand/Jotaiなどのストア)
├── types/           # アプリ全体で使う型定義 (User, GenericResponseなど)
├── utils/           # 純粋なヘルパー関数 (日付フォーマット、計算ロジック)
├── App.tsx
└── main.tsx
```

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
