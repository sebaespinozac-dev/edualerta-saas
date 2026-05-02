import { Line, LineChart, ResponsiveContainer, YAxis } from 'recharts';

export function Sparkline({ data, height = 16 }: { data: number[]; height?: number }) {
  const series = data.map((v, i) => ({ i, v }));
  const min = Math.min(...data);
  const max = Math.max(...data);
  return (
    <div style={{ height, width: 60 }}>
      <ResponsiveContainer>
        <LineChart data={series} margin={{ top: 1, right: 1, bottom: 1, left: 1 }}>
          <YAxis hide domain={[min, max]} />
          <Line
            type="monotone"
            dataKey="v"
            stroke="#1a2e5a"
            strokeWidth={1.25}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
