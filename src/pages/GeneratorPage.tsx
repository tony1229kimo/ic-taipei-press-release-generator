import { useState, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Newspaper, Briefcase, Heart, Loader2, Copy, Check, RotateCcw, Download,
  Sparkles, ChevronRight, UserPlus, X, ChevronDown, ChevronUp, Layers
} from 'lucide-react';
import { streamGenerate, type GenerationInput, type MediaContact } from '@/api/client';

interface AngleGroup {
  group: string;
  section: string;
  icon: string;
  items: string[];
}

// All available angles, organized by section
const allAngleGroups: AngleGroup[] = [
  // 綜合新聞
  { group: '重大公告', section: '綜合新聞', icon: '📰', items: ['酒店開幕/揭幕', '品牌進駐/啟動', '重大投資/擴建', '策略合作簽約'] },
  { group: '人事與組織', section: '綜合新聞', icon: '👤', items: ['高層人事任命', '主廚到任/異動', '組織改組/新團隊'] },
  { group: '獎項與認證', section: '綜合新聞', icon: '🏆', items: ['米其林/餐飲獎項', '服務品質獎', 'ESG/永續認證', '設計/建築獎項'] },
  { group: '即時快訊', section: '綜合新聞', icon: '⚡', items: ['緊急公告', '營運異動', '價格調整', '服務更新'] },
  // 商業 / 餐飲
  { group: '餐廳新訊', section: '商業/餐飲', icon: '🍽', items: ['新菜單/季節菜單', '新餐廳開幕', '餐廳改裝/升級', '限定套餐/聯名菜單'] },
  { group: '主廚與團隊', section: '商業/餐飲', icon: '👨‍🍳', items: ['客座主廚活動', '主廚合作/交流', '餐飲總監專訪', '廚藝課程/工作坊'] },
  { group: '商務與宴會', section: '商業/餐飲', icon: '💼', items: ['商務宴請方案', '婚宴/喜宴專案', '會議/活動場地', '包廂/私人聚餐'] },
  { group: '酒類與品飲', section: '商業/餐飲', icon: '🍷', items: ['品酒晚宴/Wine Dinner', '威士忌品飲活動', '調酒師活動', '酒單更新/精選'] },
  { group: '招募與職場', section: '商業/餐飲', icon: '🤝', items: ['大型招募活動', '校園徵才', '實習計畫', '員工培訓/認證'] },
  { group: '商業合作', section: '商業/餐飲', icon: '📋', items: ['品牌策略合作', '異業結盟', '會員方案/聯名卡', '供應商/產地合作'] },
  // 生活 / 品牌
  { group: '住宿體驗', section: '生活/品牌', icon: '🛏', items: ['主題住房專案', '親子/家庭住房', '浪漫/情侶套餐', '長住/度假方案', '開箱/房型介紹'] },
  { group: '下午茶與甜點', section: '生活/品牌', icon: '🍰', items: ['季節主題下午茶', '品牌聯名下午茶', '節慶限定甜點', '外帶禮盒'] },
  { group: '節慶活動', section: '生活/品牌', icon: '🎄', items: ['聖誕/跨年', '農曆新年', '情人節', '母親節/父親節', '中秋節', '萬聖節'] },
  { group: 'CSR與永續', section: '生活/品牌', icon: '🌱', items: ['公益活動/捐贈', '環境永續行動', '在地社區連結', '弱勢關懷'] },
  { group: '品牌聯名與藝文', section: '生活/品牌', icon: '🎨', items: ['精品品牌聯名', '藝術家/設計師合作', '文化展覽/策展', '音樂/表演活動'] },
  { group: '生活風格', section: '生活/品牌', icon: '✨', items: ['水療SPA體驗', '健身/瑜珈活動', '花藝/香氛體驗', '季節限定企劃'] },
];

