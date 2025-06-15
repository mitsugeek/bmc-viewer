// src/App.jsx
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams, Link } from 'react-router-dom';
import { Search, ArrowLeft, FileText } from 'lucide-react';


// ユーティリティ関数
const parseMarkdown = (markdown) => {
  return markdown
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mb-3">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    .replace(/^- (.*$)/gim, '<li class="ml-4 list-disc">$1</li>')
    .replace(/\n\n/g, '</p><p class="mb-2">')
    .replace(/^(?!<[h|l])/gm, '<p class="mb-2">')
    .replace(/<\/p><p class="mb-2">(<[h|l])/g, '$1');
};

const parseFrontmatter = (content) => {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  
  if (!match) return { metadata: {}, content };
  
  const frontmatter = match[1];
  const body = match[2];
  
  const metadata = {};
  frontmatter.split('\n').forEach(line => {
    const [key, ...values] = line.split(':');
    if (key && values.length) {
      metadata[key.trim()] = values.join(':').trim();
    }
  });
  
  return { metadata, content: body };
};

const extractBMCSections = (content) => {
  const sections = [
    'Key Partners',
    'Key Activities', 
    'Key Resources',
    'Value Propositions',
    'Customer Relationships',
    'Channels',
    'Customer Segments',
    'Cost Structure',
    'Revenue Streams'
  ];
  
  const bmcData = {};
  
  sections.forEach(section => {
    const regex = new RegExp(`## ${section}\\s*([\\s\\S]*?)(?=## |$)`, 'i');
    const match = content.match(regex);
    bmcData[section] = match ? match[1].trim() : '';
  });
  
  return bmcData;
};

// BMC日本語対訳とツールチップ情報
const BMC_TRANSLATIONS = {
  'Key Partners': {
    japanese: '主要パートナー',
    description: 'ビジネスを支える重要なパートナー企業や組織',
    examples: 'サプライヤー、販売代理店、技術パートナーなど'
  },
  'Key Activities': {
    japanese: '主要活動',
    description: 'ビジネスを機能させるために必要な重要な活動',
    examples: '製造、マーケティング、研究開発、販売など'
  },
  'Key Resources': {
    japanese: '主要リソース',
    description: 'ビジネスに不可欠な重要な資源',
    examples: '人材、技術、設備、ブランド、資金など'
  },
  'Value Propositions': {
    japanese: '価値提案',
    description: '顧客に提供する独自の価値や解決策',
    examples: '品質、利便性、コスト削減、革新性など'
  },
  'Customer Relationships': {
    japanese: '顧客との関係',
    description: '顧客との関係を構築・維持するための仕組み',
    examples: '個人サポート、コミュニティ、自動化サービスなど'
  },
  'Channels': {
    japanese: 'チャネル',
    description: '顧客に価値を届けるための経路',
    examples: '店舗、オンライン、代理店、直販など'
  },
  'Customer Segments': {
    japanese: '顧客セグメント',
    description: 'ターゲットとする顧客の種類や分類',
    examples: '個人消費者、企業、特定の業界、年齢層など'
  },
  'Cost Structure': {
    japanese: 'コスト構造',
    description: 'ビジネス運営に必要な主要コスト',
    examples: '人件費、原材料費、設備費、マーケティング費など'
  },
  'Revenue Streams': {
    japanese: '収益の流れ',
    description: '収益を生み出す方法や仕組み',
    examples: '商品販売、サービス料、ライセンス料、広告収入など'
  }
};

// 業種別カラーパレット
const INDUSTRY_COLORS = {
  "自動車・輸送機器": {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    accent: "bg-blue-100",
    icon: "🚗"
  },
  "食料品": {
    bg: "bg-orange-50",
    border: "border-orange-200", 
    text: "text-orange-700",
    accent: "bg-orange-100",
    icon: "🍎"
  },
  "情報・通信業": {
    bg: "bg-purple-50",
    border: "border-purple-200",
    text: "text-purple-700", 
    accent: "bg-purple-100",
    icon: "📡"
  },
  "電気機器": {
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-700",
    accent: "bg-green-100", 
    icon: "⚡"
  },
  "銀行業": {
    bg: "bg-gray-50",
    border: "border-gray-200",
    text: "text-gray-700",
    accent: "bg-gray-100",
    icon: "🏦"
  },
  "卸売業": {
    bg: "bg-yellow-50", 
    border: "border-yellow-200",
    text: "text-yellow-700",
    accent: "bg-yellow-100",
    icon: "📦"
  },
  "製薬": {
    bg: "bg-red-50",
    border: "border-red-200", 
    text: "text-red-700",
    accent: "bg-red-100",
    icon: "💊"
  },
  "小売業": {
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    text: "text-indigo-700",
    accent: "bg-indigo-100",
    icon: "🛒"
  },
  "建設業": {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    accent: "bg-amber-100",
    icon: "🏗️"
  },
  "その他": {
    bg: "bg-slate-50",
    border: "border-slate-200",
    text: "text-slate-700", 
    accent: "bg-slate-100",
    icon: "🏢"
  }
};

