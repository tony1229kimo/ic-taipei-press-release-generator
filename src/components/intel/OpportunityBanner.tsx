import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Radar, ArrowRight, Flame, Sparkles, TrendingUp } from 'lucide-react';
import { fetchOpportunities, type Opportunity } from '@/api/radar';

interface OpportunityBannerProps {
  onSelect: (opp: Opportunity) => void;
}

const heatConfig = {
  high:   { label: '熱度高',   icon: Flame,      cls: 'text-rose-600 bg-rose-50 border-rose-200' },
  rising: { label: '正崛起',   icon: TrendingUp, cls: 'text-amber-700 bg-amber-50 border-amber-200' },
  medium: { label: '值得關注', icon: Sparkles,   cls: 'text-blue-600 bg-blue-50 border-blue-200' },
};

export default function OpportunityBanner({ onSelect }: OpportunityBannerProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['radar', 'opportunities', 3],
    queryFn: () => fetchOpportunities(3),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  if (error) return null;

  return (
    <div className="border-b border-border bg-gradient-to-b from-accent/30 to-transparent">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Radar className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">今日機會</h3>
            <Badge variant="outline" className="text-[10px] h-5">情報雷達</Badge>
          </div>
          <p className="text-xs text-muted-foreground hidden md:block">點選任一張卡片，自動帶入下方表單</p>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-6 justify-center">
            <Loader2 className="w-4 h-4 animate-spin" />讀取雷達訊號⋯
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {data?.map(opp => {
              const heat = heatConfig[opp.heat];
              const HeatIcon = heat.icon;
              return (
                <Card
                  key={opp.id}
                  className="cursor-pointer hover:border-primary/40 hover:shadow-sm transition-all"
                  onClick={() => onSelect(opp)}
                >
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium border ${heat.cls}`}>
                        <HeatIcon className="w-3 h-3" />{heat.label}
                      </div>
                      {opp.topicTrend && (
                        <span className="text-[10px] text-muted-foreground">
                          7天 {opp.topicTrend.count7d} 則 · +{opp.topicTrend.growthPct}%
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-semibold text-foreground leading-snug line-clamp-2">{opp.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{opp.summary}</p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {opp.suggestedAngles.slice(0, 3).map(a => (
                        <Badge key={a} variant="outline" className="text-[10px] font-normal">{a}</Badge>
                      ))}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full h-7 text-xs justify-between mt-1 hover:bg-primary/10 hover:text-primary"
                    >
                      用此題材寫稿 <ArrowRight className="w-3 h-3" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
