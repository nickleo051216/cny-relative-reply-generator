import React, { useState, useEffect } from 'react';

// 創作者資訊
const CREATOR_INFO = {
  name: "Nick Chang",
  studio: "ZN Studio",
  threads: "@nickai216",
  threadsUrl: "https://www.threads.net/@nickai216",
  line: "@znstudio",
  lineUrl: "https://lin.ee/yourlinelink", // 請替換成實際 LINE 連結
  website: "https://portaly.cc/zn.studio",
  email: "nickleo051216@gmail.com",
  phone: "0932-684-051",
};

// 預設親戚問題
const RELATIVE_QUESTIONS = [
  { id: 1, question: "什麼時候結婚啊？", icon: "💍", category: "感情" },
  { id: 2, question: "有對象了沒？", icon: "❤️", category: "感情" },
  { id: 3, question: "年薪多少啊？", icon: "💰", category: "工作" },
  { id: 4, question: "什麼時候生小孩？", icon: "👶", category: "家庭" },
  { id: 5, question: "怎麼還不買房？", icon: "🏠", category: "財務" },
  { id: 6, question: "隔壁小孩都當主管了...", icon: "📈", category: "比較" },
  { id: 7, question: "怎麼又胖了？", icon: "⚖️", category: "外貌" },
  { id: 8, question: "讀這個科系能幹嘛？", icon: "📚", category: "學業" },
  { id: 9, question: "一個月存多少錢？", icon: "🏦", category: "財務" },
  { id: 10, question: "打算什麼時候換工作？", icon: "💼", category: "工作" },
  { id: 11, question: "怎麼還在租房子？", icon: "🔑", category: "財務" },
  { id: 12, question: "二胎什麼時候生？", icon: "👨‍👩‍👧‍👦", category: "家庭" },
  { id: 13, question: "你這樣下去怎麼辦？", icon: "😰", category: "人生" },
  { id: 14, question: "怎麼穿這樣就來了？", icon: "👔", category: "外貌" },
  { id: 15, question: "交的男/女朋友條件好嗎？", icon: "🔍", category: "感情" },
];

// 回嘴風格
const REPLY_STYLES = [
  { id: "savage", name: "機車嗆爆", emoji: "🔥", desc: "直接開嗆，讓親戚閉嘴" },
  { id: "sharp", name: "犀利反擊", emoji: "⚔️", desc: "一針見血，反將一軍" },
  { id: "funny", name: "幽默諷刺", emoji: "🤡", desc: "笑著讓對方吃癟" },
  { id: "gentle", name: "溫柔刀", emoji: "🗡️", desc: "笑裡藏刀，殺人不見血" },
];