// 業種カラーを取得する関数
const getIndustryColor = (industry) => {
  return INDUSTRY_COLORS[industry] || INDUSTRY_COLORS["その他"];
};

// 検索コンポーネント
const SearchComponent = ({ companies, onCompanySelect }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // シンプルな検索機能
  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    
    const lowerQuery = query.toLowerCase();
    return companies.filter(company => 
      company.name.toLowerCase().includes(lowerQuery) ||
      company.code.includes(query) ||
      company.name_kana.includes(lowerQuery) ||
      company.name_en.toLowerCase().includes(lowerQuery) ||
      (company.industry && company.industry.toLowerCase().includes(lowerQuery))
    ).slice(0, 5);
  }, [companies, query]);

  const handleSelect = (company) => {
    setQuery('');
    setIsOpen(false);
    if (onCompanySelect) onCompanySelect(company);
    navigate(`/company/${company.code}`);
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="企業名・証券コード・業種で検索..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        />
      </div>
      
      {isOpen && query && searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          {searchResults.map((company) => {
            const colors = company.industry ? getIndustryColor(company.industry) : getIndustryColor("その他");
            return (
              <button
                key={company.code}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                onClick={() => handleSelect(company)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{company.name}</div>
                    <div className="text-sm text-gray-500">
                      {company.code} | {company.name_en}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {company.industry && (
                      <span className={`text-xs px-2 py-1 rounded-full ${colors.accent} ${colors.text}`}>
                        {company.industry}
                      </span>
                    )}
                    <span className="text-lg">{colors.icon}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// 業種フィルターコンポーネント
const IndustryFilter = ({ companies, selectedIndustry, onIndustryChange }) => {
  const industries = [...new Set(companies.map(c => c.industry).filter(Boolean))].sort();
  
  if (industries.length === 0) return null;
  
  return (
    <div className="mb-6 bg-white rounded-lg shadow-sm border p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">業種で絞り込み</h3>
        {selectedIndustry && (
          <button
            onClick={() => onIndustryChange(null)}
            className="text-xs text-blue-600 hover:text-blue-800 underline flex items-center space-x-1"
          >
            <ArrowLeft className="h-3 w-3" />
            <span>フィルターをクリア</span>
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onIndustryChange(null)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            selectedIndustry === null 
              ? 'bg-blue-100 text-blue-700 border border-blue-200' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          すべて ({companies.length})
        </button>
        {industries.map(industry => {
          const count = companies.filter(c => c.industry === industry).length;
          const colors = getIndustryColor(industry);
          const isSelected = selectedIndustry === industry;
          return (
            <button
              key={industry}
              onClick={() => onIndustryChange(isSelected ? null : industry)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center space-x-1 ${
                isSelected
                  ? `${colors.accent} ${colors.text} border ${colors.border} ring-2 ring-blue-200` 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>{colors.icon}</span>
              <span>{industry} ({count})</span>
              {isSelected && (
                <span className="ml-1 text-xs">✕</span>
              )}
            </button>
          );
        })}
      </div>
      {selectedIndustry && (
        <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-700">
          <span className="font-medium">{getIndustryColor(selectedIndustry).icon} {selectedIndustry}</span> の企業のみ表示中
        </div>
      )}
    </div>
  );
};

// 業種別企業カードコンポーネント
const CompanyCard = ({ company }) => {
  const colors = company.industry ? getIndustryColor(company.industry) : getIndustryColor("その他");
  
  return (
    <Link
      to={`/company/${company.code}`}
      className={`p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border text-left block transform hover:-translate-y-1 ${colors.bg} ${colors.border}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="font-semibold text-gray-900 flex-1">
          {company.name}
        </div>
        <span className="text-lg ml-2 flex-shrink-0">
          {colors.icon}
        </span>
      </div>
      
      <div className="space-y-1">
        <div className="text-sm text-gray-500">
          {company.code}
        </div>
        {company.industry && (
          <div className={`text-xs font-medium px-2 py-1 rounded-full inline-block ${colors.accent} ${colors.text}`}>
            {company.industry}
          </div>
        )}
        <div className="text-xs text-gray-400 mt-1">
          {company.name_en}
        </div>
      </div>
    </Link>
  );
};

// シンプルなBMCブロックコンポーネント
const SimpleBMCBlock = ({ title, content, className = "", colorScheme = "default" }) => {
  const translation = BMC_TRANSLATIONS[title];
  const htmlContent = parseMarkdown(content);

  const colorClasses = {
    default: "bg-white border-gray-200",
    yellow: "bg-yellow-50 border-yellow-200 border-2",
    red: "bg-red-50 border-red-200",
    green: "bg-green-50 border-green-200"
  };

  return (
    <div className={`rounded-lg shadow-md border flex flex-col ${colorClasses[colorScheme]} ${className}`}>
      {/* タイトル部分 */}
      <div className="p-6 pb-4">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {title}
        </h3>
        {translation && (
          <div className="text-sm text-blue-600 font-medium mb-1">
            {translation.japanese}
          </div>
        )}
        {translation && (
          <div className="text-xs text-gray-500 mb-4">
            {translation.description}
          </div>
        )}
        
        {/* 例の表示 */}
        {translation && (
          <div className="text-xs text-gray-600 mb-4 p-3 bg-blue-50 rounded border border-blue-100">
            <span className="font-medium">例:</span> {translation.examples}
          </div>
        )}
      </div>
      
      {/* コンテンツ部分 */}
      <div className="px-6 pb-6 flex-grow">
        <div 
          className="text-sm text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>
    </div>
  );
};

// 固定幅スクロール対応のBMC表示コンポーネント
const BMCCanvas = ({ bmcData }) => {
  const { sections } = bmcData;
  const [showZoomHint, setShowZoomHint] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [topRowHeight, setTopRowHeight] = useState(420); // 初期値
  const topRowRef = useRef(null);
  const containerRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [showZoomControls, setShowZoomControls] = useState(false);



  // モバイル判定
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth < 768;
      setIsMobile(isMobileDevice);
      setShowZoomControls(isMobileDevice); // モバイルの場合のみコントロール表示
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);


  // ズームコントロールコンポーネント
  const ZoomControls = () => {
    if (!showZoomControls) return null;
    
    return (
      <div className="fixed bottom-20 right-4 flex flex-col space-y-2 z-50 bg-white rounded-lg shadow-lg p-2">
        <button 
          onClick={() => setZoom(prev => Math.min(prev + 0.3, 3))}
          className="bg-blue-600 text-white p-3 rounded-full shadow-md hover:bg-blue-700 transition-colors"
          aria-label="拡大"
        >
          <span className="text-lg font-bold">+</span>
        </button>
        <button 
          onClick={() => setZoom(prev => Math.max(prev - 0.3, 0.5))}
          className="bg-blue-600 text-white p-3 rounded-full shadow-md hover:bg-blue-700 transition-colors"
          aria-label="縮小"
        >
          <span className="text-lg font-bold">−</span>
        </button>
        <button 
          onClick={() => setZoom(1)}
          className="bg-gray-600 text-white p-2 rounded-full shadow-md hover:bg-gray-700 transition-colors text-xs"
          aria-label="リセット"
        >
          1:1
        </button>
        <div className="text-xs text-center text-gray-600 bg-white rounded px-2 py-1">
          {Math.round(zoom * 100)}%
        </div>
      </div>
    );
  };

  // 上部行の高さを測定して下部ブロックの位置を調整
  const measureTopRowHeight = useCallback(() => {
    if (topRowRef.current) {
      const rect = topRowRef.current.getBoundingClientRect();
      const newHeight = Math.max(420, rect.height); // 最小420px
      setTopRowHeight(newHeight);
      
      // コンテナ全体の高さも調整
      if (containerRef.current) {
        const totalHeight = newHeight + 240 + 48 + 24; // 上部 + 下部 + 間隔 + パディング
        containerRef.current.style.minHeight = `${totalHeight}px`;
      }
    }
  }, []);

  // ResizeObserverで上部ブロックの高さ変化を監視
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      setTimeout(measureTopRowHeight, 100); // 少し遅延させて確実に測定
    });

    if (topRowRef.current) {
      resizeObserver.observe(topRowRef.current);
    }

    // 初回測定
    setTimeout(measureTopRowHeight, 200);

    return () => {
      resizeObserver.disconnect();
    };
  }, [measureTopRowHeight, sections]);

  // ヒント非表示タイマー
  useEffect(() => {
    if (isMobile && showZoomHint) {
      const timer = setTimeout(() => {
        setShowZoomHint(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [isMobile, showZoomHint]);

  // ズームヒントコンポーネント
  const ZoomHint = () => {
    if (!isMobile || !showZoomHint) return null;

    return (
      <div className="fixed top-20 left-4 right-4 bg-blue-600 text-white p-3 rounded-lg shadow-lg z-50 animate-bounce">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">👆</span>
            <div>
              <div className="font-semibold text-sm">ピンチでズーム・ドラッグでスクロール</div>
              <div className="text-xs opacity-90">BMC全体を自由に拡大縮小して確認できます</div>
            </div>
          </div>
          <button 
            onClick={() => setShowZoomHint(false)}
            className="text-white hover:text-gray-200 text-xl"
          >
            ×
          </button>
        </div>
      </div>
    );
  };

  // BMCの基本情報表示（スマホ用）
  const BMCOverview = () => {
    if (!isMobile) return null;

    return (
      <div className="mb-4 bg-white rounded-lg shadow-sm border p-4">
        <h3 className="font-semibold text-gray-800 mb-2">📊 ビジネスモデルキャンバス</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <div>• 黄色：<span className="font-medium">価値提案</span>（中央の重要な部分）</div>
          <div>• 赤色：<span className="font-medium">コスト構造</span>（下部左）</div>
          <div>• 緑色：<span className="font-medium">収益の流れ</span>（下部右）</div>
          <div className="text-xs text-gray-500 mt-2">
            💡 ピンチズームで拡大して各ブロックの内容を確認できます
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <ZoomHint />
      <BMCOverview />
      <ZoomControls />
      
      {/* 固定幅BMC表示エリア */}
      <div className="w-full overflow-auto bg-gray-100 rounded-lg border-2 border-gray-300" 
           style={{ 
             height: isMobile ? '70vh' : 'auto',
             WebkitOverflowScrolling: 'touch',
             touchAction: 'pan-x pan-y pinch-zoom',
             overscrollBehavior: 'contain'
           }}>
        
        {/* 動的サイズのBMCコンテナ */}
        <div 
          ref={containerRef}
          className="relative bg-white" 
          style={{ 
            width: '1400px', 
            minHeight: '900px', 
            padding: '24px',
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
            transition: 'transform 0.2s ease-out'
          }}
        >
          
          {/* BMC上部グリッド */}
          <div 
            ref={topRowRef}
            className="grid grid-cols-5 gap-6 mb-6" 
            style={{ minHeight: '420px' }}
          >
            
            {/* Key Partners */}
            <div className="col-span-1">
              <SimpleBMCBlock
                title="Key Partners"
                content={sections["Key Partners"]}
                className="h-full"
                colorScheme="default"
              />
            </div>
            
            {/* Key Activities & Key Resources */}
            <div className="col-span-1 flex flex-col gap-6">
              <div className="flex-1">
                <SimpleBMCBlock
                  title="Key Activities"
                  content={sections["Key Activities"]}
                  className="h-full"
                  colorScheme="default"
                />
              </div>
              <div className="flex-1">
                <SimpleBMCBlock
                  title="Key Resources"
                  content={sections["Key Resources"]}
                  className="h-full"
                  colorScheme="default"
                />
              </div>
            </div>
            
            {/* Value Propositions（中央・強調） */}
            <div className="col-span-1">
              <SimpleBMCBlock
                title="Value Propositions"
                content={sections["Value Propositions"]}
                className="h-full"
                colorScheme="yellow"
              />
            </div>
            
            {/* Customer Relationships & Channels */}
            <div className="col-span-1 flex flex-col gap-6">
              <div className="flex-1">
                <SimpleBMCBlock
                  title="Customer Relationships"
                  content={sections["Customer Relationships"]}
                  className="h-full"
                  colorScheme="default"
                />
              </div>
              <div className="flex-1">
                <SimpleBMCBlock
                  title="Channels"
                  content={sections["Channels"]}
                  className="h-full"
                  colorScheme="default"
                />
              </div>
            </div>
            
            {/* Customer Segments */}
            <div className="col-span-1">
              <SimpleBMCBlock
                title="Customer Segments"
                content={sections["Customer Segments"]}
                className="h-full"
                colorScheme="default"
              />
            </div>
          </div>
          
          {/* BMC下部グリッド（動的位置） */}
          <div 
            className="grid grid-cols-2 gap-6" 
            style={{ 
              height: '240px'
            }}
          >
            <div className="col-span-1">
              <SimpleBMCBlock
                title="Cost Structure"
                content={sections["Cost Structure"]}
                className="h-full"
                colorScheme="red"
              />
            </div>
            <div className="col-span-1">
              <SimpleBMCBlock
                title="Revenue Streams"
                content={sections["Revenue Streams"]}
                className="h-full"
                colorScheme="green"
              />
            </div>
          </div>
          
          {/* BMCグリッドライン（動的位置） */}
          <div className="absolute inset-0 pointer-events-none">
            {/* 垂直線 */}
            <div className="absolute left-1/5 top-6 w-px bg-gray-200 opacity-30" 
                 style={{ height: `${topRowHeight}px` }}></div>
            <div className="absolute left-2/5 top-6 w-px bg-gray-200 opacity-30" 
                 style={{ height: `${topRowHeight}px` }}></div>
            <div className="absolute left-3/5 top-6 w-px bg-gray-200 opacity-30" 
                 style={{ height: `${topRowHeight}px` }}></div>
            <div className="absolute left-4/5 top-6 w-px bg-gray-200 opacity-30" 
                 style={{ height: `${topRowHeight}px` }}></div>
            
            {/* 水平線（動的位置） */}
            <div className="absolute left-6 right-6 h-px bg-gray-200 opacity-30" 
                 style={{ top: `${topRowHeight + 48}px` }}></div>
          </div>
          
          {/* BMCタイトル（右下にウォーターマーク風） */}
          <div className="absolute bottom-6 right-6 text-gray-400 text-sm font-medium">
            Business Model Canvas
          </div>
        </div>
      </div>
      
      {/* 操作ガイド */}
      <div className="mt-4 text-center">
        {isMobile ? (
          <div className="text-sm text-gray-600 space-y-1">
            <div>📱 <span className="font-medium">ピンチズーム</span>で拡大・縮小</div>
            <div>👆 <span className="font-medium">ドラッグ</span>でスクロールして全体を確認</div>
          </div>
        ) : (
          <div className="text-sm text-gray-600">
            🖱️ <span className="font-medium">マウスホイール</span>でスクロールしてBMC全体を確認
          </div>
        )}
      </div>
    </div>
  );
};

// ヘッダーコンポーネント
const Header = () => {
  const navigate = useNavigate();
  const params = useParams();
  const isCompanyPage = params.code;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <img 
              src="./bmc-favicon.svg" 
              alt="BMC Viewer" 
              className="h-8 w-8"
            />
            <h1 className="text-2xl font-bold text-gray-900">
              Business Model Canvas Viewer
            </h1>
          </Link>
          {isCompanyPage && (
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>検索に戻る</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

// 検索ページコンポーネント
const SearchPage = ({ companies }) => {
  const navigate = useNavigate();
  const [selectedIndustry, setSelectedIndustry] = useState(null);

  const handleCompanySelect = (company) => {
    navigate(`/company/${company.code}`);
  };

  // 業種でフィルタリングされた企業リスト
  const filteredCompanies = selectedIndustry 
    ? companies.filter(company => company.industry === selectedIndustry)
    : companies;

  // 業種別グループ化
  const companiesByIndustry = filteredCompanies.reduce((acc, company) => {
    const industry = company.industry || "その他";
    if (!acc[industry]) {
      acc[industry] = [];
    }
    acc[industry].push(company);
    return acc;
  }, {});

  if (companies.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-4">
          企業データを読み込んでいます...
        </div>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          企業を検索してBMCを表示
        </h2>
        <p className="text-gray-600 mb-8">
          TOPIX Core30企業のビジネスモデルキャンバスを閲覧できます
        </p>
      </div>
      
      <SearchComponent 
        companies={companies} 
        onCompanySelect={handleCompanySelect} 
      />
      
      {/* 企業一覧表示 */}
      {selectedIndustry ? (
        // 特定業種が選択されている場合
        <div className="space-y-6">
          <div className="text-left">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                <span className="mr-2">{getIndustryColor(selectedIndustry).icon}</span>
                {selectedIndustry} ({filteredCompanies.length}社)
              </h3>
              <button
                onClick={() => setSelectedIndustry(null)}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>すべて表示に戻る</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredCompanies.map((company) => (
                <CompanyCard key={company.code} company={company} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        // 全業種表示（業種別グループ表示）
        <div className="space-y-8">
          {Object.entries(companiesByIndustry)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([industry, industryCompanies]) => {
              const colors = getIndustryColor(industry);
              return (
                <div key={industry} className="text-left">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                      <span className="mr-2">{colors.icon}</span>
                      {industry} ({industryCompanies.length}社)
                    </h3>
                    <button
                      onClick={() => setSelectedIndustry(industry)}
                      className={`text-xs px-3 py-1 rounded-full transition-colors ${colors.accent} ${colors.text} hover:${colors.bg}`}
                    >
                      この業種のみ表示
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {industryCompanies.map((company) => (
                      <CompanyCard key={company.code} company={company} />
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      )}
      
      {filteredCompanies.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            該当する企業が見つかりませんでした
          </div>
          <button
            onClick={() => setSelectedIndustry(null)}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            フィルターをリセット
          </button>
        </div>
      )}
    </div>
  );
};

// 企業詳細ページコンポーネント
const CompanyPage = ({ companies }) => {
  const { code } = useParams();
  const [bmcData, setBmcData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 企業一覧から該当企業を検索
  const company = companies.find(c => c.code === code);

  useEffect(() => {
    const loadCompanyData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}companies/${code}.md`);
        if (!response.ok) {
          throw new Error('企業データが見つかりません');
        }
        
        const content = await response.text();
        const { metadata, content: body } = parseFrontmatter(content);
        const sections = extractBMCSections(body);
        
        // 企業名の優先順位: metadata.title > 企業一覧の名前 > フォールバック
        const title = metadata.title || (company ? company.name : `企業コード: ${code}`);
        
        setBmcData({
          title,
          code: metadata.code || code,
          company, // 企業情報も保存
          sections
        });
      } catch (err) {
        console.error('Error loading company data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (code) {
      loadCompanyData();
    }
  }, [code, company]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 py-12">
        <div className="mb-2">⚠️ {error}</div>
        <Link
          to="/"
          className="text-blue-600 hover:text-blue-800 underline"
        >
          検索に戻る
        </Link>
      </div>
    );
  }

  if (!bmcData) {
    return (
      <div className="text-center text-gray-500 py-12">
        データが見つかりません
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {bmcData.title}
        </h2>
        <div className="flex items-center space-x-4 text-gray-600">
          <span className="flex items-center space-x-1">
            <FileText className="h-4 w-4" />
            <span>証券コード: {bmcData.code}</span>
          </span>
          {bmcData.company && (
            <>
              <span className="text-sm">
                {bmcData.company.name_en}
              </span>
              {bmcData.company.industry && (
                <span className={`text-xs px-2 py-1 rounded-full ${getIndustryColor(bmcData.company.industry).accent} ${getIndustryColor(bmcData.company.industry).text}`}>
                  {getIndustryColor(bmcData.company.industry).icon} {bmcData.company.industry}
                </span>
              )}
            </>
          )}
        </div>
      </div>

      <BMCCanvas bmcData={bmcData} />
    </div>
  );
};

// メインアプリケーション
const AppContent = () => {
  const [companies, setCompanies] = useState([]);
  const [error, setError] = useState(null);

  // 企業データの読み込み
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const response = await fetch('./companies.json');
        if (!response.ok) {
          throw new Error('企業データの読み込みに失敗しました');
        }
        const data = await response.json();
        setCompanies(data);
      } catch (err) {
        console.error('Error loading companies:', err);
        setError(err.message);
      }
    };

    loadCompanies();
  }, []);

  if (error && companies.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">⚠️ エラーが発生しました</div>
          <div className="text-gray-600">{error}</div>
          <div className="text-sm text-gray-500 mt-2">
            companies.jsonファイルが見つかりません
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<SearchPage companies={companies} />} />
          <Route path="/company/:code" element={<CompanyPage companies={companies} />} />
        </Routes>
      </main>
    </div>
  );
};

// アプリのエントリーポイント
const App = () => {
  return (
      <AppContent />
  );
};

export default App;