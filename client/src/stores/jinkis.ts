import type { Jinki } from "../types/type";
import { Phase } from "../types/type";

export const ALL_JINKI_DATA: Jinki[] = [
  // -------------------------
  // 1. シラガネ
  // -------------------------
  {
    name: 'シラガネ',
    era: 1980,
    isAwakened: false,
    isTapped: false,
    normal: {
      handSize: 3,
      selfInfliction: 2,
      bloodSuccession: 2,
      passiveEffect: '手札にある段階１のアーツカードを１枚追憶強化'
    },
    awakened: {
      handSize: 3,
      selfInfliction: 2,
      bloodSuccession: 2,
      passiveEffect: '手札にある段階１のアーツカードを２枚追憶強化'
    },
    recalls: [
      {
        id: 'siragane_1',
        name: '血機換装',
        description: '自身のターン中、コスト：２。デッキの上からカードを４枚血廻に送る。',
        trigger: Phase.MAIN,
        cost: { baseAmount: 2, hasVariableCost: false, description: '2' },
        baseAttackBonus: 0,
        isAttackVariable: false,
        effectType: 'MILL',
        effectValue: 4
      },
      {
        id: 'siragane_2',
        name: '超血機換装【雷霆】',
        description: 'バトルフェイズ開始時、コスト：１０枚＋Ｘ。[攻撃]＋Ｘ。Ｘは血廻コスト。',
        trigger: Phase.BATTLE,
        cost: { baseAmount: 10, hasVariableCost: true, variableSource: 'BLOOD_SPENT', description: '10+X' },
        baseAttackBonus: 0,
        isAttackVariable: true,
        effectType: 'BUFF'
      }
    ]
  },

  // -------------------------
  // 2. ヒヒイロガネ
  // -------------------------
  {
    name: 'ヒヒイロガネ',
    era: 1920,
    isAwakened: false,
    isTapped: false,
    normal: {
      handSize: 3,
      selfInfliction: 4,
      bloodSuccession: 2,
      passiveEffect: '契告書エリアから『斬撃一閃』を１枚手札に加える'
    },
    awakened: {
      handSize: 4,
      selfInfliction: 4,
      bloodSuccession: 2,
      passiveEffect: '契告書エリアから『絶技【斬閃】』を１枚手札に加える'
    },
    recalls: [
      {
        id: 'hihiiro_1',
        name: '廃滅の緋',
        description: 'バトルフェイズ終了時、コスト：６。自傷によるダメージを受ける代わりに、契告書エリアから「ブラッドカード」を自傷の数だけプールに加える。',
        trigger: Phase.BATTLE,
        cost: { baseAmount: 6, hasVariableCost: false, description: '6' },
        baseAttackBonus: 0,
        isAttackVariable: false,
        effectType: 'RECOVER'
      },
      {
        id: 'hihiiro_2',
        name: '絶技解放',
        description: '自身のターン中、コスト：１０。血廻コストとして使用した<斬アーツカード>を全て場に出す。',
        trigger: Phase.MAIN,
        cost: { baseAmount: 10, hasVariableCost: false, description: '10' },
        baseAttackBonus: 0,
        isAttackVariable: false,
        effectType: 'OTHER'
      }
    ]
  },

//   // -------------------------
//   // 3. トツカマヂチ
//   // -------------------------
//   {
//     name: 'トツカマヂチ',
//     era: 1950,
//     isAwakened: false,
//     isTapped: false,
//     normal: {
//       handSize: 4,
//       selfInfliction: 2,
//       bloodSuccession: 2,
//       passiveEffect: '契告書エリアから『発狂』を１枚、相手の捨札に置く'
//     },
//     awakened: {
//       handSize: 4,
//       selfInfliction: 2,
//       bloodSuccession: 2,
//       passiveEffect: '契告書エリアから『発狂』を１枚、相手のデッキの１枚目に置く'
//     },
//     recalls: [
//       {
//         id: 'totsuka_1',
//         name: '無間の紫',
//         description: '自身のターン中、コスト：６。契告書エリアから発狂を２枚、相手のデッキの上に置く。',
//         trigger: Phase.MAIN,
//         cost: { baseAmount: 6, hasVariableCost: false, description: '6' },
//         baseAttackBonus: 0,
//         isAttackVariable: false,
//         effectType: 'OTHER'
//       },
//       {
//         id: 'totsuka_2',
//         name: '精神崩壊',
//         description: 'バトルフェイズ開始時、コスト：１０。相手の場にあるカードを１枚、選びあなたの捨札に送る。',
//         trigger: Phase.BATTLE,
//         cost: { baseAmount: 10, hasVariableCost: false, description: '10' },
//         baseAttackBonus: 0,
//         isAttackVariable: false,
//         effectType: 'OTHER'
//       }
//     ]
//   },

  // -------------------------
  // 4. ニライカナイ
  // -------------------------
  {
    name: 'ニライカナイ',
    era: 2000,
    isAwakened: false,
    isTapped: false,
    normal: {
      handSize: 3,
      selfInfliction: 3,
      bloodSuccession: 2,
      passiveEffect: 'デッキのからカードを２枚、血廻エリアに送る'
    },
    awakened: {
      handSize: 3,
      selfInfliction: 3,
      bloodSuccession: 2,
      passiveEffect: '契告書エリアから段階１のアーツカードを２枚選び、血廻エリアに送る。'
    },
    recalls: [
      {
        id: 'niraikanai_1',
        name: '天宆の蒼',
        description: 'バトルでダメージを受けたとき、コスト：６。受けるダメージを-8する',
        trigger: Phase.BATTLE, // 正確にはダメージステップだが便宜上BATTLE
        cost: { baseAmount: 6, hasVariableCost: false, description: '6' },
        baseAttackBonus: 0,
        isAttackVariable: false,
        effectType: 'OTHER'
      },
      {
        id: 'niraikanai_2',
        name: '蒼穹の怒り',
        description: 'バトルフェイズ開始時、コスト：１２。[攻撃]＋Ｘ。Ｘは自分の場に置かれたカードの数に等しい。',
        trigger: Phase.BATTLE,
        cost: { baseAmount: 12, hasVariableCost: true, variableSource: 'HAND_DISCARD', description: '12' },
        baseAttackBonus: 0,
        isAttackVariable: true,
        effectType: 'BUFF'
      }
    ]
  },

  // -------------------------
  // 5. クトネシリカ
  // -------------------------
  {
    name: 'クトネシリカ',
    era: 2020,
    isAwakened: false,
    isTapped: false,
    normal: {
      handSize: 5,
      selfInfliction: 5,
      bloodSuccession: 1,
      passiveEffect: '契告書エリアから「ブラッドカード」を１枚、ブラッドプールに加える。'
    },
    awakened: {
      handSize: 5,
      selfInfliction: 3,
      bloodSuccession: 1, // テキストに記載がない場合は通常維持と仮定(要確認)ですが、Wiki等では覚醒後「?」となっていた箇所。今回はテキストの「5,3,1」に従い1
      passiveEffect: '契告書エリアから「ブラッドカード」を３枚、ブラッドプールに加える。'
    },
    recalls: [
      {
        id: 'kutone_1',
        name: '葬送の黒',
        description: 'バトルフェイズ終了時、コスト：４。人器の血継を＋１する',
        trigger: Phase.BATTLE,
        cost: { baseAmount: 4, hasVariableCost: false, description: '4' },
        baseAttackBonus: 0,
        isAttackVariable: false,
        effectType: 'BUFF' // ステータス永続バフ
      },
      {
        id: 'kutone_2',
        name: '黒き葬列',
        description: 'バトルフェイズ開始時、コスト：６。[攻撃]+6',
        trigger: Phase.BATTLE,
        cost: { baseAmount: 6, hasVariableCost: false, description: '6' },
        baseAttackBonus: 6,
        isAttackVariable: false,
        effectType: 'BUFF'
      }
    ]
  },

  // -------------------------
  // 6. アポイタカラ
  // -------------------------
  {
    name: 'アポイタカラ',
    era: 2040,
    isAwakened: false,
    isTapped: false,
    normal: {
      handSize: 4,
      selfInfliction: 1,
      bloodSuccession: 2,
      passiveEffect: '自傷時、デッキからカードを１枚引く'
    },
    awakened: {
      handSize: 4,
      selfInfliction: 2,
      bloodSuccession: 2,
      passiveEffect: '自傷時、デッキの上から３枚見る。そのうち１枚を手札に加え、残りを捨札にする'
    },
    recalls: [
      {
        id: 'apoi_1',
        name: 'あなたの為に',
        description: '自身のターン中、コスト：８。デッキからカードを２枚引く。この想いと血...',
        trigger: Phase.MAIN,
        cost: { baseAmount: 8, hasVariableCost: false, description: '8' },
        baseAttackBonus: 0,
        isAttackVariable: false,
        effectType: 'DRAW',
        effectValue: 2
      },
      {
        id: 'apoi_2',
        name: '星宿の白',
        description: '自身のターン中、コスト：１２。[攻撃]+8をこのゲーム中継続',
        trigger: Phase.MAIN,
        cost: { baseAmount: 12, hasVariableCost: false, description: '12' },
        baseAttackBonus: 8,
        isAttackVariable: false,
        effectType: 'BUFF' // 永続
      }
    ]
  },

  // -------------------------
  // 7. ウスガネヨロイ
  // -------------------------
  {
    name: 'ウスガネヨロイ',
    era: 1940,
    isAwakened: false,
    isTapped: false,
    normal: {
      handSize: 4,
      selfInfliction: 3,
      bloodSuccession: 2,
      passiveEffect: '契告書エリアから斬撃を１枚手札に加える。'
    },
    awakened: {
      handSize: 4,
      selfInfliction: 4,
      bloodSuccession: 2,
      passiveEffect: '契告書エリアから斬撃を２枚手札に加える。'
    },
    recalls: [
      {
        id: 'usugane_1',
        name: '超克の桜',
        description: 'バトルフェイズ終了時、コスト：８。【継続】各バトルフェイズ終了時に相手に2ダメージ与える',
        trigger: Phase.BATTLE,
        cost: { baseAmount: 8, hasVariableCost: false, description: '8' },
        baseAttackBonus: 0,
        isAttackVariable: false,
        effectType: 'OTHER'
      },
      {
        id: 'usugane_2',
        name: '決死の覚悟',
        description: 'バトルフェイズ開始時、コスト：１０。あなたのライフが１になるようにライフエリアから契告書エリアに「ブラッドカード」を送る。その後[攻撃]＋Ｘを得る。Ｘは契告書に送った「ブラッドカード」の枚数に等しい。',
        trigger: Phase.BATTLE,
        cost: { baseAmount: 10, hasVariableCost: true, variableSource: 'BLOOD_SPENT', description: '10+X' },
        baseAttackBonus: 0,
        isAttackVariable: true,
        effectType: 'BUFF'
      }
    ]
  },

  // -------------------------
  // 8. オボツカグラ
  // -------------------------
  {
    name: 'オボツカグラ',
    era: 2010,
    isAwakened: false,
    isTapped: false,
    normal: {
      handSize: 3,
      selfInfliction: 1,
      bloodSuccession: 2,
      passiveEffect: '自傷時、どちらかを選択し発動する。契告書エリアから[オボツの欠片]を１枚手札に加える。契告書エリアから[赤血]を２枚手札に加える。'
    },
    awakened: {
      handSize: 3,
      selfInfliction: 3,
      bloodSuccession: 2,
      passiveEffect: '自傷時、契告書エリアから[オボツの欠片]を１枚手札に加える。その後、手札からカードを２枚まで選んで血廻エリアに送り血廻に送った数だけデッキからカードを引く'
    },
    recalls: [
      {
        id: 'obotsu_1',
        name: '機翼の藍',
        description: '自身のターン中、コスト：５。即座に人器を覚醒させる。この効果の発動時、人器が横向きの場合、横向きの状態を維持する。すでに覚醒していた場合、デッキからカードを１枚引く。',
        trigger: Phase.MAIN,
        cost: { baseAmount: 5, hasVariableCost: false, description: '5' },
        baseAttackBonus: 0,
        isAttackVariable: false,
        effectType: 'OTHER' // 覚醒
      },
      {
        id: 'obotsu_2',
        name: '全弾発射',
        description: 'バトルフェイズ開始時、コスト：６。[攻撃]＋Ｘ。Ｘはあなたの場にある[オボツの欠片]の数×２に等しい。',
        trigger: Phase.BATTLE,
        cost: { baseAmount: 6, hasVariableCost: true, variableSource: 'HAND_DISCARD', description: '6' },
        baseAttackBonus: 0,
        isAttackVariable: true,
        effectType: 'BUFF'
      }
    ]
  }
];