// 預設回覆
const PRESET_REPLIES = {
  "什麼時候結婚啊？": {
    savage: "等你離婚我再結，這樣比較有經驗可以請教",
    sharp: "您這麼關心，要不要順便贊助婚禮費用？",
    funny: "我在等一個敢問我年薪的人，這樣門當戶對",
    gentle: "我想等您的小孩結完再說，不然搶了風頭多不好意思"
  },
  "有對象了沒？": {
    savage: "有啊，但條件太好了，怕帶回來你們會自卑",
    sharp: "有，而且比您當年嫁的好多了",
    funny: "有！我跟錢在交往，但它總是離開我",
    gentle: "還在挑，畢竟不想跟阿姨當年一樣將就嘛～"
  },
  "年薪多少啊？": {
    savage: "比你家小孩多，但我怕說出來傷感情",
    sharp: "這麼八卦，是國稅局派來的嗎？",
    funny: "說了你也不會給我加薪啊",
    gentle: "不太好意思說，怕讓您覺得您當年選錯行業"
  },
  "什麼時候生小孩？": {
    savage: "等你願意幫忙帶+出錢養，我馬上生",
    sharp: "您孫子都還沒著落，管到別人家來了？",
    funny: "我家貓都還沒生，輪不到我",
    gentle: "等我養得起婆婆媽媽們的期待再說～"
  },
  "怎麼還不買房？": {
    savage: "你要送嗎？說啊",
    sharp: "房價這麼高，不然您先幫出頭期款？",
    funny: "因為我想住帝寶，還在存第一坪的錢",
    gentle: "等您家那間傳給我的時候囉～開玩笑的啦"
  },
  "隔壁小孩都當主管了...": {
    savage: "那你怎麼不去當他媽？",
    sharp: "喔是喔，那他包給您多少紅包？",
    funny: "可是他沒有我這麼會吃年夜飯",
    gentle: "對呀，聽說工時很長呢，我比較惜命"
  },
  "怎麼又胖了？": {
    savage: "你臉皮比我肥肉還厚，怎麼不先擔心一下？",
    sharp: "至少我胖得起，有些人想胖還沒錢吃",
    funny: "因為我把你的份也吃了，不客氣",
    gentle: "都是您廚藝太好的錯，我控制不住"
  },
  "讀這個科系能幹嘛？": {
    savage: "至少能聽懂你在講什麼廢話",
    sharp: "能幹嘛？能不用靠關係找工作",
    funny: "能坐在這裡聽你問這種問題",
    gentle: "您當年讀什麼來著？好像也沒多厲害齁"
  },
  "一個月存多少錢？": {
    savage: "比你家那位廢物多，滿意嗎？",
    sharp: "您是要借錢嗎？不借喔",
    funny: "存很多啊，都存在別人的銀行帳戶裡",
    gentle: "應該比您女兒/兒子多一點點啦，但我不好意思說"
  },
  "打算什麼時候換工作？": {
    savage: "打算什麼時候換個問題？",
    sharp: "您有更好的要介紹嗎？沒有的話就安靜",
    funny: "等我中樂透就換成不工作",
    gentle: "等您家公司開出好條件挖我的時候"
  },
  "怎麼還在租房子？": {
    savage: "因為還沒有人死掉留房子給我啊",
    sharp: "您要送嗎？送我就不租了",
    funny: "因為房東比房貸便宜，我數學還可以",
    gentle: "對啊，不像您當年有長輩幫忙買，我只能靠自己"
  },
  "二胎什麼時候生？": {
    savage: "你家多的房間借我住+幫忙帶就生",
    sharp: "一胎都養不起了，您要贊助嗎？",
    funny: "等老大會自己換尿布再說",
    gentle: "等我忘記生第一胎有多痛再考慮"
  },
  "你這樣下去怎麼辦？": {
    savage: "關你屁事",
    sharp: "怎麼辦？就繼續過得比你家小孩好啊",
    funny: "就這樣下去啊，不然要上去嗎？",
    gentle: "謝謝關心，但我活得比你想像的好很多"
  },
  "怎麼穿這樣就來了？": {
    savage: "來你家又不是走紅毯，穿什麼都浪費",
    sharp: "因為好看的衣服留著重要場合穿",
    funny: "因為我怕穿太好被親戚借錢",
    gentle: "喔對欸，早知道應該穿正式一點，像去靈堂那樣"
  },
  "交的男/女朋友條件好嗎？": {
    savage: "比你當年嫁的好一萬倍",
    sharp: "好不好我自己知道就好，不用經過您審核",
    funny: "對象是人就好，條件是活的就行",
    gentle: "還可以，至少不會到處問別人八卦"
  },
};

