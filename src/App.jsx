import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { RELATIVE_QUESTIONS, PRESET_REPLIES, LUCKY_PHRASES } from './data/replies';

// 創作者資訊
const CREATOR_INFO = {
  name: "Nick Chang",
  studio: "ZN Studio",
  threads: "@nickai216",
  threadsUrl: "https://www.threads.net/@nickai216",
  line: "@znstudio",
  lineUrl: "https://lin.ee/bDPcfa9h", // 請替換成實際 LINE 連結
  website: "https://portaly.cc/zn.studio",
  email: "nickleo051216@gmail.com",
  phone: "0932-684-051",
};

// 預設親戚問題


// 回嘴風格
const REPLY_STYLES = [
  { id: "savage", name: "機車嗆爆", emoji: "🔥", desc: "直接開嗆，讓親戚閉嘴" },
  { id: "sharp", name: "犀利反擊", emoji: "⚔️", desc: "一針見血，反將一軍" },
  { id: "funny", name: "幽默諷刺", emoji: "🤡", desc: "笑著讓對方吃癟" },
  { id: "gentle", name: "溫柔刀", emoji: "🗡️", desc: "笑裡藏刀，殺人不見血" },
];

// 預設回覆


// 超豐富吉祥話庫


const getRandomLuckyPhrase = () => {
  const allCategories = Object.values(LUCKY_PHRASES);
  const allPhrases = allCategories.flat();
  return allPhrases[Math.floor(Math.random() * allPhrases.length)];
};

const getLuckyPhraseByCategory = (category) => {
  const phrases = LUCKY_PHRASES[category] || LUCKY_PHRASES.classic;
  return phrases[Math.floor(Math.random() * phrases.length)];
};

const getMatchedLuckyPhrase = (questionCategory) => {
  const categoryMap = {
    "感情": "love",
    "工作": "career",
    "家庭": "classic",
    "財務": "money",
    "比較": "funny",
    "外貌": "health",
    "學業": "career",
    "人生": "funny",
  };

  if (Math.random() < 0.7) {
    const matchedCategory = categoryMap[questionCategory] || "classic";
    return getLuckyPhraseByCategory(matchedCategory);
  }
  return getRandomLuckyPhrase();
};

// 全網募資進度
const CURRENT_DONATION = 0; // 手動更新此數字 (單位: 杯咖啡)
const GOAL_DONATION = 50;
const ENABLE_GLOBAL_AI = CURRENT_DONATION >= GOAL_DONATION;

// AI 使用次數管理
const AI_DAILY_LIMIT = 5;
const STORAGE_KEY = 'cny_ai_usage';
const UNLOCK_KEY = 'cny_ai_unlocked';

const getAIUsage = () => {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const today = new Date().toDateString();
    if (data.date !== today) {
      return { date: today, count: 0 };
    }
    return data;
  } catch {
    return { date: new Date().toDateString(), count: 0 };
  }
};

const incrementAIUsage = () => {
  const usage = getAIUsage();
  usage.count += 1;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
  return usage.count;
};

const isAIUnlocked = () => {
  try {
    return localStorage.getItem(UNLOCK_KEY) === 'true';
  } catch {
    return false;
  }
};

const unlockAI = () => {
  localStorage.setItem(UNLOCK_KEY, 'true');
};

// ============ AI API 呼叫函數 ============
const generateAIReply = async (question, styleId, previousReply = null) => {
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question,
        style: styleId,
        previousReply,
      }),
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    return data.reply;
  } catch (error) {
    console.error('AI API Error:', error);
    return null; // 返回 null 表示失敗，會使用備用回覆
  }
};

