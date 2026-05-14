import { useMemo, useState } from "react";
import { RosLayout } from "@/components/ros/RosLayout";
import { ingredients, recipes, formatNgn, type Ingredient } from "@/data/ros";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { CheckCircle2, AlertTriangle } from "lucide-react";

const Inventory = () => {
  // Compute expected stock at end-of-day from recipes & sales
  const expectedNow = useMemo(() => {
    const map = new Map<string, number>();
    ingredients.forEach((i) => map.set(i.id, i.expected));
    recipes.forEach((r) =>
      r.components.forEach((c) =>
        map.set(c.ingredientId, (map.get(c.ingredientId) ?? 0) - c.qty * r.soldToday),
      ),
    );
    return map;
  }, []);

  const [counting, setCounting] = useState<Ingredient | null>(null);
  const [enteredCount, setEnteredCount] = useState("");

  const variance = counting
    ? Number(enteredCount || 0) - (expectedNow.get(counting.id) ?? 0)
    : 0;

  return (
    <RosLayout title="Inventory" subtitle="Recipe-driven stock — expected vs counted">
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-border bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
          <div className="col-span-5">Item</div>
          <div className="col-span-2 text-right">Expected</div>
          <div className="col-span-2 text-right">Last count</div>
          <div className="col-span-2 text-right">Variance</div>
          <div className="col-span-1 text-right" />
        </div>
        <ul className="divide-y divide-border">
          {ingredients.map((i) => {
            const exp = expectedNow.get(i.id) ?? 0;
            const v = i.actual - exp;
            const tone = v < 0 ? "text-destructive" : v > 0 ? "text-warning" : "text-success";
            return (
              <li key={i.id} className="grid grid-cols-12 gap-2 px-4 py-3 items-center text-sm">
                <div className="col-span-5 flex items-center gap-3 min-w-0">
                  <span className="text-xl">{i.emoji}</span>
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{i.name}</div>
                    <div className="text-[11px] text-muted-foreground">{formatNgn(i.costPerUnit)} / {i.unit}</div>
                  </div>
                </div>
                <div className="col-span-2 text-right tabular-nums">{exp.toFixed(2)} {i.unit}</div>
                <div className="col-span-2 text-right tabular-nums">{i.actual} {i.unit}</div>
                <div className={`col-span-2 text-right tabular-nums font-semibold ${tone}`}>
                  {v >= 0 ? "+" : ""}{v.toFixed(2)} {i.unit}
                </div>
                <div className="col-span-1 text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => { setCounting(i); setEnteredCount(""); }}
                  >Count</Button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <Dialog open={!!counting} onOpenChange={(o) => !o && setCounting(null)}>
        <DialogContent>
          {counting && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span className="text-xl">{counting.emoji}</span>
                  Count {counting.name}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="rounded-lg bg-muted px-3 py-2 flex justify-between text-sm">
                  <span className="text-muted-foreground">Expected now</span>
                  <span className="font-semibold tabular-nums">
                    {(expectedNow.get(counting.id) ?? 0).toFixed(2)} {counting.unit}
                  </span>
                </div>

                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    Your count ({counting.unit})
                  </label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    autoFocus
                    value={enteredCount}
                    onChange={(e) => setEnteredCount(e.target.value)}
                    className="h-14 text-2xl font-bold mt-1 text-center"
                  />
                </div>

                {enteredCount !== "" && (
                  <div className={`rounded-lg p-3 flex items-start gap-2 ${
                    variance < 0 ? "bg-destructive/10 text-destructive" :
                    variance > 0 ? "bg-warning/10 text-warning" :
                    "bg-success/10 text-success"
                  }`}>
                    {variance === 0 ? <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" /> : <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />}
                    <div className="text-sm">
                      <div className="font-bold">
                        {variance === 0
                          ? "Balanced — no variance"
                          : `${variance > 0 ? "+" : ""}${variance.toFixed(2)} ${counting.unit}`}
                      </div>
                      {variance !== 0 && (
                        <div className="text-xs opacity-80 mt-0.5">
                          {Math.abs(variance * counting.costPerUnit) > 0
                            ? `${variance < 0 ? "Loss" : "Surplus"} value ≈ ${formatNgn(Math.abs(variance * counting.costPerUnit))}`
                            : ""}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setCounting(null)}>Cancel</Button>
                <Button onClick={() => setCounting(null)}>Save count</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </RosLayout>
  );
};

export default Inventory;
