import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Database, Upload, RefreshCcw, Save, FileText, Trash2, Search,
  Loader2, CheckCircle2, AlertCircle, BarChart3
} from 'lucide-react';
import {
  fetchApi,
  type DocumentSummary,
  type BrandStandards,
  type KBStats,
} from '@/api/client';

const categoryLabels: Record<string, string> = {
  general: '一般',
  opening: '開幕',
  fb: '餐飲',
  csr: '公益',
  seasonal: '節慶',
  lifestyle: '生活',
  business: '商業',
};

export default function AdminPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">後台管理</h2>
        <p className="text-sm text-muted-foreground mt-1">
          管理知識庫、品牌標準和文件索引
        </p>
      </div>

      <Tabs defaultValue="documents">
        <TabsList>
          <TabsTrigger value="documents">
            <FileText className="w-3.5 h-3.5 mr-1.5" />
            文件管理
          </TabsTrigger>
          <TabsTrigger value="brand">
            <Database className="w-3.5 h-3.5 mr-1.5" />
            品牌標準
          </TabsTrigger>
          <TabsTrigger value="index">
            <RefreshCcw className="w-3.5 h-3.5 mr-1.5" />
            索引工具
          </TabsTrigger>
          <TabsTrigger value="stats">
            <BarChart3 className="w-3.5 h-3.5 mr-1.5" />
            統計
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="mt-4">
          <DocumentManager />
        </TabsContent>
        <TabsContent value="brand" className="mt-4">
          <BrandStandardsEditor />
        </TabsContent>
        <TabsContent value="index" className="mt-4">
          <IndexTool />
        </TabsContent>
        <TabsContent value="stats" className="mt-4">
          <StatsView />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DocumentManager() {
  const [docs, setDocs] = useState<DocumentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const loadDocs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('keywords', search);
      if (categoryFilter) params.set('category', categoryFilter);
      params.set('limit', '100');
      const data = await fetchApi<{ documents: DocumentSummary[] }>(
        `/knowledge-base/documents?${params}`
      );
      setDocs(data.documents);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter]);

  useEffect(() => {
    loadDocs();
  }, [loadDocs]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'general');

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        loadDocs();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('確定要從索引中移除此文件嗎？')) return;
    try {
      await fetchApi(`/knowledge-base/documents/${id}`, { method: 'DELETE' });
      loadDocs();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload & Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="搜尋文件..."
            className="pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
        >
          <option value="">全部類別</option>
          {Object.entries(categoryLabels).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <input
          ref={fileInputRef}
          type="file"
          accept=".docx,.pdf"
          className="hidden"
          onChange={handleUpload}
        />
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Upload className="w-4 h-4 mr-1.5" />}
          上傳文件
        </Button>
      </div>

      {/* Document List */}
      <Card>
        <ScrollArea className="h-[500px]">
          <div className="divide-y divide-border">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground text-sm">載入中...</div>
            ) : docs.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">
                尚無文件。請先執行索引或上傳文件。
              </div>
            ) : (
              docs.map(doc => (
                <div key={doc.id} className="flex items-start gap-3 p-3 hover:bg-accent/30 transition-colors">
                  <FileText className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{doc.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-[10px]">
                        {categoryLabels[doc.category] || doc.category}
                      </Badge>
                      {doc.date && (
                        <span className="text-xs text-muted-foreground">{doc.date}</span>
                      )}
                      <span className="text-xs text-muted-foreground">{doc.wordCount} 字</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(doc.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </Card>
      <p className="text-xs text-muted-foreground">
        共 {docs.length} 份文件
      </p>
    </div>
  );
}

function BrandStandardsEditor() {
  const [bs, setBs] = useState<BrandStandards | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchApi<BrandStandards>('/admin/brand-standards')
      .then(setBs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!bs) return;
    setSaving(true);
    try {
      await fetchApi('/admin/brand-standards', {
        method: 'PUT',
        body: JSON.stringify(bs),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !bs) {
    return <div className="text-center py-8 text-muted-foreground text-sm">載入中...</div>;
  }

  const updateHotel = (field: string, value: string) => {
    setBs(prev => prev ? { ...prev, hotelInfo: { ...prev.hotelInfo, [field]: value } } : null);
  };

  const updateBrand = (field: string, value: string) => {
    setBs(prev => prev ? { ...prev, brand: { ...prev.brand, [field]: value } } : null);
  };

  const updatePersonality = (field: string, value: string) => {
    setBs(prev => prev ? {
      ...prev,
      brand: { ...prev.brand, personality: { ...prev.brand.personality, [field]: value } }
    } : null);
  };

  const updateMediaContact = (index: number, field: string, value: string) => {
    setBs(prev => {
      if (!prev) return null;
      const contacts = [...(prev.hotelInfo.mediaContacts || [])];
      contacts[index] = { ...contacts[index], [field]: value };
      return { ...prev, hotelInfo: { ...prev.hotelInfo, mediaContacts: contacts } };
    });
  };

  const addMediaContactAdmin = () => {
    setBs(prev => {
      if (!prev) return null;
      const contacts = [...(prev.hotelInfo.mediaContacts || []), { name: '', title: '', email: '', phone: '' }];
      return { ...prev, hotelInfo: { ...prev.hotelInfo, mediaContacts: contacts } };
    });
  };

  const removeMediaContactAdmin = (index: number) => {
    setBs(prev => {
      if (!prev) return null;
      const contacts = (prev.hotelInfo.mediaContacts || []).filter((_, i) => i !== index);
      return { ...prev, hotelInfo: { ...prev.hotelInfo, mediaContacts: contacts } };
    });
  };

  return (
    <div className="space-y-6">
      {/* Hotel Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">酒店資訊</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">酒店名稱（中文）</Label>
              <Input value={bs.hotelInfo.name} onChange={e => updateHotel('name', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">酒店名稱（英文）</Label>
              <Input value={bs.hotelInfo.nameEn} onChange={e => updateHotel('nameEn', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">地址</Label>
              <Input value={bs.hotelInfo.address} onChange={e => updateHotel('address', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">電話</Label>
              <Input value={bs.hotelInfo.phone} onChange={e => updateHotel('phone', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">總經理姓名</Label>
              <Input value={bs.hotelInfo.gmName} onChange={e => updateHotel('gmName', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">總經理職稱</Label>
              <Input value={bs.hotelInfo.gmTitle} onChange={e => updateHotel('gmTitle', e.target.value)} />
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="text-sm font-medium mb-3">預設媒體聯繫人</h4>
            <p className="text-xs text-muted-foreground mb-3">產生新聞稿時若未自訂聯繫人，將使用以下預設值。</p>
            <div className="space-y-3">
              {(bs.hotelInfo.mediaContacts || []).map((contact, idx) => (
                <div key={idx} className="p-3 border border-border rounded-lg relative">
                  {(bs.hotelInfo.mediaContacts || []).length > 1 && (
                    <button onClick={() => removeMediaContactAdmin(idx)} className="absolute top-2 right-2 text-muted-foreground hover:text-destructive text-xs">移除</button>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">姓名</Label>
                      <Input value={contact.name} onChange={e => updateMediaContact(idx, 'name', e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">職稱</Label>
                      <Input value={contact.title} onChange={e => updateMediaContact(idx, 'title', e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Email</Label>
                      <Input value={contact.email} onChange={e => updateMediaContact(idx, 'email', e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">電話</Label>
                      <Input value={contact.phone} onChange={e => updateMediaContact(idx, 'phone', e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addMediaContactAdmin}>新增聯繫人</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Brand Standards */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">品牌標準</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">品牌宗旨</Label>
            <Input value={bs.brand.purpose} onChange={e => updateBrand('purpose', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">品牌承諾</Label>
            <Input value={bs.brand.promise} onChange={e => updateBrand('promise', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">品牌定位</Label>
            <Textarea value={bs.brand.proposition} onChange={e => updateBrand('proposition', e.target.value)} rows={2} />
          </div>

          <Separator />

          <h4 className="text-sm font-medium">品牌個性</h4>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">體貼周到 (Thoughtful)</Label>
              <Textarea value={bs.brand.personality.thoughtful} onChange={e => updatePersonality('thoughtful', e.target.value)} rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">文化底蘊 (Cultured)</Label>
              <Textarea value={bs.brand.personality.cultured} onChange={e => updatePersonality('cultured', e.target.value)} rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">非凡卓越 (Remarkable)</Label>
              <Textarea value={bs.brand.personality.remarkable} onChange={e => updatePersonality('remarkable', e.target.value)} rows={2} />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">設計策略</Label>
              <Input value={bs.brand.designStrategy} onChange={e => updateBrand('designStrategy', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">服務哲學</Label>
              <Input value={bs.brand.servicePhilosophy} onChange={e => updateBrand('servicePhilosophy', e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">餐飲哲學</Label>
            <Input value={bs.brand.fbPhilosophy} onChange={e => updateBrand('fbPhilosophy', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">目標客群</Label>
            <Textarea value={bs.brand.targetGuest} onChange={e => updateBrand('targetGuest', e.target.value)} rows={2} />
          </div>

          <Separator />

          <div className="space-y-1.5">
            <Label className="text-xs">自訂備註（會加入 AI 生成提示中）</Label>
            <Textarea
              value={bs.customNotes}
              onChange={e => setBs(prev => prev ? { ...prev, customNotes: e.target.value } : null)}
              rows={3}
              placeholder="例：最近半年請避免使用「後疫情」相關字眼..."
            />
          </div>
        </CardContent>
      </Card>

      <Button
        className="bg-gold hover:bg-gold-light text-white"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? (
          <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
        ) : saved ? (
          <CheckCircle2 className="w-4 h-4 mr-1.5" />
        ) : (
          <Save className="w-4 h-4 mr-1.5" />
        )}
        {saved ? '已儲存' : '儲存品牌標準'}
      </Button>
    </div>
  );
}

function IndexTool() {
  const [indexing, setIndexing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [result, setResult] = useState<{ totalDocuments: number } | null>(null);
  const [error, setError] = useState('');

  const handleReindex = async () => {
    setIndexing(true);
    setProgress({ current: 0, total: 0 });
    setResult(null);
    setError('');

    try {
      const res = await fetch('/api/admin/reindex', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourcePath: 'C:\\Users\\smtony\\Desktop\\Claude\\新聞稿產生器' }),
      });

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.status === 'indexing') {
                setProgress({ current: data.current, total: data.total });
              }
              if (data.done) {
                setResult({ totalDocuments: data.totalDocuments });
              }
              if (data.error) {
                setError(data.error);
              }
            } catch {}
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reindex failed');
    } finally {
      setIndexing(false);
    }
  };

  const progressPct = progress.total > 0 ? (progress.current / progress.total) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">重新索引知識庫</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          掃描 <code className="bg-muted px-1.5 py-0.5 rounded text-xs">新聞稿產生器/PR/</code> 目錄，
          萃取所有 DOCX 和 PDF 文件的內容並建立索引。
        </p>

        {indexing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>正在索引文件...</span>
              <span>{progress.current} / {progress.total}</span>
            </div>
            <Progress value={progressPct} />
          </div>
        )}

        {result && (
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-3 rounded-lg">
            <CheckCircle2 className="w-4 h-4" />
            索引完成！共 {result.totalDocuments} 份文件。
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 p-3 rounded-lg">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <Button
          className="bg-gold hover:bg-gold-light text-white"
          onClick={handleReindex}
          disabled={indexing}
        >
          {indexing ? (
            <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
          ) : (
            <RefreshCcw className="w-4 h-4 mr-1.5" />
          )}
          {indexing ? '索引中...' : '開始索引'}
        </Button>
      </CardContent>
    </Card>
  );
}

function StatsView() {
  const [stats, setStats] = useState<KBStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi<KBStats>('/knowledge-base/stats')
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return <div className="text-center py-8 text-muted-foreground text-sm">載入中...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">{stats.totalDocuments}</div>
            <div className="text-xs text-muted-foreground mt-1">知識庫文件</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">{stats.totalGenerations}</div>
            <div className="text-xs text-muted-foreground mt-1">已產生新聞稿</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">
              {stats.lastIndexed ? new Date(stats.lastIndexed).toLocaleDateString('zh-TW') : '-'}
            </div>
            <div className="text-xs text-muted-foreground mt-1">上次索引</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">按類別分布</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(stats.categoryCount).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
                <div key={cat} className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{categoryLabels[cat] || cat}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gold rounded-full"
                        style={{ width: `${(count / stats.totalDocuments) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">按年份分布</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(stats.yearCount).sort((a, b) => b[0].localeCompare(a[0])).map(([year, count]) => (
                <div key={year} className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{year} 年</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gold rounded-full"
                        style={{ width: `${(count / stats.totalDocuments) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