export default function CNYGame() {
  const [currentView, setCurrentView] = useState('home');
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [customQuestion, setCustomQuestion] = useState('');
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [generatedReply, setGeneratedReply] = useState('');
  const [luckyPhrase, setLuckyPhrase] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);
  const [aiUsage, setAiUsage] = useState({ count: 0 });
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [useAI, setUseAI] = useState(false);
  const resultCardRef = useRef(null);

  useEffect(() => {
    setAiUsage(getAIUsage());
    setIsUnlocked(isAIUnlocked());
    if (ENABLE_GLOBAL_AI) {
      setUseAI(true);
    }
  }, []);

  const canUseAI = () => isUnlocked || aiUsage.count < AI_DAILY_LIMIT;
  const getRemainingAICount = () => Math.max(0, AI_DAILY_LIMIT - aiUsage.count);

  const handleDonate = () => {
    // TODO: 串接實際金流（綠界 / LINE Pay）
    // window.open('你的金流連結', '_blank');
    unlockAI();
    setIsUnlocked(true);
    setShowDonateModal(false);
    alert('🎉 感謝支持！AI 回覆已永久解鎖！');
  };

  const generateReply = async () => {
    setIsLoading(true);
    setCurrentView('generating');

    const question = selectedQuestion?.question || customQuestion;
    const questionCategory = selectedQuestion?.category || "人生";
    // 只有在全網募資達標或使用者有權限時才允許使用 AI
    const shouldUseAI = (ENABLE_GLOBAL_AI || (useAI && canUseAI()));

    // 預設回覆邏輯更新：從陣列中隨機選一個
    const presetReplies = PRESET_REPLIES[question]?.[selectedStyle.id];
    const presetReply = Array.isArray(presetReplies)
      ? presetReplies[Math.floor(Math.random() * presetReplies.length)]
      : presetReplies;

    let finalReply = null;

    if (shouldUseAI && ENABLE_GLOBAL_AI) { // 目前暫時只在全網解鎖時使用 AI (或依據需求調整)
      finalReply = await generateAIReply(question, selectedStyle.id);
      if (!finalReply) {
        const fallbackReplies = {
          savage: ["關你屁事", "你很閒齁", "管好自己吧"],
          sharp: ["你先回答我好了", "這問題很重要嗎"],
          funny: ["我聽不懂你在說什麼耶", "這題我選擇跳過"],
          gentle: ["謝謝關心，但您更需要被關心", "您辛苦了"]
        };
        const replies = fallbackReplies[selectedStyle.id] || fallbackReplies.savage;
        finalReply = replies[Math.floor(Math.random() * replies.length)];
      }
    } else {
      // 使用豐富的預設回覆
      await new Promise(resolve => setTimeout(resolve, 800)); // 假裝思考一下
      if (presetReply) {
        finalReply = presetReply;
      } else {
        // 通用回覆 (沒對應到題目時)
        const genericReplies = {
          savage: ["你管太多了吧", "這關你什麼事", "有事嗎", "您還是多關心自己吧", "這問題太無聊"],
          sharp: ["那您呢", "您先回答好了", "這問題問你自己", "您覺得呢？", "這很重要嗎？"],
          funny: ["蛤？", "我聽不懂耶", "下一題", "訊號不好聽不清楚", "這題超綱了"],
          gentle: ["謝謝關心呢", "您真的很關心我", "我會加油的", "讓您費心了", "目前還在努力中"]
        };
        const replies = genericReplies[selectedStyle.id];
        finalReply = replies[Math.floor(Math.random() * replies.length)];
      }
    }

    setGeneratedReply(finalReply);
    setLuckyPhrase(getMatchedLuckyPhrase(questionCategory));
    setIsLoading(false);
    setCurrentView('result');
    setShowFireworks(true);
    setTimeout(() => setShowFireworks(false), 3000);
  };

  const restart = () => {
    setSelectedQuestion(null);
    setCustomQuestion('');
    setSelectedStyle(null);
    setGeneratedReply('');
    setLuckyPhrase('');
    setUseAI(false);
    setCurrentView('home');
  };

  const reroll = async () => {
    setCurrentView('generating');
    setIsLoading(true);
    const question = selectedQuestion?.question || customQuestion;
    const questionCategory = selectedQuestion?.category || "人生";

    let newReply = null;

    if (ENABLE_GLOBAL_AI) {
      newReply = await generateAIReply(question, selectedStyle.id, generatedReply);
      if (!newReply) {
        const fallback = ["關你屁事", "你很閒齁"];
        newReply = fallback[Math.floor(Math.random() * fallback.length)];
      }
    } else {
      await new Promise(resolve => setTimeout(resolve, 600));
      const presetReplies = PRESET_REPLIES[question]?.[selectedStyle.id];

      if (Array.isArray(presetReplies)) {
        newReply = presetReplies[Math.floor(Math.random() * presetReplies.length)];
        if (newReply === generatedReply && presetReplies.length > 1) {
          newReply = presetReplies[Math.floor(Math.random() * presetReplies.length)];
        }
      } else if (presetReplies) {
        newReply = presetReplies;
      } else {
        const genericReplies = {
          savage: ["你管太多了吧", "這關你什麼事", "有事嗎", "您還是多關心自己吧", "這問題太無聊"],
          sharp: ["那您呢", "您先回答好了", "這問題問你自己", "您覺得呢？", "這很重要嗎？"],
          funny: ["蛤？", "我聽不懂耶", "下一題", "訊號不好聽不清楚", "這題超綱了"],
          gentle: ["謝謝關心呢", "您真的很關心我", "我會加油的", "讓您費心了", "目前還在努力中"]
        };
        const replies = genericReplies[selectedStyle.id];
        newReply = replies[Math.floor(Math.random() * replies.length)];
      }
    }

    setGeneratedReply(newReply);
    setLuckyPhrase(getMatchedLuckyPhrase(questionCategory));
    setIsLoading(false);
    setCurrentView('result');
  };

  const handleShare = async () => {
    if (resultCardRef.current) {
      try {
        const canvas = await html2canvas(resultCardRef.current, {
          backgroundColor: null,
          scale: 2,
          useCORS: true
        });

        canvas.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], "cny-reply.png", { type: "image/png" });
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

            // 只有在手機上且支援分享時才呼叫原生分享
            if (isMobile && navigator.share && navigator.canShare({ files: [file] })) {
              try {
                await navigator.share({
                  files: [file],
                  title: '親戚回嘴產生器',
                  text: '這是我用親戚回嘴產生器生成的神回覆，快來試試！'
                });
              } catch (err) {
                console.error("Share failed", err);
                // 分享失敗（或取消）時，回退到下載
                const link = document.createElement('a');
                link.href = canvas.toDataURL("image/png");
                link.download = 'cny-reply.png';
                link.click();
              }
            } else {
              // 電腦版或不支援分享時，直接下載
              const link = document.createElement('a');
              link.href = canvas.toDataURL("image/png");
              link.download = 'cny-reply.png';
              link.click();
              alert("已下載圖片！快分享給朋友吧！");
            }
          }
        });
      } catch (error) {
        console.error("Screenshot failed", error);
        alert("圖片生成失敗，請手動截圖試試！");
      }
    }
  };

  const Fireworks = () => (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <div key={i} className="absolute animate-firework"
          style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 60}%`, animationDelay: `${Math.random() * 2}s` }}>
          <span className="text-2xl">{['✨', '🎆', '🎇', '⭐', '💫', '🔥'][Math.floor(Math.random() * 6)]}</span>
        </div>
      ))}
    </div>
  );

  // 關於我 Modal
  const AboutModal = () => (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowAboutModal(false)}>
      <div className="bg-gradient-to-br from-red-900 to-red-950 rounded-3xl p-6 max-w-sm w-full border-2 border-yellow-500/50 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl shadow-lg">
            🧑‍💻
          </div>
          <h3 className="text-2xl font-bold text-yellow-400">{CREATOR_INFO.name}</h3>
          <p className="text-red-200">{CREATOR_INFO.studio}</p>
          <p className="text-red-400 text-sm mt-1">AI 自動化顧問 · n8n 講師</p>
        </div>

        <div className="space-y-3 mb-6">
          <a href={CREATOR_INFO.threadsUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 bg-red-800/50 rounded-xl hover:bg-red-800 transition-colors">
            <span className="text-xl">📱</span>
            <div>
              <p className="text-red-200 text-sm">Threads</p>
              <p className="text-yellow-400 font-medium">{CREATOR_INFO.threads}</p>
            </div>
          </a>

          <a href={CREATOR_INFO.website} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 bg-red-800/50 rounded-xl hover:bg-red-800 transition-colors">
            <span className="text-xl">🌐</span>
            <div>
              <p className="text-red-200 text-sm">個人網站</p>
              <p className="text-yellow-400 font-medium">portaly.cc/zn.studio</p>
            </div>
          </a>

          <a href={`mailto:${CREATOR_INFO.email}`}
            className="flex items-center gap-3 p-3 bg-red-800/50 rounded-xl hover:bg-red-800 transition-colors">
            <span className="text-xl">📧</span>
            <div>
              <p className="text-red-200 text-sm">Email</p>
              <p className="text-yellow-400 font-medium text-sm">{CREATOR_INFO.email}</p>
            </div>
          </a>

          <a href={`tel:${CREATOR_INFO.phone}`}
            className="flex items-center gap-3 p-3 bg-red-800/50 rounded-xl hover:bg-red-800 transition-colors">
            <span className="text-xl">📞</span>
            <div>
              <p className="text-red-200 text-sm">電話</p>
              <p className="text-yellow-400 font-medium">{CREATOR_INFO.phone}</p>
            </div>
          </a>
        </div>

        <div className="bg-red-950/50 rounded-xl p-4 mb-4 border border-red-700/30">
          <p className="text-red-300 text-sm text-center">
            🎓 已教授超過 4,000+ 學員
            <br />
            專精 n8n 工作流程自動化
          </p>
        </div>

        <button
          onClick={() => setShowAboutModal(false)}
          className="w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-red-900 font-bold rounded-xl hover:shadow-lg transition-all"
        >
          關閉
        </button>
      </div>
    </div>
  );

  // 斗內 Modal
  const DonateModal = () => (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowDonateModal(false)}>
      <div className="bg-gradient-to-br from-red-900 to-red-950 rounded-3xl p-6 max-w-sm w-full border-2 border-yellow-500/50 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="text-center mb-6">
          <span className="text-5xl block mb-3">🤖</span>
          <h3 className="text-2xl font-bold text-yellow-400 mb-2">AI 神回覆</h3>
          <p className="text-red-200 text-sm">解鎖無限 AI 生成回覆</p>
        </div>

        <div className="bg-red-950/50 rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-red-300">免費額度</span>
            <span className="text-yellow-400 font-bold">{getRemainingAICount()} / {AI_DAILY_LIMIT} 次/天</span>
          </div>
          <div className="w-full bg-red-800 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded-full transition-all"
              style={{ width: `${(getRemainingAICount() / AI_DAILY_LIMIT) * 100}%` }}
            />
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-red-100">
            <span className="text-green-400">✓</span>
            <span>無限次 AI 生成回覆</span>
          </div>
          <div className="flex items-center gap-3 text-red-100">
            <span className="text-green-400">✓</span>
            <span>自訂問題也能用 AI</span>
          </div>
          <div className="flex items-center gap-3 text-red-100">
            <span className="text-green-400">✓</span>
            <span>永久解鎖，不限天數</span>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleDonate}
            className="w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-red-900 font-bold rounded-xl hover:shadow-lg hover:shadow-yellow-500/30 transition-all flex items-center justify-center gap-2"
          >
            <span>☕</span>
            <span>請我喝杯咖啡 ($30)</span>
          </button>
          <button
            onClick={() => setShowDonateModal(false)}
            className="w-full py-3 bg-red-800/50 text-red-300 font-medium rounded-xl hover:bg-red-800 transition-colors"
          >
            先用免費的
          </button>
        </div>

        <p className="text-center text-red-500/60 text-xs mt-4">
          支持 {CREATOR_INFO.studio}，讓更多神器誕生 🙏
        </p>
      </div>
    </div>
  );

  // Footer 元件
  const Footer = ({ showAbout = true }) => (
    <div className="text-center mt-8 space-y-2">
      <div className="flex items-center justify-center gap-3">
        <a href={CREATOR_INFO.threadsUrl} target="_blank" rel="noopener noreferrer"
          className="text-red-400/60 hover:text-yellow-400 transition-colors text-sm">
          Threads {CREATOR_INFO.threads}
        </a>
        <span className="text-red-700">·</span>
        <a href={CREATOR_INFO.website} target="_blank" rel="noopener noreferrer"
          className="text-red-400/60 hover:text-yellow-400 transition-colors text-sm">
          🌐 官網
        </a>
      </div>
      <p className="text-red-300/60 text-sm">
        by {CREATOR_INFO.studio}
        {showAbout && (
          <button onClick={() => setShowAboutModal(true)} className="ml-2 underline hover:text-yellow-400">
            關於我
          </button>
        )}
      </p>
    </div>
  );

  const HomePage = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-yellow-400/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-red-400/20 rounded-full blur-3xl" />
        {[...Array(8)].map((_, i) => (
          <div key={i} className="absolute text-4xl animate-float opacity-30"
            style={{ left: `${10 + i * 12}%`, animationDelay: `${i * 0.5}s`, top: '-50px' }}>
            {['福', '春', '財', '喜', '旺', '發', '吉', '祥'][i]}
          </div>
        ))}
      </div>
      <div className="relative z-10 text-center">
        <div className="mb-8">
          <span className="text-6xl mb-4 block animate-bounce-slow">🔥</span>
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-400 to-yellow-600 drop-shadow-lg"
            style={{ fontFamily: "'Noto Serif TC', serif" }}>
            親戚回嘴產生器
          </h1>
          <p className="text-red-200 mt-3 text-lg tracking-wider">過年必備神器・讓親戚閉嘴</p>
        </div>
        <div className="bg-gradient-to-br from-red-900/80 to-red-950/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-yellow-500/30 max-w-md mx-auto">
          <div className="space-y-4 text-left text-red-100 mb-8">
            <div className="flex items-center gap-3 p-3 bg-red-800/40 rounded-xl">
              <span className="text-2xl">👵</span><span>選擇親戚的靈魂拷問</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-red-800/40 rounded-xl">
              <span className="text-2xl">🔥</span><span>挑選嗆人的程度</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-red-800/40 rounded-xl">
              <span className="text-2xl">💥</span><span>獲得神回覆・讓親戚語塞</span>
            </div>
          </div>

          <div className="mb-6 p-4 bg-red-950/50 rounded-xl border border-red-700/50">
            {ENABLE_GLOBAL_AI ? (
              <div className="text-center">
                <p className="text-green-400 font-bold mb-2">🎉 全網集氣成功！AI 功能已解鎖！</p>
                <p className="text-red-200 text-sm">現在您可以無限使用 AI 生成神回覆！</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-yellow-400 font-bold flex items-center gap-2">
                    <span>☕</span> 全網募資解鎖 AI
                  </p>
                  <span className="text-red-200 text-sm">{CURRENT_DONATION} / {GOAL_DONATION} 杯</span>
                </div>
                <div className="w-full bg-red-900 rounded-full h-3 mb-3 relative overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-full rounded-full transition-all duration-1000 relative"
                    style={{ width: `${Math.min((CURRENT_DONATION / GOAL_DONATION) * 100, 100)}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </div>
                </div>
                <p className="text-red-300 text-xs text-center mb-3">
                  AI 伺服器成本高昂，目前功能暫時封印。<br />
                  請我們喝杯咖啡，加速解鎖全網 AI 功能！
                </p>
                <button
                  onClick={() => window.open('https://portaly.cc/zn.studio/support', '_blank')}
                  className="w-full py-2 bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 rounded-lg hover:bg-yellow-500/30 transition-colors text-sm font-bold flex items-center justify-center gap-2"
                >
                  <span>🧧</span> 贊助 一杯咖啡 加速解鎖
                </button>
              </>
            )}
          </div>

          <button onClick={() => setCurrentView('select')}
            className="w-full py-4 px-8 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-red-900 font-bold text-xl rounded-2xl shadow-lg hover:shadow-yellow-500/50 transform hover:scale-105 transition-all duration-300 active:scale-95">
            🎯 開始反擊
          </button>
        </div>

        <Footer />
      </div>
    </div>
  );

  const SelectPage = () => (
    <div className="min-h-screen p-4 md:p-6 pb-32 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 text-8xl opacity-10 rotate-12">🔥</div>
        <div className="absolute bottom-10 left-10 text-8xl opacity-10 -rotate-12">💢</div>
      </div>
      <div className="max-w-2xl mx-auto relative z-10">
        <button onClick={restart} className="mb-6 text-red-200 hover:text-yellow-400 transition-colors flex items-center gap-2">
          ← 返回首頁
        </button>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-yellow-500 text-red-900 rounded-full flex items-center justify-center text-sm font-black">1</span>
            親戚又在問什麼？
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {RELATIVE_QUESTIONS.map((q) => (
              <button key={q.id} onClick={() => { setSelectedQuestion(q); setCustomQuestion(''); }}
                className={`p-4 rounded-xl text-left transition-all duration-300 border-2 ${selectedQuestion?.id === q.id
                  ? 'bg-yellow-500/20 border-yellow-500 shadow-lg shadow-yellow-500/20'
                  : 'bg-red-900/50 border-red-700/50 hover:border-yellow-500/50 hover:bg-red-800/50'
                  }`}>
                <span className="text-xl mr-2">{q.icon}</span>
                <span className="text-red-100">{q.question}</span>
              </button>
            ))}
          </div>
          <div className="mt-4">
            <p className="text-red-300 text-sm mb-2">親戚問了其他的？自己輸入：</p>
            <input type="text" value={customQuestion}
              onChange={(e) => { setCustomQuestion(e.target.value); setSelectedQuestion(null); }}
              placeholder="輸入那個白目親戚的問題..."
              className="w-full p-4 rounded-xl bg-red-900/50 border-2 border-red-700/50 text-red-100 placeholder-red-400/50 focus:outline-none focus:border-yellow-500 transition-colors" />
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-yellow-500 text-red-900 rounded-full flex items-center justify-center text-sm font-black">2</span>
            要多嗆？
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {REPLY_STYLES.map((style) => (
              <button key={style.id} onClick={() => setSelectedStyle(style)}
                className={`p-4 rounded-xl text-center transition-all duration-300 border-2 ${selectedStyle?.id === style.id
                  ? 'bg-yellow-500/20 border-yellow-500 shadow-lg shadow-yellow-500/20'
                  : 'bg-red-900/50 border-red-700/50 hover:border-yellow-500/50 hover:bg-red-800/50'
                  }`}>
                <span className="text-3xl block mb-2">{style.emoji}</span>
                <span className="text-red-100 font-bold block">{style.name}</span>
                <span className="text-red-400 text-xs block mt-1">{style.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6 p-4 bg-red-900/50 rounded-xl border-2 border-red-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🤖</span>
              <div>
                <p className="text-red-100 font-bold">使用 AI 生成</p>
                <p className="text-red-400 text-xs">
                  {ENABLE_GLOBAL_AI ? '已全網解鎖' : '需全網集氣解鎖'}
                </p>
              </div>
            </div>
            <button
              disabled={!ENABLE_GLOBAL_AI}
              className={`w-14 h-8 rounded-full transition-all duration-300 ${ENABLE_GLOBAL_AI && useAI ? 'bg-green-500' : 'bg-gray-600'}`}
            >
              <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-all duration-300 ${ENABLE_GLOBAL_AI && useAI ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>
          {useAI && !isUnlocked && (
            <p className="text-yellow-400/80 text-xs mt-2 flex items-center gap-1">
              <span>💡</span>
              <span>使用後會消耗 1 次額度</span>
              <button onClick={() => setShowDonateModal(true)} className="underline ml-1">解鎖無限</button>
            </p>
          )}
        </div>

        <button onClick={generateReply}
          disabled={(!selectedQuestion && !customQuestion) || !selectedStyle}
          className={`w-full py-4 px-8 font-bold text-xl rounded-2xl shadow-lg transform transition-all duration-300 ${(selectedQuestion || customQuestion) && selectedStyle
            ? 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-red-900 hover:shadow-yellow-500/50 hover:scale-105 active:scale-95'
            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}>
          {useAI ? '🤖 AI 生成神回覆' : '💥 產生神回覆'}
        </button>
      </div>
    </div>
  );

  const GeneratingPage = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="text-center">
        <div className="relative w-32 h-32 mx-auto mb-8">
          <div className="absolute inset-0 animate-spin-slow">
            <span className="text-8xl">{useAI ? '🤖' : '🔥'}</span>
          </div>
          <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-xl animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold text-yellow-400 mb-2">
          {useAI ? 'AI 思考中...' : '嗆人中...'}
        </h2>
        <p className="text-red-300">正在生成讓親戚閉嘴的神回覆</p>
        <div className="flex justify-center gap-2 mt-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
      </div>
    </div>
  );

  const ResultPage = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-6 relative">
      {showFireworks && <Fireworks />}
      <div className="max-w-md w-full">
        <div ref={resultCardRef} className="bg-gradient-to-br from-red-800 via-red-900 to-red-950 rounded-3xl p-6 shadow-2xl border-4 border-yellow-500/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-16 h-16"><div className="absolute top-2 left-2 text-2xl">🔥</div></div>
          <div className="absolute top-0 right-0 w-16 h-16"><div className="absolute top-2 right-2 text-2xl">🔥</div></div>

          <div className="text-center mb-6 pt-4">
            <span className="text-sm text-yellow-500/80 tracking-widest">
              {useAI ? '🤖 AI 神回覆 🤖' : '💥 過年神回覆 💥'}
            </span>
          </div>

          <div className="bg-red-950/50 rounded-2xl p-4 mb-4 border border-red-700/50">
            <p className="text-red-400 text-sm mb-1">👵 親戚問：</p>
            <p className="text-red-100 text-lg font-medium">「{selectedQuestion?.question || customQuestion}」</p>
          </div>

          <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-2xl p-4 mb-4 border-2 border-yellow-500/30">
            <p className="text-yellow-400 text-sm mb-1 flex items-center gap-1">
              <span>{selectedStyle?.emoji}</span><span>{selectedStyle?.name}：</span>
            </p>
            <p className="text-yellow-100 text-xl font-bold leading-relaxed">「{generatedReply}」</p>
          </div>

          <div className="text-center py-3 border-t border-red-700/50">
            <p className="text-red-300 text-sm mb-1">嗆完還是要祝福一下 🧧</p>
            <p className="text-yellow-400 font-bold text-lg">{luckyPhrase}</p>
          </div>

          <div className="text-center mt-4 pt-4 border-t border-red-700/30">
            <p className="text-red-500/60 text-xs">親戚回嘴產生器 by {CREATOR_INFO.studio}</p>
            <p className="text-red-600/40 text-xs mt-1">Threads {CREATOR_INFO.threads}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-6">
          <div className="flex gap-3">
            <button onClick={restart}
              className="flex-1 py-3 px-4 bg-red-800/80 text-red-100 font-bold rounded-xl border border-red-700 hover:bg-red-700/80 transition-colors text-sm">
              🔄 換題目
            </button>
            <button onClick={reroll}
              className="flex-1 py-3 px-4 bg-red-800/80 text-red-100 font-bold rounded-xl border border-red-700 hover:bg-red-700/80 transition-colors text-sm">
              🎲 再嗆一次
            </button>
            <button onClick={handleShare}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-red-900 font-bold rounded-xl hover:shadow-yellow-500/50 hover:shadow-lg transition-all text-sm flex items-center justify-center gap-1">
              <span>📸</span> 分享
            </button>
          </div>
          <button
            onClick={() => window.open('https://portaly.cc/zn.studio/support', '_blank')}
            className="w-full py-3 bg-red-900/50 border border-yellow-500/30 text-yellow-400 rounded-xl hover:bg-red-900/80 transition-colors text-sm font-bold flex items-center justify-center gap-2"
          >
            <span>🧧</span> 過年求生不易，賞個紅包支持開發者！
          </button>
        </div>

        {!isUnlocked && useAI && (
          <p className="text-center text-yellow-400/60 text-xs mt-3">
            🤖 AI 剩餘 {getRemainingAICount()} 次 · <button onClick={() => setShowDonateModal(true)} className="underline">解鎖無限</button>
          </p>
        )}

        <p className="text-center text-red-400/60 text-sm mt-4">💡 截圖分享到 Threads / LINE 讓朋友也學起來！</p>

        <Footer showAbout={true} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-800 via-red-900 to-red-950 text-white"
      style={{ fontFamily: "'Noto Sans TC', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700;900&family=Noto+Serif+TC:wght@700;900&display=swap');
        @keyframes float { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(100vh) rotate(360deg); } }
        @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes firework { 0% { transform: scale(0) translateY(0); opacity: 1; } 50% { transform: scale(1.5) translateY(-20px); opacity: 1; } 100% { transform: scale(0) translateY(-40px); opacity: 0; } }
        .animate-float { animation: float 15s linear infinite; }
        .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 3s linear infinite; }
        .animate-firework { animation: firework 2s ease-out infinite; }
      `}</style>

      {showDonateModal && <DonateModal />}
      {showAboutModal && <AboutModal />}
      {currentView === 'home' && <HomePage />}
      {currentView === 'select' && <SelectPage />}
      {currentView === 'generating' && <GeneratingPage />}
      {currentView === 'result' && <ResultPage />}
    </div>
  );
}