// 超豐富吉祥話庫
const LUCKY_PHRASES = {
  classic: [
    "恭喜發財，紅包拿來！🧧",
    "新年快樂，萬事如意！✨",
    "龍馬精神，步步高升！🐉",
    "心想事成，美夢成真！💫",
    "財源廣進，金玉滿堂！💰",
    "吉祥如意，福星高照！⭐",
    "年年有餘，歲歲平安！🐟",
    "闔家歡樂，幸福美滿！👨‍👩‍👧‍👦",
  ],
  money: [
    "數錢數到手抽筋！💵",
    "鈔票多到沒地方放！🤑",
    "存款突破七位數！📈",
    "年終獎金翻三倍！🎰",
    "買房不用看價錢！🏠",
    "錢包永遠塞不下！👛",
    "投資全部都賺錢！📊",
    "老闆主動幫你加薪！💼",
    "中樂透頭獎！🎫",
    "財富自由達成！🏆",
  ],
  funny: [
    "新的一年，親戚少一點！😇",
    "過年體重不要增加！⚖️",
    "親戚的嘴閉緊一點！🤐",
    "今年不用回答蠢問題！🙉",
    "紅包收到手軟！🧧",
    "年假多放幾天！🏖️",
    "塞車的不是我！🚗",
    "搶到高鐵票！🚄",
    "麻將場場自摸！🀄",
    "刮刮樂每張都中！🎰",
    "吃再多都不會胖！🍖",
    "今年不被催婚！💒",
    "薪水跟體重一樣會漲！📈",
  ],
  career: [
    "升官發財，前途無量！👔",
    "事業有成，名利雙收！🏅",
    "貴人相助，小人退散！🛡️",
    "跳槽加薪，offer拿到手軟！📄",
    "老闆看你越來越順眼！👁️",
    "會議都準時結束！⏰",
    "專案一次過！✅",
    "不用加班！🎉",
  ],
  love: [
    "脫單成功！💕",
    "遇到對的人！💑",
    "感情順利，甜甜蜜蜜！🍯",
    "桃花朵朵開！🌸",
    "前任過得沒你好！😌",
    "曖昧對象主動告白！💌",
  ],
  health: [
    "身體健康，百病不侵！💪",
    "吃嘛嘛香，睡嘛嘛好！😴",
    "體檢報告全綠燈！🟢",
    "熬夜也不會爆肝！🌙",
    "腰不酸、腿不痛！🦵",
  ],
  horse2026: [
    "馬到成功，好運連連！🐎",
    "金馬獻瑞，吉祥如意！🐎✨",
    "龍馬精神，福氣滿滿！🐎🧧",
    "馬年大吉，心想事成！🐎💫",
    "馬躍新春，萬事亨通！🐎🎊",
    "天馬送福，財運亨通！🐎💰"
],
};

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

  useEffect(() => {
    setAiUsage(getAIUsage());
    setIsUnlocked(isAIUnlocked());
  }, []);

  const canUseAI = () => isUnlocked || aiUsage.count < AI_DAILY_LIMIT;
  const getRemainingAICount = () => Math.max(0, AI_DAILY_LIMIT - aiUsage.count);

  const handleDonate = () => {
    // 這裡可以串接實際金流
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
    const shouldUseAI = useAI && canUseAI();
    const presetReply = PRESET_REPLIES[question]?.[selectedStyle.id];
    
    if (shouldUseAI && (!presetReply || customQuestion)) {
      if (!isUnlocked) {
        incrementAIUsage();
        setAiUsage(getAIUsage());
      }
      
      try {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 300,
            messages: [{
              role: "user",
              content: `你是一個過年回嘴產生器。親戚問了這個問題：「${question}」
請用「${selectedStyle.name}」的風格回覆。
風格要求：
${selectedStyle.id === 'savage' ? '- 直接嗆回去，不留情面\n- 可以機車、酸人\n- 不用髒話' : ''}
${selectedStyle.id === 'sharp' ? '- 犀利反擊，把問題丟回給對方' : ''}
${selectedStyle.id === 'funny' ? '- 幽默諷刺，讓人笑完才發現被酸' : ''}
${selectedStyle.id === 'gentle' ? '- 笑裡藏刀，表面溫和但暗藏殺機' : ''}
要求：25字以內，台灣人會說的話，夠嗆。只回覆一句話。`
            }]
          })
        });
        const data = await response.json();
        setGeneratedReply(data.content?.[0]?.text || "你很煩欸，可以不要問嗎");
      } catch (error) {
        const fallbackReplies = {
          savage: ["關你屁事", "你很閒齁", "管好自己吧"],
          sharp: ["你先回答我好了", "這問題很重要嗎"],
          funny: ["我聽不懂你在說什麼耶", "這題我選擇跳過"],
          gentle: ["謝謝關心，但您更需要被關心", "您辛苦了"]
        };
        const replies = fallbackReplies[selectedStyle.id] || fallbackReplies.savage;
        setGeneratedReply(replies[Math.floor(Math.random() * replies.length)]);
      }
    } else if (presetReply) {
      await new Promise(resolve => setTimeout(resolve, 1200));
      setGeneratedReply(presetReply);
    } else {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const genericReplies = {
        savage: ["你管太多了吧", "這關你什麼事", "有事嗎"],
        sharp: ["那您呢", "您先回答好了", "這問題問你自己"],
        funny: ["蛤？", "我聽不懂耶", "下一題"],
        gentle: ["謝謝關心呢", "您真的很關心我", "我會加油的"]
      };
      const replies = genericReplies[selectedStyle.id];
      setGeneratedReply(replies[Math.floor(Math.random() * replies.length)]);
    }
    
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
    if (useAI && !canUseAI()) {
      setShowDonateModal(true);
      return;
    }
    
    setCurrentView('generating');
    setIsLoading(true);
    const question = selectedQuestion?.question || customQuestion;
    const questionCategory = selectedQuestion?.category || "人生";
    
    if (useAI && canUseAI()) {
      if (!isUnlocked) {
        incrementAIUsage();
        setAiUsage(getAIUsage());
      }
      
      try {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 300,
            messages: [{
              role: "user",
              content: `過年回嘴產生器。親戚問：「${question}」
用「${selectedStyle.name}」風格，之前回覆是「${generatedReply}」，給一個完全不一樣的新回覆。
要求：25字以內，台灣人會說的話，夠嗆夠直接。只回覆一句話。`
            }]
          })
        });
        const data = await response.json();
        setGeneratedReply(data.content?.[0]?.text || generatedReply);
      } catch (error) {
        const altReplies = {
          savage: ["你管太多了吧", "這關你什麼事", "你是我媽嗎"],
          sharp: ["那您呢", "問這個是要幹嘛"],
          funny: ["我選擇死亡", "下一題謝謝"],
          gentle: ["您真的很關心我呢", "謝謝您的關心"]
        };
        const replies = altReplies[selectedStyle.id] || altReplies.savage;
        setGeneratedReply(replies[Math.floor(Math.random() * replies.length)]);
      }
    } else {
      await new Promise(resolve => setTimeout(resolve, 800));
      const allReplies = Object.values(PRESET_REPLIES)
        .map(r => r[selectedStyle.id])
        .filter(Boolean);
      const randomReply = allReplies[Math.floor(Math.random() * allReplies.length)];
      setGeneratedReply(randomReply || generatedReply);
    }
    
    setLuckyPhrase(getMatchedLuckyPhrase(questionCategory));
    setIsLoading(false);
    setCurrentView('result');
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
            <span>請我喝杯咖啡 $$ </span>
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
          
          <div className="mb-6 p-3 bg-red-950/50 rounded-xl border border-red-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🤖</span>
                <span className="text-red-200 text-sm">AI 回覆額度</span>
              </div>
              {isUnlocked ? (
                <span className="text-green-400 text-sm font-bold">♾️ 無限</span>
              ) : (
                <span className="text-yellow-400 text-sm font-bold">{getRemainingAICount()}/{AI_DAILY_LIMIT} 次</span>
              )}
            </div>
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
                className={`p-4 rounded-xl text-left transition-all duration-300 border-2 ${
                  selectedQuestion?.id === q.id
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
                className={`p-4 rounded-xl text-center transition-all duration-300 border-2 ${
                  selectedStyle?.id === style.id
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
                  {isUnlocked ? '已解鎖無限使用' : `今日剩餘 ${getRemainingAICount()} 次`}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                if (!useAI && !canUseAI()) {
                  setShowDonateModal(true);
                } else {
                  setUseAI(!useAI);
                }
              }}
              className={`w-14 h-8 rounded-full transition-all duration-300 ${
                useAI ? 'bg-green-500' : 'bg-red-700'
              }`}
            >
              <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-all duration-300 ${
                useAI ? 'translate-x-7' : 'translate-x-1'
              }`} />
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
          className={`w-full py-4 px-8 font-bold text-xl rounded-2xl shadow-lg transform transition-all duration-300 ${
            (selectedQuestion || customQuestion) && selectedStyle
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
        <div className="bg-gradient-to-br from-red-800 via-red-900 to-red-950 rounded-3xl p-6 shadow-2xl border-4 border-yellow-500/50 relative overflow-hidden">
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
        
        <div className="flex gap-3 mt-6">
          <button onClick={restart}
            className="flex-1 py-3 px-4 bg-red-800/80 text-red-100 font-bold rounded-xl border border-red-700 hover:bg-red-700/80 transition-colors text-sm">
            🔄 換題目
          </button>
          <button onClick={reroll}
            className="flex-1 py-3 px-4 bg-red-800/80 text-red-100 font-bold rounded-xl border border-red-700 hover:bg-red-700/80 transition-colors text-sm">
            🎲 再嗆一次
          </button>
          <button onClick={() => {
            const text = `親戚問：「${selectedQuestion?.question || customQuestion}」\n\n${selectedStyle?.emoji} ${selectedStyle?.name}回覆：\n「${generatedReply}」\n\n${luckyPhrase}\n\n#過年神回覆 #親戚回嘴產生器\n\n🔗 by ${CREATOR_INFO.studio}\n${CREATOR_INFO.website}`;
            navigator.clipboard.writeText(text);
            alert('已複製！快去分享吧 🔥');
          }}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-red-900 font-bold rounded-xl hover:shadow-yellow-500/50 hover:shadow-lg transition-all text-sm">
            📋 複製
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
