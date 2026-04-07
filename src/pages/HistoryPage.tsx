import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, Check, Clock, Newspaper } from 'lucide-react';
import { fetchApi, type GenerationRecord } from '@/api/client';

const categoryLabels: Record<string, string> = {
  general: '綜合新聞',
  business: '商業/餐飲',
  lifestyle: '生活/品牌',
};

const categoryColors: Record<string, string> = {
  general: 'bg-blue-50 text-blue-700',
  business: 'bg-amber-50 text-amber-700',
  lifestyle: 'bg-rose-50 text-rose-700',
};

export default function HistoryPage() {
  const [history, setHistory] = useState<GenerationRecord[]>([]);
  const [selected, setSelected] = useState<GenerationRecord | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi<GenerationRecord[]>('/knowledge-base/history')
      .then(data => {
        setHistory(data);
        if (data.length > 0) setSelected(data[0]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = () => {
    if (!selected) return;
    navigator.clipboard.writeText(selected.output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground text-sm">Loading...</div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto">
            <Clock className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">尚無歷史記錄</p>
            <p className="text-xs text-muted-foreground mt-1">產生新聞稿後，將會自動保存在此</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* List */}
      <div className="w-80 border-r border-border">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">歷史記錄</h2>
          <p className="text-xs text-muted-foreground mt-1">{history.length} 篇新聞稿</p>
        </div>
        <ScrollArea className="h-[calc(100vh-100px)]">
          <div className="p-2 space-y-1">
            {history.map(record => (
              <button
                key={record.id}
                onClick={() => setSelected(record)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selected?.id === record.id
                    ? 'bg-primary/10'
                    : 'hover:bg-accent/50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className={`text-[10px] ${categoryColors[record.category] || ''}`}>
                    {categoryLabels[record.category] || record.category}
                  </Badge>
                </div>
                <p className="text-sm font-medium text-foreground line-clamp-2">{record.topic}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(record.timestamp).toLocaleString('zh-TW')}
                </p>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Detail */}
      <div className="flex-1 flex flex-col">
        {selected ? (
          <>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h3 className="text-sm font-medium text-foreground">{selected.topic}</h3>
                <p className="text-xs text-muted-foreground">
                  {new Date(selected.timestamp).toLocaleString('zh-TW')}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                {copied ? '已複製' : '複製'}
              </Button>
            </div>
            <ScrollArea className="flex-1 p-6">
              <div className="max-w-2xl mx-auto">
                <Card>
                  <CardContent className="p-6">
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
                      {selected.output}
                    </pre>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">選擇一筆記錄查看</p>
          </div>
        )}
      </div>
    </div>
  );
}
