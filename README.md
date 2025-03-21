# Notion生徒スケジュール管理自動計算アプリケーション

本ドキュメントは、当アプリケーションのアーキテクチャと各ディレクトリの役割、そして全体として提供する機能について記載しています。クリーンアーキテクチャの原則に基づき、保守性、拡張性、テスト容易性を意識して設計されています。

---

## 1. アプリケーション概要

このアプリケーションは、NotionのAPIを用いて生徒のスケジュールデータを取得し、内部の自動計算ロジックで最適なスケジュールを算出するシステムです。  
- **主な機能:**  
  - Notionからのスケジュールデータ取得  
  - 生徒ごと、または全体のスケジュール自動計算  
  - 計算結果のNotionへの反映（更新）

- **設計思想:**  
  クリーンアーキテクチャを採用することで、ビジネスロジックと外部インターフェース（Notion APIなど）を明確に分離し、柔軟かつ保守しやすい構造を実現しています。

---

## 2. ディレクトリ別機能詳細

### 2.1 src/domain
- **目的:**  
  ビジネスロジックの核となるドメインモデルを定義します。  
- **具体例:**  
  - **生徒（Student）**: 生徒の基本情報（名前、ID、所属クラスなど）  
  - **スケジュール（Schedule）**: 各生徒のスケジュールに関するデータ構造  
- **役割:**  
  アプリケーション全体で使用される共通のビジネスロジックやデータ構造を管理し、他の層がこれらのモデルを基に処理を実装できるようにします。

### 2.2 src/usecases
- **目的:**  
  アプリケーションの具体的なビジネスロジック（ユースケース）を実装します。  
- **具体例:**  
  - **スケジュール自動計算:** 生徒ごとのスケジュールデータをもとに、最適なスケジュールを自動で算出  
  - **データ更新:** Notion上のデータと計算結果の同期処理  
- **役割:**  
  ビジネスプロセスやアルゴリズムの実行を担い、エンティティの状態変更やデータ整合性の維持を図ります。

### 2.3 src/infrastructure
- **目的:**  
  外部システム（Notion API・AWS RDS）との連携部分を実装します。  
- **具体例:**  
  - **APIコネクタ:** Notion APIと通信し、必要なデータを取得および更新  
  - **入力/出力ハンドラ:** ユーザーインターフェースや外部からのリクエストの受け口
- **役割:**  
  外部依存性を吸収し、内部ロジックと外部サービスとの橋渡しを行うことで、システム全体の柔軟性とテスト容易性を向上させます。

### 2.4 src/utils
- **目的:**  
  メイン機能を補助するための共通ユーティリティ関数や処理を格納します。  
- **具体例:**  
  - **ログ機能:** アプリケーションの動作状況やエラーを記録するためのログ出力  
  - **日付計算:** 日付や時刻の計算、フォーマット変換などの処理  
  - **特殊テキスト処理:** 特定のフォーマットや文字列操作を行う処理  
- **役割:**  
  各ユースケースやビジネスロジックの補助処理を集約し、再利用可能な形で提供することで、コードの保守性と一貫性を確保します。


---

## 3. アプリケーション機能の詳細

### 3.1 自動スケジュール計算機能
- **概要:**  
  生徒ごとのスケジュールデータを基に、最適なスケジュールを自動で計算します。
- **特徴:**  
  - 複数の生徒やクラスのスケジュールを一括して処理可能  
  - スケジュールの重複や時間の無駄を最小限にするロジックを実装
- **メリット:**  
  手動によるスケジュール管理の手間を大幅に削減し、正確なスケジュール更新を実現。

### 3.2 Notionとの連携機能
- **概要:**  
  Notion APIを利用して、Notion上のデータベースと双方向でデータの取得・更新を行います。
- **特徴:**  
  - Notion上に設定された生徒のスケジュールデータの自動取得  
  - 計算結果をNotion上に反映することで、リアルタイムなスケジュール管理が可能
- **メリット:**  
  既存のNotionワークスペースを活用することで、新たなUIの構築コストを削減し、運用の一元管理が可能となる。

### 3.3 ユーティリティ機能
- **概要:**  
  メイン機能を補助する共通処理を提供するモジュール群です。
- **具体例:**  
  - ログ出力により、アプリケーションの動作状況やエラー発生時の原因を追跡  
  - 日付計算機能により、スケジュール間隔やタイムスタンプ処理を容易に  
  - 特殊テキスト処理で、フォーマット変換やデータクリーニングを実施
- **メリット:**  
  各種補助処理を統一的に管理することで、コードの再利用性や整合性を向上させ、開発効率を高めます。

### 3.4 クリーンアーキテクチャ採用の意義
- **概要:**  
  各層（エンティティ、ユースケース、インターフェース、ユーティリティ）を明確に分離する設計思想です。
- **メリット:**  
  - **保守性:** 変更が必要な部分の影響範囲を限定  
  - **テスト容易性:** 各層を個別にテスト可能  
  - **拡張性:** 新機能の追加や外部連携の実装が容易

---

## 4. 開発のポイントと技術的なチャレンジ

- **設計思想:**  
  クリーンアーキテクチャに則った設計は、ビジネスロジックと外部システムの依存性を明確に分けるため、将来的な機能追加や仕様変更に柔軟に対応できます。

- **実装の工夫:**  
  - 各層の明確な責務分離により、コードの再利用性が向上  
  - Notion APIとの連携部分は抽象化されており、テスト時にモックを用いた単体テストが容易、デバッグ時の影響を最小限化
  - エラー出力をNotionに出すことで万が一エラーが発生した場合に生徒の管理画面にエラーと関連ログを表示する機能を入れ迅速な対応をサポートするよう心掛けている。

- **技術的チャレンジ:**  
  - Notion APIのデータ形式と内部データモデルの整合性を保つための変換ロジック  
  - スケジュール計算のアルゴリズムの最適化（複数条件の調整など）

---

## 5. まとめ

本アプリケーションは、Notionとの連携による効率的なスケジュール管理と、クリーンアーキテクチャの採用による保守性・拡張性を実現しています。  
- **各ディレクトリの役割:**  
  - `src/domain`：ビジネスロジックとデータモデルの定義  
  - `src/usecase`：具体的な処理ロジック（スケジュール計算、データ更新）の実装  
  - `src/interface`：外部APIとの連携部分の実装  
  - `src/utils`：環境設定、依存性注入など基盤部分の管理
  - `src/index`：エントリーポイント

これらの設計と実装により、堅牢で拡張性の高いシステムが実現され、今後の機能追加や改善に柔軟に対応できる基盤となっています。

---

## 参考資料

- [Notion API ドキュメント](https://developers.notion.com)
- [データベース用のリポジトリ](https://github.com/KentaroKajiyama/notion-aws-mysql)

