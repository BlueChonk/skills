---
name: review-audit
description: "開発成果物の軽量・低トークン総合監査（バグ・配線・セキュリティ・品質・spec準拠・回帰を read-only で検出し、証拠つき findings + カバレッジ + 判定を返す）。**サブエージェントを増やさず呼び出し側が単一コンテキストで1パス**実施＝トークン消費を抑える。Use when ユーザーが「監査」「audit」「レビュー」「点検」と言ったとき、または AI が nontrivial な実装の done 宣言前の自己検証として自律発動するとき。徹底性・検出力の実証が要る時（リリース前・高リスク・公開前）は `/review-audit-pro` へ。単観点だけ（diffバグ=/code-review・配線=/wired・セキュリティ=/security-review）やワンライナー級・doc のみには使わない。"
---

# /review-audit — 軽量・1パス総合監査。自分の「done」を信用するな

PASS は儀式ではなく欠陥を狩る作戦。**初期状態は全観点 = 未検証。証拠（file:line + 再現/grep/実行）を出せた観点だけが PASS を名乗れる。** 証拠のない PASS・黙ってスキップした観点は、それ自体が欠陥。
監査は read-only。結果は呼び出し側 AI への構造化返却のみ（修正/報告/無視は呼び出し側の裁量）。

**この軽量版の設計**: 呼び出し側エージェントが**自分で**対象を読み6観点を当てる。**既定でサブエージェントを増やさない・fan-out しない・ライブ自己校正をしない**（それらは pro）。規律は pro と同じ（偽PASS禁止・観点の黙殺禁止・証拠必須・read-only）が、実行コストを最小化する。

## 手順

### 0. 対象確定 + read-only スナップショット
- **出力言語（最初に一度）**: スキルディレクトリの `config.yml` を読む（無ければ `auto`）。`auto`=会話/対象の主言語 / `ja`=日本語 / `en`=英語。この値が監査レポート（findings の地の文・カバレッジ表/判定のラベル・要約）の言語を決める。**file:line・コマンド・grep/実行出力・コード・slug・技術用語は値に関わらず常に英語。** `en` のとき返却フォーマットのラベルも英語にする（総合判定→Verdict / Findings / カバレッジ→Coverage / 観点→Axis / 実走した検証コマンド→Commands run / read-only 検証→Read-only check）。
- 引数あり=そのパス。なし=直近の開発成果（git repo なら `git --no-optional-locks diff HEAD` + `status --porcelain` + 直近コミット、非 repo なら直近 Write/Edit したファイル群）。対象が決まらなければ INCOMPLETE で「対象未確定—パス指定を要求」を返す。
- spec 検出: 対象 root の `specs/*.md`（なければ `~/specs/`・`~/.claude/specs/` に同名 slug）。あれば観点⑤ ON。
- read-only 証跡（軽量）: `find <対象> -type f -not -path '*/.git/*' -not -path '*/__pycache__/*' -not -name '*.pyc' -not -path '*/node_modules/*' -print0 | sort -z | xargs -0 md5 | sort > /tmp/ra-before.md5`。監査後に同式で取り `diff`。テスト実走するなら生成物を逃がす（`PYTHONDONTWRITEBYTECODE=1`・`pytest -p no:cacheprovider`）。**source 差分が出たら最悪事故（対象変更）として最上部に報告し PASS 不可。**

### 1. 1パス監査（呼び出し側が自分で・サブエージェント増やさない）
対象（diff があれば変更行とその呼び出し元/先、無ければ主要ファイル）を**自分で Read**し、6観点を順に当てる。各 finding に **file:line + 問題 + 証拠（grep/実行出力/該当コード引用）+ 修正案 + severity（high=実害 / med=条件付き・テスト無効 / low=品質）**。style 指摘は出さない（実害のみ）。

