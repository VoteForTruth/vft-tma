import { ratio } from '@/format';

// The outcome of a dispute: weight of pro arguments vs con arguments.
export function ResultBar({ pro, con }: { pro: string; con: string }) {
  const share = ratio(pro, con);
  const empty = BigInt(pro) === 0n && BigInt(con) === 0n;
  return (
    <div className="flex h-2 w-full overflow-hidden rounded-full bg-border">
      {!empty && (
        <>
          <div
            className="rounded-full bg-pro shadow-[0_0_8px_rgba(111,141,255,0.6)]"
            style={{ width: `${share * 100}%` }}
          />
          <div
            className="ml-0.5 rounded-full bg-con shadow-[0_0_8px_rgba(224,69,123,0.6)]"
            style={{ width: `${(1 - share) * 100}%` }}
          />
        </>
      )}
    </div>
  );
}
