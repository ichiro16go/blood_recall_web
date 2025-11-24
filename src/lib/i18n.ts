// src/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 翻訳リソースの定義
const resources = {
  en: {
    translation: {
      gameTitle: "BLOOD RECALL",
      phases: {
        setup: "SETUP",
        main: "MAIN",
        battle: "BATTLE",
        cleanup: "CLEANUP",
        gameOver: "GAME OVER"
      },
      ui: {
        turn: "Turn {{count}}",
        battleLog: "BATTLE LOG",
        covenantArea: "COVENANT AREA (MARKET)",
        marketEmpty: "Market Empty",
        hand: "Hand: {{count}}",
        atk: "Atk: {{amount}}",
        actions: "Actions: {{current}}/{{max}}",
        totalAttack: "Total Attack: ",
        endMainPhase: "END MAIN PHASE",
        opponentThinking: "OPPONENT THINKING...",
        resolving: "RESOLVING...",
        victory: "VICTORY",
        defeat: "DEFEAT",
        playAgain: "Play Again",
        emptyField: "Empty Field",
        playCardsHere: "Play cards here",
        exhausted: "EXHAUSTED",
        selfInflictBtn: "SELF INFLICT"
      },
      jinki: {
        handSize: "Hand Size:",
        selfInflict: "Self-Inflict:",
        succession: "Succession:"
      },
      // カード情報はIDをキーにして翻訳を定義します（後述）
      cards: {
        c_slash_1: { name: "Weak Slash", desc: "A basic attack." },
        c_blood_1: { name: "Blood Rite", desc: "Draw 1 card." },
        c_heavy_slash: { name: "Heavy Slash", desc: "A heavy blow." },
        c_crimson_shield: { name: "Crimson Shield", desc: "+2 Attack if you have < 10 Life." },
        c_vampiric_strike: { name: "Vampire Strike", desc: "Recover 1 Life." },
        c_frenzy: { name: "Blood Frenzy", desc: "High power, high cost." },
        c_phantom_blade: { name: "Phantom Blade", desc: "Ignores some defense." }
      }
    }
  },
  ja: {
    translation: {
      gameTitle: "ブラッドリコール",
      phases: {
        setup: "準備",
        main: "メイン",
        battle: "戦闘",
        cleanup: "終了",
        gameOver: "ゲーム終了"
      },
      ui: {
        turn: "{{count}}ターン目",
        battleLog: "バトルログ",
        covenantArea: "契約エリア (市場)",
        marketEmpty: "市場在庫なし",
        hand: "手札: {{count}}",
        atk: "攻撃: {{amount}}",
        actions: "アクション: {{current}}/{{max}}",
        totalAttack: "総攻撃力: ",
        endMainPhase: "メインフェイズ終了",
        opponentThinking: "相手が思考中...",
        resolving: "解決中...",
        victory: "勝利",
        defeat: "敗北",
        playAgain: "もう一度遊ぶ",
        emptyField: "フィールドなし",
        playCardsHere: "カードをプレイ",
        exhausted: "行動済",
        selfInflictBtn: "自傷する"
      },
      jinki: {
        handSize: "手札上限:",
        selfInflict: "自傷ダメージ:",
        succession: "血の継承:"
      },
      cards: {
        c_slash_1: { name: "ウィークスラッシュ", desc: "基本的な攻撃。" },
        c_blood_1: { name: "血の儀式", desc: "カードを1枚引く。" },
        c_heavy_slash: { name: "ヘビースラッシュ", desc: "重い一撃。" },
        c_crimson_shield: { name: "紅の盾", desc: "ライフ10未満で攻撃力+2。" },
        c_vampiric_strike: { name: "吸血の一撃", desc: "ライフを1回復。" },
        c_frenzy: { name: "ブラッドフレンジー", desc: "高コスト・高火力。" },
        c_phantom_blade: { name: "幻影の刃", desc: "防御を一部無視する。" }
      }
    }
  }
};

i18n
  .use(LanguageDetector) // ブラウザの言語を検知
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en', // デフォルトは英語
    interpolation: {
      escapeValue: false // ReactはXSS対策済みなのでfalse
    }
  });

export default i18n;