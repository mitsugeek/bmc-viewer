# Implementation Status

## Done

- TOPIX Core30上位30社を初回バッチとして台帳化。
- 各社の公式IR URL、JPX、EDINET、TDnetの共通公式ソースを台帳とMarkdownに登録。
- 30社分のBMC初期ドラフトMarkdownを作成。
- 30社分のChatGPT Image用プロンプトを作成。
- 30社分のレビュー用PNGを生成。
- 生成ファイルを閲覧する静的Webサイト `site/index.html` を作成。
- BMC画像とWebサイトの一覧/詳細に、企業カラーと事業特性に基づく抽象モチーフを反映。
- 会社全体BMCから事業単位BMCへ深掘りする手順、テンプレート、候補台帳生成スクリプトを追加。
- Webサイトの企業詳細に、事業別BMC候補Markdownへの直接リンク一覧を追加。
- 114件の事業別BMC候補Markdownとレビュー用PNGを生成。
- 事業別BMC候補に `template_only` 品質フラグ、同一テンプレートグループ数、次回調査アクションを追加。
- Webサイトと事業別PNGに、事業別BMC候補がテンプレート初期案であることを明示。
- `scripts/validate_project.py` による台帳、Markdown、プロンプト、画像、Webサイト、品質フラグ、9ブロック構成の検証を通過。

## Before Publishing

- 各社ごとに最新の有価証券報告書URL、決算説明資料URL、統合報告書または同等資料URLを追加する。
- Markdown内の初期ドラフト記述を、各社公式資料に基づいてレビューする。
- ChatGPT Imageで最終画像を作る場合は、`prompts/chatgpt_image/*.txt` を使用し、生成結果を `images/` に保存する。
- 画像内の企業名、証券コード、9ブロック名、主要テキストがMarkdownと一致することを確認する。
- 現在の意匠は公式ブランドガイド準拠ではなく、ロゴを模写しない範囲で企業イメージ・業態に寄せた抽象デザインとしてレビューする。
- Markdownや画像を更新したら、`python3 scripts/build_site_data.py` を実行してWebサイト用データを更新する。
- 事業別BMCを開始するときは、`python3 scripts/scaffold_business_bmcs.py` を実行して `data/business_bmc_backlog.csv` と `business_bmcs/*/*.md` を更新する。
- 事業別BMCドラフトを更新するときは、`python3 scripts/generate_business_bmc_drafts.py` と `python3 scripts/render_business_bmc_png.py` を実行する。
- `template_only` の事業別BMCは、公式資料で事業境界、主要顧客、価値提案、収益源を確認してから `source_review` 以降へ進める。

## Current Status Meaning

`bmc_draft_needs_source_review` は、会社全体BMCの初期ドラフトが存在し、公開前に公式資料レビューが必要な状態を表す。

事業別BMCの `template_only` は、原型テンプレートから作った初期案であり、同じ原型の候補ではBMC本文が重複し得る状態を表す。
