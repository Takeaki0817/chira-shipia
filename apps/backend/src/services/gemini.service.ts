import { GoogleGenerativeAI } from '@google/generative-ai'

interface SaleItem {
  name: string
  original_price: number | null
  sale_price: number | null
  discount_rate: number | null
  category: string
  unit?: string
  price_proximity?: string
  group_relevance?: string
  cross_sell_potential?: string
}

interface SaleGroup {
  group_name: string
  group_price: number | null
  boundary_description?: string
  price_source?: string
  group_type?: string
  semantic_meaning?: string
  boundary_type?: string
  hierarchy_level?: string
  sale_strategy?: string
  target_customer?: string
  contextual_info?: string
  items: SaleItem[]
}

interface SaleStructureData {
  store_name: string
  sale_period: { start: string; end: string }
  layout_analysis?: string
  hierarchy_structure?: string
  items?: SaleItem[] // 従来形式との互換性
  groups?: SaleGroup[] // 新しいグルーピング形式
}

interface NewSaleFormat {
  store_name: string
  sale_period: { start: string; end: string }
  layout_analysis?: string
  hierarchy_structure?: string
  groups: SaleGroup[]
}

class GeminiService {
  private genAI: GoogleGenerativeAI

  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is required')
    }
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  }

  async structureSaleData(ocrText: string): Promise<SaleStructureData> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const prompt = `
セールチラシのOCRテキストから境界線とレイアウト構造を深く理解し、グルーピングの意味を解釈してJSON形式で商品情報を抽出してください。

# 最重要：テキストベース意味解釈

## 1. テキスト内の境界線・区切り認識
**境界マーカーと意味**：
- 「═══════」「━━━━━」→ メインカテゴリの境界
- 「─────」「------」→ サブカテゴリの境界
- 「■■■特価■■■」「★セール★」→ 特別セクション
- 「【生鮮食品】」「◆お菓子コーナー◆」→ カテゴリセクション
- 空行の連続 → 自然な大分類境界
- インデント → 階層構造の表現

## 2. グルーピングの意味的解釈
**セマンティック分析**：
- **カテゴリ系**：生鮮/冷凍/お菓子/飲料/日用品の分類
- **価格系**：「全品○○円」「半額」「見切り品」「タイムセール」
- **期間系**：「本日限り」「週末特価」「朝市」「夕市」
- **数量系**：「まとめ買い」「〇個以上」「バラ売り」
- **戦略系**：「おすすめ」「人気商品」「新商品」

## 3. 価格と境界の関係性
**価格適用ルール**：
1. **直接隣接**：商品名と同じ行または隣接行の価格
2. **セクション共通価格**：セクションタイトルに含まれる価格
3. **境界内推定**：同じセクション内の他商品価格から推定
4. **境界外は無効**：セクションを越えた価格適用禁止

## 4. 価格と単位の厳密区別
**価格認識**：「¥100」「100円」「100￥」のみ
**非価格**：「100g」「500ml」「3個」「1パック」など

# 出力形式
{
  "store_name": "店舗名", 
  "sale_period": {"start": "2024-12-01", "end": "2024-12-31"},
  "layout_analysis": "テキスト内の境界線とセクション構造の詳細分析",
  "hierarchy_structure": "テキストから読み取れる階層構造",
  "groups": [
    {
      "group_name": "セクション名",
      "group_type": "カテゴリ系/価格系/期間系/数量系/戦略系",
      "semantic_meaning": "このセクションの意味的解釈",
      "boundary_type": "線記号/空行/インデント/装飾文字",
      "boundary_description": "境界線の詳細な特徴",
      "hierarchy_level": "メインカテゴリ/サブカテゴリ/商品グループ",
      "group_price": 共通価格（数値）またはnull,
      "price_source": "価格の根拠",
      "sale_strategy": "セール戦略の解釈",
      "target_customer": "想定される客層",
      "contextual_info": "コンテキスト情報",
      "items": [
        {
          "name": "商品名",
          "original_price": 通常価格（数値）またはnull,
          "sale_price": セール価格（数値）またはnull,
          "discount_rate": 割引率（0.0-1.0）またはnull,
          "category": "カテゴリ",
          "unit": "単位",
          "price_proximity": "価格との位置関係",
          "group_relevance": "このセクションに属する理由",
          "cross_sell_potential": "関連商品との組み合わせ可能性"
        }
      ]
    }
  ]
}

# OCRテキスト:
${ocrText}

分析手順：
1. テキスト内の境界線・区切りを特定
2. セクションごとに価格情報を探索
3. 商品と価格の位置関係を分析
4. セクション内での価格共有を判定

重要：
1. 商品に直接隣接した価格がない場合、同じセクション内の価格を適用してください
2. セクションの境界を越えた価格適用は絶対禁止です
3. **日付は必ず実際の数値で指定**（例：2024-12-01）、テンプレート形式（YYYY-MM-DD）は絶対禁止
4. 日付が不明な場合は現在の年月（2024年12月）を基準に推定してください

JSON形式のみで回答してください:`

    try {
      const result = await model.generateContent(prompt)
      const responseText = result.response.text()
      console.log('Gemini OCR response:', responseText)

      // より柔軟なJSON抽出
      let jsonString = responseText.trim()
      
      // マークダウンコードブロックの除去
      if (jsonString.startsWith('```json') || jsonString.startsWith('```')) {
        jsonString = jsonString.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
      }
      
      // 最初と最後の{...}ブロックを抽出
      const jsonMatch = jsonString.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error(`Valid JSON not found in response: ${responseText}`)
      }

      const parsedData = JSON.parse(jsonMatch[0])
      
      // 日付形式の検証
      this.validateDateFormats(parsedData)
      
      // 新形式（groups）を従来形式（items）に変換して互換性を保つ
      return this.convertToCompatibleFormat(parsedData)
    } catch (error) {
      console.error('Gemini structuring failed:', error)
      if (error instanceof Error && error.message.includes('JSON')) {
        throw new Error(`AI response parsing failed: ${error.message}`)
      }
      throw new Error('AI structuring failed')
    }
  }

  async processImageDirectly(imageBase64: string): Promise<SaleStructureData> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const prompt = `セールチラシの画像を人間の視覚認識と認知能力で解析し、線によるグルーピングの意味を深く理解してJSON形式で商品情報を抽出してください。

# 最重要：線によるグルーピングの完全理解

## 1. 視覚的境界線の詳細認識
**境界線の種類と意味**：
- **太い実線**：主要カテゴリの分離（例：生鮮食品 vs 日用品）
- **破線・点線**：サブカテゴリや特価商品の区分
- **二重線**：重要な特価エリアの強調
- **色付き線**：特別なセール区分
- **枠囲み**：まとめ売りや限定商品
- **背景色の変化**：商品カテゴリや価格帯の違い

## 2. グルーピングの意味的解釈
**セマンティック分析**：
- **商品カテゴリ系**：「生鮮食品」「冷凍食品」「お菓子」「飲料」「日用品」
- **価格帯系**：「全品100円」「半額セール」「特価商品」「見切り品」
- **期間限定系**：「本日限り」「週末特価」「タイムセール」「朝市」
- **数量系**：「まとめ買い」「〇個以上」「パック売り」「バラ売り」
- **ブランド系**：特定メーカーの商品群
- **店舗レイアウト系**：「レジ前」「入口」「冷蔵コーナー」

## 3. 階層構造の認識
**レイアウトの階層理解**：
1. **メインカテゴリ**：大きな線で区切られた主要分類
2. **サブカテゴリ**：小さな線で区切られた細分類
3. **商品グループ**：近接配置された関連商品
4. **個別商品**：単独で配置された商品

## 4. コンテキスト理解
**グルーピングの背景理解**：
- **セール戦略**：なぜこの商品がまとめられているか
- **購買誘導**：関連商品のクロスセル戦略
- **在庫処分**：見切り品や期限近商品の処理
- **季節性**：季節商品や行事関連商品
- **客層ターゲット**：ファミリー向け、単身向けなど

## 5. 価格と単位の厳密区別
**価格認識**：「¥100」「100円」「100￥」のみ
**非価格**：「100g」「500ml」「3個」「1パック」など

# 出力形式
{
  "store_name": "店舗名",
  "sale_period": {"start": "2024-12-01", "end": "2024-12-31"},
  "layout_analysis": "チラシ全体のレイアウト構造と境界線の分析結果",
  "hierarchy_structure": "メインカテゴリ → サブカテゴリの階層構造",
  "groups": [
    {
      "group_name": "グループ名",
      "group_type": "商品カテゴリ系/価格帯系/期間限定系/数量系/ブランド系/店舗レイアウト系",
      "semantic_meaning": "このグルーピングの意味的解釈（なぜまとめられているか）",
      "boundary_type": "太い実線/破線/二重線/色付き線/枠囲み/背景色変化",
      "boundary_description": "境界線の詳細な特徴",
      "hierarchy_level": "メインカテゴリ/サブカテゴリ/商品グループ/個別商品",
      "group_price": 共通価格（数値）またはnull,
      "price_source": "価格の根拠",
      "sale_strategy": "セール戦略の分析（まとめ売り/在庫処分/季節商品など）",
      "target_customer": "ターゲット客層（ファミリー/単身/高齢者など）",
      "contextual_info": "コンテキスト情報（朝市/タイムセール/見切り品など）",
      "items": [
        {
          "name": "商品名",
          "original_price": 通常価格（数値）またはnull,
          "sale_price": セール価格（数値）またはnull,
          "discount_rate": 割引率（0.0-1.0）またはnull,
          "category": "カテゴリ",
          "unit": "単位",
          "price_proximity": "価格との位置関係",
          "group_relevance": "このグループに属する理由",
          "cross_sell_potential": "関連商品との組み合わせ可能性"
        }
      ]
    }
  ]
}

# 詳細分析手順（必須実行）
1. **境界線の種類判別**：実線/破線/二重線/色付き線/枠囲み/背景色の識別
2. **階層構造の把握**：メインカテゴリ → サブカテゴリ → 商品グループの構造理解
3. **グルーピングの意味解釈**：なぜこの商品群がまとめられているかの分析
4. **セール戦略の理解**：まとめ売り/在庫処分/季節商品/クロスセルの判定
5. **価格情報の収集**：各境界内の価格情報を特定
6. **価格適用ルールの決定**：境界を越えない価格の適用
7. **コンテキスト分析**：ターゲット客層やセール背景の理解
8. **関連性の分析**：商品間の相関関係や組み合わせ可能性

# 重要な解釈ガイドライン
**線の意味を読み取る**：
- 太い線 = 重要な分類境界
- 破線 = サブカテゴリや特価区分
- 枠囲み = 特別なセール商品群
- 背景色 = カテゴリや価格帯の違い

**グルーピングの背景を考察**：
- 商品の組み合わせパターン
- セール手法の分析
- 購買行動の誘導意図
- 店舗戦略の理解

**階層構造を意識**：
- 大分類 → 中分類 → 小分類の流れ
- 各レベルでの境界線の違い
- 情報の重要度の判定

重要制約：
1. 境界線を越えた価格適用は絶対禁止
2. 日付は実際の数値で指定（例：2024-12-01）
3. グルーピングの意味的解釈を必ず含める
4. 階層構造を明確に識別する

JSON形式のみで回答してください:`

    try {
      const result = await model.generateContent([
        prompt,
        { inlineData: { data: imageBase64, mimeType: 'image/jpeg' } },
      ])

      const responseText = result.response.text()
      console.log('Gemini response:', responseText)
      
      // より柔軟なJSON抽出
      let jsonString = responseText.trim()
      
      // マークダウンコードブロックの除去
      if (jsonString.startsWith('```json') || jsonString.startsWith('```')) {
        jsonString = jsonString.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
      }
      
      // 最初と最後の{...}ブロックを抽出
      const jsonMatch = jsonString.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error(`Valid JSON not found in response: ${responseText}`)
      }

      const parsedData = JSON.parse(jsonMatch[0])
      
      // 日付形式の検証
      this.validateDateFormats(parsedData)
      
      // 新形式（groups）を従来形式（items）に変換して互換性を保つ
      return this.convertToCompatibleFormat(parsedData)
    } catch (error) {
      console.error('Gemini vision processing failed:', error)
      if (error instanceof Error && error.message.includes('JSON')) {
        throw new Error(`AI response parsing failed: ${error.message}`)
      }
      throw error
    }
  }

  private validateDateFormats(data: any): void {
    if (data.sale_period) {
      const { start, end } = data.sale_period
      
      // テンプレート形式のチェック
      if (start && (start.includes('YYYY') || start.includes('MM') || start.includes('DD'))) {
        console.error('Invalid date template in start date:', start)
        throw new Error(`Invalid date template detected in start date: ${start}`)
      }
      
      if (end && (end.includes('YYYY') || end.includes('MM') || end.includes('DD'))) {
        console.error('Invalid date template in end date:', end)
        throw new Error(`Invalid date template detected in end date: ${end}`)
      }
      
      // 日付の妥当性チェック
      if (start && isNaN(new Date(start).getTime())) {
        console.error('Invalid start date format:', start)
        throw new Error(`Invalid start date format: ${start}`)
      }
      
      if (end && isNaN(new Date(end).getTime())) {
        console.error('Invalid end date format:', end)
        throw new Error(`Invalid end date format: ${end}`)
      }
    }
  }

  private convertToCompatibleFormat(data: any): SaleStructureData {
    // 新形式の場合はitemsに変換
    if (data.groups && Array.isArray(data.groups)) {
      const allItems: SaleItem[] = []
      
      data.groups.forEach((group: SaleGroup) => {
        group.items.forEach((item: SaleItem) => {
          // グループ価格がある場合はそれを使用
          const finalItem = {
            ...item,
            sale_price: item.sale_price || group.group_price,
            // グループ価格を使った場合の割引率計算
            discount_rate: item.discount_rate || (
              item.original_price && group.group_price 
                ? 1 - (group.group_price / item.original_price)
                : null
            )
          }
          allItems.push(finalItem)
        })
      })

      return {
        store_name: data.store_name,
        sale_period: data.sale_period,
        items: allItems,
        groups: data.groups // 新形式も保持
      }
    }

    // 従来形式の場合はそのまま返す
    return {
      store_name: data.store_name,
      sale_period: data.sale_period,
      items: data.items || []
    }
  }

  async generateRecipe(params: RecipeGenerationParams): Promise<GeneratedRecipe> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const prompt = this.buildRecipePrompt(params)

    try {
      const result = await model.generateContent(prompt)
      const responseText = result.response.text()
      console.log('Gemini recipe response:', responseText)

      // より柔軟なJSON抽出
      let jsonString = responseText.trim()
      
      // マークダウンコードブロックの除去
      if (jsonString.startsWith('```json') || jsonString.startsWith('```')) {
        jsonString = jsonString.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
      }
      
      // 最初と最後の{...}ブロックを抽出
      const jsonMatch = jsonString.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error(`Valid JSON not found in recipe response: ${responseText}`)
      }

      return JSON.parse(jsonMatch[0])
    } catch (error) {
      console.error('Recipe generation failed:', error)
      if (error instanceof Error && error.message.includes('JSON')) {
        throw new Error(`Recipe response parsing failed: ${error.message}`)
      }
      throw error
    }
  }

  private buildRecipePrompt(params: RecipeGenerationParams): string {
    return `
料理の専門家として、以下の条件で実用的なレシピを生成してください。

## 利用可能な材料
### 冷蔵庫の食材
${params.inventory
  .map(
    (item) =>
      `- ${item.ingredient_name}（${item.quantity}${item.unit}、期限：${item.expiry_date || '不明'}）`
  )
  .join('\n')}

### 近くのスーパーのセール商品
${params.saleItems
  .map(
    (item) =>
      `- ${item.name}: ${item.sale_price}円（通常${item.original_price}円、${
        Math.round(item.discount_rate * 100)
      }%オフ）`
  )
  .join('\n')}

## 調理条件
- 難易度: ${params.difficulty}/5
- 調理時間: ${params.cookingTime}分以内
- 人数: ${params.servings}人分
- 予算上限: ${params.budget}円
- アレルギー: ${params.allergies.join(', ') || 'なし'}
- 食事制限: ${params.dietaryRestrictions.join(', ') || 'なし'}

## 出力形式（JSON）
{
  "title": "料理名",
  "description": "料理の説明",
  "difficulty": 1-5,
  "cooking_time": 分数,
  "servings": 人数,
  "total_cost": 概算金額,
  "sale_savings": セール商品利用による節約額,
  "ingredients": [
    {
      "name": "材料名",
      "amount": "分量",
      "source": "冷蔵庫" | "セール商品" | "追加購入",
      "cost": 概算価格
    }
  ],
  "instructions": [
    "手順1: 具体的な調理手順",
    "手順2: ..."
  ],
  "tips": [
    "調理のコツやポイント"
  ],
  "nutritional_info": {
    "calories_per_serving": "一人分のカロリー",
    "protein": "タンパク質",
    "carbs": "炭水化物",
    "fat": "脂質"
  },
  "categories": ["和食", "洋食", "中華" など],
  "tags": ["簡単", "節約", "ヘルシー" など]
}

セール商品を優先活用し、消費期限の近い食材から使用してください。JSON形式のみで回答してください:`
  }
}

interface RecipeGenerationParams {
  inventory: Array<{
    ingredient_name: string
    quantity: number
    unit: string
    expiry_date?: string
  }>
  saleItems: Array<{
    name: string
    original_price: number
    sale_price: number
    discount_rate: number
  }>
  difficulty: number
  cookingTime: number
  servings: number
  budget: number
  allergies: string[]
  dietaryRestrictions: string[]
}

interface GeneratedRecipe {
  title: string
  description: string
  difficulty: number
  cooking_time: number
  servings: number
  total_cost: number
  sale_savings: number
  ingredients: Array<{
    name: string
    amount: string
    source: string
    cost: number
  }>
  instructions: string[]
  tips: string[]
  nutritional_info: {
    calories_per_serving: string
    protein: string
    carbs: string
    fat: string
  }
  categories: string[]
  tags: string[]
}

export const geminiService = new GeminiService()