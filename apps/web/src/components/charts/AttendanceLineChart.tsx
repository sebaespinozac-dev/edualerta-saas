import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export function AttendanceLineChart({
  data,
}: {
  data: { day: string; value: number }[];
}) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: -16 }}>
          <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="2 4" vertical={false} />
          <XAxis
            dataKey="day"
            stroke="hsl(var(--muted))"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="hsl(var(--muted))"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            domain={[85, 100]}
            tickFormatter={(v) => `${v}%`}
            width={40}
          />
          <Tooltip
            contentStyle={{
              background: 'hsl(var(--surface))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 6,
              fontSize: 12,
              padding: '6px 10px',
            }}
            labelStyle={{ color: 'hsl(var(--muted))', fontSize: 11 }}
            formatter={(v: number) => [`${v.toFixed(1)}%`, 'Asistencia']}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#1a2e5a"
            strokeWidth={1.5}
            dot={{ r: 3, fill: '#1a2e5a', strokeWidth: 0 }}
            activeDot={{ r: 4, fill: '#1a2e5a', strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