const categories = [
  {
    id: 'general' as const,
    icon: Newspaper,
    title: '綜合新聞 / 即時',
    description: '事實導向、新聞通訊社風格、倒金字塔結構',
    color: 'text-blue-600 bg-blue-50',
  },
  {
    id: 'business' as const,
    icon: Briefcase,
    title: '商業 / 職場 / 餐飲',
    description: '專業產業視角、商業價值導向、F&B 亮點',
    color: 'text-amber-700 bg-amber-50',
  },
  {
    id: 'lifestyle' as const,
    icon: Heart,
    title: '生活 / 品牌 / 風格',
    description: '感性敘事、場景營造、體驗旅程',
    color: 'text-rose-600 bg-rose-50',
  },
];

const defaultMediaContact: MediaContact = { name: '', title: '', email: '', phone: '' };

export default function GeneratorPage() {
  const [selectedCategory, setSelectedCategory] = useState<'general' | 'business' | 'lifestyle' | null>(null);
  const [selectedAngles, setSelectedAngles] = useState<string[]>([]);
  const [form, setForm] = useState({
    topic: '',
    keyFacts: '',
    eventDate: '',
    pricing: '',
    venue: '',
    includeGmQuote: false,
    gmQuoteContext: '',
    toneLevel: 3,
    additionalNotes: '',
  });
  const [mediaContacts, setMediaContacts] = useState<MediaContact[]>([{ ...defaultMediaContact }]);
  const [showMediaContacts, setShowMediaContacts] = useState(false);
  const [showAngles, setShowAngles] = useState(false);
  const [output, setOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const outputRef = useRef<HTMLDivElement>(null);

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group); else next.add(group);
      return next;
    });
  };

  const toggleAngle = (angle: string) => {
    setSelectedAngles(prev =>
      prev.includes(angle) ? prev.filter(a => a !== angle) : [...prev, angle]
    );
  };

  const addMediaContact = () => setMediaContacts(prev => [...prev, { ...defaultMediaContact }]);
  const removeMediaContact = (index: number) => setMediaContacts(prev => prev.filter((_, i) => i !== index));
  const updateMediaContact = (index: number, field: keyof MediaContact, value: string) => {
    setMediaContacts(prev => prev.map((c, i) => i === index ? { ...c, [field]: value } : c));
  };

  const handleGenerate = useCallback(async () => {
    if (!selectedCategory || !form.topic) return;
    setIsGenerating(true);
    setOutput('');
    try {
      const input: GenerationInput = {
        category: selectedCategory,
        topic: form.topic,
        subCategory: selectedAngles[0] || '',
        angles: selectedAngles,
        keyFacts: form.keyFacts,
        eventDate: form.eventDate,
        pricing: form.pricing,
        venue: form.venue,
        includeGmQuote: form.includeGmQuote,
        gmQuoteContext: form.gmQuoteContext,
        toneLevel: form.toneLevel,
        additionalNotes: form.additionalNotes,
        mediaContacts: mediaContacts.filter(c => c.name),
      };
      for await (const chunk of streamGenerate(input)) {
        setOutput(prev => prev + chunk);
        if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight;
      }
    } catch {
      setOutput(prev => prev + '\n\n[Error: Generation failed]');
    } finally {
      setIsGenerating(false);
    }
  }, [selectedCategory, form, selectedAngles, mediaContacts]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `新聞稿_${form.topic || 'untitled'}_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [output, form.topic]);

  // Group angle groups by section
  const sections = ['綜合新聞', '商業/餐飲', '生活/品牌'];

  return (
    <div className="flex h-full">
      {/* Left Panel */}
      <div className="w-[520px] border-r border-border overflow-auto p-6 space-y-5">
        <div>
          <h2 className="text-xl font-bold text-foreground">產生新聞稿</h2>
          <p className="text-sm text-muted-foreground mt-1">
            選擇語調類別、多面向切角，AI 將基於品牌標準為您撰寫
          </p>
        </div>

        {/* Category Selection - determines TONE */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">語調類別（決定整體風格）</Label>
          <div className="grid gap-2">
            {categories.map(cat => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border hover:border-primary/30 hover:bg-accent/50'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0 ${cat.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-foreground">{cat.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{cat.description}</div>
                  </div>
                  {isSelected && <ChevronRight className="w-4 h-4 text-primary mt-1 ml-auto flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {selectedCategory && (
          <>
            <Separator />

            {/* Multi-angle selector */}
            <div className="space-y-3">
              <button
                onClick={() => setShowAngles(!showAngles)}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary" />
                  <Label className="text-sm font-medium cursor-pointer">多面向切角</Label>
                  {selectedAngles.length > 0 && (
                    <Badge variant="default" className="text-[10px] h-5">{selectedAngles.length} 個面向</Badge>
                  )}
                </div>
                {showAngles ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>

              {/* Selected angles preview */}
              {selectedAngles.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedAngles.map(angle => (
                    <Badge
                      key={angle}
                      variant="default"
                      className="cursor-pointer text-xs pr-1"
                      onClick={() => toggleAngle(angle)}
                    >
                      {angle}
                      <X className="w-3 h-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}

              {selectedAngles.length === 0 && !showAngles && (
                <p className="text-xs text-muted-foreground">
                  可選擇多個面向，讓新聞稿涵蓋更豐富的角度（跨類別皆可選取）
                </p>
              )}

              {showAngles && (
                <div className="space-y-2 max-h-[400px] overflow-auto pr-1">
                  {sections.map(section => (
                    <div key={section}>
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 mt-2">
                        {section}
                      </div>
                      {allAngleGroups.filter(g => g.section === section).map(group => {
                        const isExpanded = expandedGroups.has(group.group);
                        const selectedInGroup = group.items.filter(i => selectedAngles.includes(i));
                        return (
                          <div key={group.group} className="border border-border rounded-lg overflow-hidden mb-1.5">
                            <button
                              onClick={() => toggleGroup(group.group)}
                              className={`w-full flex items-center justify-between px-3 py-2 text-left text-sm transition-colors ${
                                selectedInGroup.length > 0 ? 'bg-primary/10' : 'hover:bg-accent/50'
                              }`}
                            >
                              <span className="text-foreground">
                                <span className="mr-1.5">{group.icon}</span>
                                {group.group}
                              </span>
                              <div className="flex items-center gap-1.5">
                                {selectedInGroup.length > 0 && (
                                  <span className="text-[10px] text-primary font-medium">{selectedInGroup.length}</span>
                                )}
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
                              </div>
                            </button>
                            {isExpanded && (
                              <div className="px-3 pb-2 flex flex-wrap gap-1.5">
                                {group.items.map(item => (
                                  <Badge
                                    key={item}
                                    variant={selectedAngles.includes(item) ? 'default' : 'outline'}
                                    className="cursor-pointer transition-colors text-xs"
                                    onClick={() => toggleAngle(item)}
                                  >
                                    {item}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Topic */}
            <div className="space-y-2">
              <Label htmlFor="topic" className="text-sm font-medium">
                主題 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="topic"
                placeholder="例：臺北洲際酒店 DOSA 推出秋季韓式 Omakase 限定套餐"
                value={form.topic}
                onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
              />
            </div>

            {/* Key Facts */}
            <div className="space-y-2">
              <Label htmlFor="keyFacts" className="text-sm font-medium">關鍵資訊</Label>
              <Textarea
                id="keyFacts"
                placeholder="包含重要事實、數據、人名、特色亮點等..."
                rows={4}
                value={form.keyFacts}
                onChange={e => setForm(f => ({ ...f, keyFacts: e.target.value }))}
              />
            </div>

            {/* Event Date & Venue */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="eventDate" className="text-sm font-medium">活動日期</Label>
                <Input
                  id="eventDate"
                  type="date"
                  value={form.eventDate}
                  onChange={e => setForm(f => ({ ...f, eventDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="venue" className="text-sm font-medium">地點 / 餐廳</Label>
                <Input
                  id="venue"
                  placeholder="例：DOSA / Akira Back"
                  value={form.venue}
                  onChange={e => setForm(f => ({ ...f, venue: e.target.value }))}
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-2">
              <Label htmlFor="pricing" className="text-sm font-medium">價格資訊</Label>
              <Input
                id="pricing"
                placeholder="例：套餐 NT$3,880+10%"
                value={form.pricing}
                onChange={e => setForm(f => ({ ...f, pricing: e.target.value }))}
              />
            </div>

            {/* Tone Level */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">語調風格</Label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">正式</span>
                <input
                  type="range" min={1} max={5} value={form.toneLevel}
                  onChange={e => setForm(f => ({ ...f, toneLevel: parseInt(e.target.value) }))}
                  className="flex-1 accent-gold"
                />
                <span className="text-xs text-muted-foreground">感性</span>
              </div>
            </div>

            {/* GM Quote */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.includeGmQuote}
                  onChange={e => setForm(f => ({ ...f, includeGmQuote: e.target.checked }))}
                  className="accent-gold" />
                <span className="text-sm font-medium">包含總經理引言</span>
              </label>
              {form.includeGmQuote && (
                <Input placeholder="引言方向" value={form.gmQuoteContext}
                  onChange={e => setForm(f => ({ ...f, gmQuoteContext: e.target.value }))} />
              )}
            </div>

            <Separator />

            {/* Media Contacts */}
            <div className="space-y-3">
              <button onClick={() => setShowMediaContacts(!showMediaContacts)} className="flex items-center justify-between w-full text-left">
                <Label className="text-sm font-medium cursor-pointer">新聞聯絡人（自訂）</Label>
                {showMediaContacts ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>
              {showMediaContacts && (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">填寫後將出現在新聞稿中，留空則使用後台預設。</p>
                  {mediaContacts.map((contact, idx) => (
                    <div key={idx} className="p-3 border border-border rounded-lg space-y-2 relative">
                      {mediaContacts.length > 1 && (
                        <button onClick={() => removeMediaContact(idx)} className="absolute top-2 right-2 text-muted-foreground hover:text-destructive">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <div className="grid grid-cols-2 gap-2">
                        <Input placeholder="姓名" value={contact.name} onChange={e => updateMediaContact(idx, 'name', e.target.value)} className="text-sm h-8" />
                        <Input placeholder="職稱" value={contact.title} onChange={e => updateMediaContact(idx, 'title', e.target.value)} className="text-sm h-8" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Input placeholder="Email" value={contact.email} onChange={e => updateMediaContact(idx, 'email', e.target.value)} className="text-sm h-8" />
                        <Input placeholder="電話" value={contact.phone} onChange={e => updateMediaContact(idx, 'phone', e.target.value)} className="text-sm h-8" />
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={addMediaContact}>
                    <UserPlus className="w-3.5 h-3.5 mr-1.5" />新增聯絡人
                  </Button>
                </div>
              )}
            </div>

            {/* Additional Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">補充說明</Label>
              <Textarea id="notes" placeholder="其他需要特別注意的事項..." rows={2}
                value={form.additionalNotes}
                onChange={e => setForm(f => ({ ...f, additionalNotes: e.target.value }))} />
            </div>

            {/* Generate */}
            <Button className="w-full bg-gold hover:bg-gold-light text-white" size="lg"
              onClick={handleGenerate} disabled={isGenerating || !form.topic}>
              {isGenerating ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />AI 撰寫中...</>
              ) : (
                <><Sparkles className="w-4 h-4 mr-2" />產生新聞稿</>
              )}
            </Button>
          </>
        )}
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-sm font-medium text-foreground">新聞稿預覽</h3>
          {output && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                {copied ? '已複製' : '複製'}
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="w-3.5 h-3.5 mr-1" />下載
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setOutput(''); handleGenerate(); }}>
                <RotateCcw className="w-3.5 h-3.5 mr-1" />重新產生
              </Button>
            </div>
          )}
        </div>
        <div ref={outputRef} className="flex-1 overflow-auto p-6">
          {output ? (
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardContent className="p-6">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">{output}</pre>
                  {isGenerating && <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-0.5" />}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto">
                  <Newspaper className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">等待產生新聞稿</p>
                <p className="text-xs text-muted-foreground mt-1">選擇類別並填入資訊後，點擊「產生新聞稿」</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
