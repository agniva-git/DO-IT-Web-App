import Card from '../ui/Card.jsx'

export default function AIInsightCard({ insight }) {
  return (
    <Card className="border-reflect/30 bg-reflect/5">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-display text-lg text-reflect">AI Insight</h3>
        <span className="text-xs font-mono text-paper/30 uppercase">V2 preview</span>
      </div>
      <p className="text-paper/70 text-sm leading-relaxed">"{insight}"</p>
    </Card>
  )
}