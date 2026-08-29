import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'
import Card from '../ui/Card.jsx'

// Hex values matching tailwind.config.js — recharts renders raw SVG so
// it needs actual color values, not Tailwind class names.
const COLORS = {
  plan: '#7C8CF8',
  focus: '#4F8A8B',
  move: '#D98E4A',
  good: '#5FAE7A',
  reflect: '#B784C4'
}

function ChartTooltip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surfaceRaised border border-line rounded-card px-3 py-2 text-sm">
      <p className="text-paper/70">{label}</p>
      <p className="text-paper font-medium">
        {payload[0].value}
        {unit}
      </p>
    </div>
  )
}

// One implementation used by every analytics card (Study/Focus/Fitness/
// Habits) — a real vertical bar chart with axes and gridlines, matching
// standard bar-graph conventions rather than a stack of progress bars.
export default function AnalyticsBarList({ title, items, unit = '', color = 'plan' }) {
  const fill = COLORS[color] || COLORS.plan

  return (
    <Card>
      <h3 className="font-display text-lg mb-4">{title}</h3>
      {items.length === 0 ? (
        <p className="text-paper/40 text-sm">Not enough data yet.</p>
      ) : (
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={items} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A3949" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: '#F5F3EE', opacity: 0.5, fontSize: 12 }}
                axisLine={{ stroke: '#2A3949' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#F5F3EE', opacity: 0.4, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={32}
              />
              <Tooltip
                cursor={{ fill: '#F5F3EE', opacity: 0.04 }}
                content={<ChartTooltip unit={unit} />}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={44}>
                {items.map((item) => (
                  <Cell key={item.label} fill={fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  )
}