| 観点 | 何を見るか（証拠の取り方） |
|---|---|
| ①バグ | 境界（off-by-one/空/0/負）・null/None 経路・無音 except/catch・戻り値無視・型/単位/TZ取り違え。壊れる入力を1つ示し、可能なら `python3 -c`/`node -e` で再現実行 |
| ②配線(anti-Potemkin) | 新規 symbol を `grep -rn <name>` し定義以外の参照（呼び出し/登録/import 使用）を数える。0件=dead/未登録。stub/TODO/空 handler/canned data も。grep の hit 数を証拠に |
| ③セキュリティ | `grep -rEn "(api[_-]?key|secret|token|password|sk-live|BEGIN [A-Z ]*PRIVATE KEY)" <対象>` 実走。加えて injection（command/SQL 連結）・eval/危険 deserialize・外部送信。semgrep があれば `semgrep --config auto` を1回。無ければ手動 grep のみ＝カバレッジ「部分」 |
| ④テスト実効性 | 新規/変更テストを「未実装スタブでも通るか?」で篩う: tautology・assert無し・happy path のみ・被験対象 mock。被験関数のテスト不在も |
| ⑤spec準拠（spec時のみ） | §11 AC を照合（環境を変えない AC は実走し exit code）。§12 D-n 違反は grep で確認＝high |
| ⑥回帰 | 発見したテスト/ビルドを**実走**（コマンド+末尾出力+exit code が証拠。読んだだけの「壊れてないはず」は PASS 不可）。環境を変えるコマンド（migration/deploy/削除/外部送信）は実行せず「要手動確認」へ |

観点が物理的に該当しない時（doc のみ等）だけ落とし、**落とした事実と理由をカバレッジに必ず書く（黙殺禁止）**。

### 2. インライン自己懐疑（fresh-context 反証はしない=コスト節約）
列挙した finding を**自分でもう一度**疑う: ガード節・到達不能性・実際の挙動を確認し、可能なら実行して反例を探す。**成立しないと自分で確認できたものは外す**（誤検出ノイズは検出力を殺す）。確信が持てないものは severity を下げ「未確証」と明記して残す（黙って消さない）。
※ より厳格に「別個体の反証エージェントで殺す」「検出力を per-run 実証する」のは pro の役割。

### 3. 返却（カバレッジ表のない監査は監査ではない）
総合判定: **FAIL**=high が1件以上 / **PASS**=high 0 かつ該当全観点が「監査済」 / **INCOMPLETE**=未監査・部分の観点が残る（**未監査を抱えたまま PASS 禁止**）。

```markdown
## 監査結果(軽量): {対象}
総合判定: {FAIL — must-fix N | PASS（med N / low N） | INCOMPLETE — 未監査あり}

### Findings
| # | sev | 観点 | file:line | 問題 | 証拠 | 修正案 |

### カバレッジ（6観点 全行必須・ゼロ件でも「なし」と明記）
| 観点 | 状態(監査済/部分/未監査/対象外) | 実施内容(読んだ範囲・実走コマンド) | 未実施の理由 |

### 実走した検証コマンド
- `{cmd}` → exit {N}（末尾出力 数行）

### read-only 検証
- 監査前後 checksum 一致: {YES / NO=最悪事故}
```
「監査済」と書ける条件 = 実施内容に具体的なコマンド・範囲があること。空・抽象なら「未監査」に降格。

### 4. エスカレーション
次のいずれかなら、軽量で終えず `/review-audit-pro` を勧める（または明示時はそちらを使う）: リリース前・公開前・高リスク（外部公開/課金/認証/データ破壊）・大規模 surface（多数ファイル）・**検出力そのものを per-run 実証したい**（pro のライブ自己校正）・1パスで自信が持てず fresh-context の敵対検証が要る。

## 禁止事項
- **偽 PASS 禁止。** 検証していない観点を PASS/監査済と書かない。証拠の無い「監査済」は書けない。
- **対象コードの変更禁止**（read-only・前後 checksum で担保。修正案は出すが適用しない）。
- **観点・finding の黙殺禁止**（落とした観点はカバレッジへ・外した finding は理由を残す）。
- **「読んだ限り大丈夫」での回帰/配線 PASS 禁止**（実走の出力と exit code のみが証拠）。
- **コスト超過時はサブエージェントを増やさない** — 足りなければ pro へエスカレーションする（無理に軽量版を肥大化させない）。

証拠で言えないことは、起きていない。検証していないことは、PASS ではない。
