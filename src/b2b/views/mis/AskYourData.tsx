// "Ask your data" — a SCRIPTED, deterministic assistant for the MIS page.
// NOT an LLM: a fixed set of 5 pre-authored Q&A entries whose answers are
// computed from misData, so they can never contradict the numbers rendered
// elsewhere on the page. No API, no dynamic text generation — only misData
// values filled into pre-written templates. Free-typed input is matched to an
// entry by simple case-insensitive keyword scoring; no match → graceful
// fallback that re-surfaces the chips. Drill-down links smooth-scroll to the
// matching page region (mis-pnl / mis-channels / mis-skus) and briefly highlight
// it, proving chat ↔ page consistency.
import React from 'react';
import { Box, Typography, TextField } from '@mui/material';
import { AutoAwesomeOutlined, ArrowUpwardOutlined } from '@mui/icons-material';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { colors, hairline, type, space, tabularNums } from '../../theme/b2bTokens';
import { Pressable } from '../../components/primitives';
import { formatINRShort, formatPercent } from '../../lib/format';
import { misData } from '../../mock';
import { statusColors } from './misTokens';

// ── Answer model ─────────────────────────────────────────────────────────────
type AnswerTone = 'positive' | 'warning' | 'neutral' | 'ink' | 'accent';
type RegionId = 'mis-pnl' | 'mis-channels' | 'mis-skus';

interface AnswerContent {
  headline: string;
  tone: AnswerTone;
  sentence: string;
  lines?: string[];
  drill?: { label: string; region: RegionId };
}
interface QAEntry {
  id: string;
  question: string;
  keywords: string[];
  answer: AnswerContent;
}

const TONE_COLOR: Record<AnswerTone, string> = {
  positive: statusColors.positive,
  warning: statusColors.warning,
  neutral: colors.grey700,
  ink: colors.ink,
  accent: colors.accent,
};

// Channels treated as quick-commerce, for the kill-list phrasing.
const QUICK_COMMERCE = new Set(['Blinkit', 'Zepto', 'BigBasket', 'Instamart']);

const ordinal = (n: number): string => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
};

// ── Author the 5 entries, every value pulled from misData ────────────────────
function buildEntries(): QAEntry[] {
  const { pnl, channels, skus, reconciliation: r } = misData;
  const line = (k: string) =>
    pnl.find((l) => l.key === k) ?? { key: k, label: k, amount: 0, pctOfGmv: 0, kind: 'flow' as const };
  const gmv = line('gmv').amount;

  // 2 — worst channel (guarded against an empty channel list)
  const negatives = channels.filter((c) => c.cm1Pct < 0).sort((a, b) => a.cm1Pct - b.cm1Pct);
  const worst = negatives[0] ?? [...channels].sort((a, b) => a.cm1Pct - b.cm1Pct)[0];
  const gmvRank = worst
    ? [...channels].sort((a, b) => b.gmv - a.gmv).findIndex((c) => c.channel === worst.channel) + 1
    : 0;
  const otherNeg = negatives.slice(1).map((c) => `${c.channel} (${formatPercent(c.cm1Pct)})`);

  // 3 — kill list
  const killed = skus.filter((s) => s.isKillList).sort((a, b) => a.marginPct - b.marginPct);
  const killChannels = [...new Set(killed.map((s) => s.channel))];
  const allQuickCommerce = killChannels.length > 0 && killChannels.every((c) => QUICK_COMMERCE.has(c));

  // 5 — EBITDA drains
  const eb = line('ebitda');
  const per100 = gmv ? (eb.amount / gmv) * 100 : 0;
  const topDrains = pnl
    .filter((l) => l.kind === 'flow')
    .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
    .slice(0, 3);

  return [
    {
      id: 'net-revenue',
      question: "What's my real net revenue?",
      keywords: ['net revenue', 'revenue', 'net rev', 'real net', 'top line'],
      answer: {
        headline: formatINRShort(line('netRevenue').amount),
        tone: 'ink',
        sentence: `That's ${formatPercent(line('netRevenue').pctOfGmv)} of your ${formatINRShort(gmv)} GMV — the gap is discounts (${formatINRShort(line('discounts').amount)}) and returns & RTO (${formatINRShort(line('returnsRto').amount)}).`,
        drill: { label: '↳ from Profit & Loss', region: 'mis-pnl' },
      },
    },
    {
      id: 'worst-channel',
      question: 'Which channel is losing me money?',
      keywords: ['channel', 'losing', 'loses', 'lose money', 'worst channel', 'which channel', 'blinkit', 'zepto', 'loss-making'],
      answer: worst
        ? {
            headline: `${worst.channel} · ${formatPercent(worst.cm1Pct)} CM1`,
            tone: 'warning',
            sentence:
              `${worst.channel} is your ${ordinal(gmvRank)}-largest channel by GMV (${formatINRShort(worst.gmv)}) but loses money on every order.` +
              (otherNeg.length ? ` ${otherNeg.join(', ')} ${otherNeg.length > 1 ? 'are' : 'is'} also below water.` : ''),
            drill: { label: '↳ from Channel Performance', region: 'mis-channels' },
          }
        : { headline: 'No channel data', tone: 'neutral', sentence: 'No channel data is available for this period.' },
    },
    {
      id: 'kill-skus',
      question: 'Which SKUs should I kill?',
      keywords: ['sku', 'skus', 'kill', 'discontinue', 'product', 'products', 'which sku'],
      answer: killed.length
        ? {
            headline: `${killed.length} SKUs to kill`,
            tone: 'warning',
            sentence: allQuickCommerce
              ? `All are selling below cost on quick-commerce channels (${killChannels.join(', ')}).`
              : `All are selling below cost across ${killChannels.join(', ')}.`,
            lines: killed.map((s) => `${s.sku} · ${formatPercent(s.marginPct)} · ${s.channel}`),
            drill: { label: `↳ ${killed.length} SKUs`, region: 'mis-skus' },
          }
        : { headline: 'None', tone: 'positive', sentence: 'No SKUs are selling below cost this period.' },
    },
    {
      id: 'disputes',
      question: 'How much money is stuck in disputes?',
      keywords: ['dispute', 'disputes', 'stuck', 'recover', 'recovered', 'pending', 'settlement', 'reconcil', 'exception'],
      answer: {
        headline: formatINRShort(r.inDisputeAmount),
        tone: 'warning',
        sentence: `That's across ${r.inDisputeExceptions.toLocaleString('en-IN')} open exceptions. A further ${formatINRShort(r.pendingSettlementAmount)} is pending settlement, and ${formatINRShort(r.recoveredThisMonth)} has been recovered this month.`,
        lines: [
          `In dispute · ${formatINRShort(r.inDisputeAmount)} · ${r.inDisputeExceptions.toLocaleString('en-IN')} exceptions`,
          `Pending settlement · ${formatINRShort(r.pendingSettlementAmount)}`,
          `Recovered this month · ${formatINRShort(r.recoveredThisMonth)}`,
        ],
      },
    },
    {
      id: 'ebitda',
      question: 'Why is my EBITDA so low?',
      keywords: ['ebitda', 'profit', 'why', 'low', 'so low', 'bottom line', 'take home'],
      answer: {
        headline: formatINRShort(eb.amount),
        tone: 'warning',
        sentence:
          `Only ₹${per100.toFixed(2)} of every ₹100 in GMV reaches EBITDA (${formatPercent(eb.pctOfGmv)}).` +
          (topDrains.length ? ` The three biggest drains are ${topDrains.map((d) => d.label).join(', ')}.` : ''),
        lines: topDrains.length ? topDrains.map((d) => `${d.label} · ${formatINRShort(d.amount)}`) : undefined,
        drill: { label: '↳ from Profit & Loss', region: 'mis-pnl' },
      },
    },
  ];
}

const ENTRIES = buildEntries();
const SOURCE = `Source: reconciled ledger · ${misData.period} · ${misData.reconciliation.totalTransactions.toLocaleString('en-IN')} txns`;
const GREETING = `Ask me anything about ${misData.period}.`;

// Case-insensitive keyword scoring; highest score wins, ties break by order.
function matchEntry(text: string): QAEntry | null {
  const t = text.toLowerCase();
  let best: QAEntry | null = null;
  let bestScore = 0;
  for (const e of ENTRIES) {
    const score = e.keywords.reduce((n, k) => (t.includes(k) ? n + 1 : n), 0);
    if (score > bestScore) {
      bestScore = score;
      best = e;
    }
  }
  return bestScore > 0 ? best : null;
}

// ── Message model ────────────────────────────────────────────────────────────
type Msg =
  | { id: string; role: 'assistant'; kind: 'text'; text: string }
  | { id: string; role: 'assistant'; kind: 'typing' }
  | { id: string; role: 'assistant'; kind: 'answer'; answer: AnswerContent }
  | { id: string; role: 'assistant'; kind: 'fallback' }
  | { id: string; role: 'user'; text: string };

const TYPING_ID = '__typing__';

const AskYourData: React.FC = () => {
  const reduce = useReducedMotion();
  const [messages, setMessages] = React.useState<Msg[]>([
    { id: 'greeting', role: 'assistant', kind: 'text', text: GREETING },
  ]);
  const [input, setInput] = React.useState('');
  const threadRef = React.useRef<HTMLDivElement>(null);
  const idc = React.useRef(0);
  const timers = React.useRef<number[]>([]);
  const busy = messages.some((m) => m.id === TYPING_ID);

  React.useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);
  React.useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const nextId = () => `m${++idc.current}`;

  const respond = (userText: string, entry: QAEntry | null) => {
    setMessages((prev) => [
      ...prev,
      { id: nextId(), role: 'user', text: userText },
      { id: TYPING_ID, role: 'assistant', kind: 'typing' },
    ]);
    const to = window.setTimeout(() => {
      setMessages((prev) => {
        const base = prev.filter((m) => m.id !== TYPING_ID);
        const reply: Msg = entry
          ? { id: nextId(), role: 'assistant', kind: 'answer', answer: entry.answer }
          : { id: nextId(), role: 'assistant', kind: 'fallback' };
        return [...base, reply];
      });
    }, reduce ? 250 : 600);
    timers.current.push(to);
  };

  const onChip = (e: QAEntry) => {
    if (!busy) respond(e.question, e);
  };
  const onSubmit = () => {
    const v = input.trim();
    if (!v || busy) return;
    setInput('');
    respond(v, matchEntry(v));
  };

  // Smooth-scroll to a page region + brief accent highlight.
  const drillTo = (region: RegionId) => {
    const el = document.getElementById(region);
    if (!el) return;
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    el.style.transition = 'outline-color 0.5s ease';
    el.style.outline = `2px solid ${colors.accent}`;
    el.style.outlineOffset = '3px';
    const to = window.setTimeout(() => {
      el.style.outline = '2px solid transparent';
    }, 1400);
    timers.current.push(to);
  };

  const NexTag = (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: `${space.sm}px`, mb: `${space.sm}px` }}>
      <Box sx={{ width: 20, height: 20, bgcolor: colors.accentWash, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <AutoAwesomeOutlined sx={{ fontSize: 13, color: colors.accent }} />
      </Box>
      <Typography sx={{ ...type.label, color: colors.grey500 }}>Nex</Typography>
    </Box>
  );

  const renderAnswer = (a: AnswerContent) => (
    <Box sx={{ border: hairline, p: `${space.lg}px` }}>
      {NexTag}
      <Typography sx={{ ...type.statValue, color: TONE_COLOR[a.tone], ...tabularNums }}>{a.headline}</Typography>
      <Typography sx={{ ...type.body, color: colors.grey700, mt: `${space.sm}px` }}>{a.sentence}</Typography>
      {a.lines && (
        <Box sx={{ mt: `${space.md}px`, borderTop: hairline }}>
          {a.lines.map((l, i) => (
            <Typography
              key={i}
              sx={{
                fontSize: 13,
                lineHeight: '18px',
                color: colors.grey700,
                py: `${space.xs}px`,
                borderBottom: i < a.lines!.length - 1 ? hairline : 'none',
                ...tabularNums,
              }}
            >
              {l}
            </Typography>
          ))}
        </Box>
      )}
      {a.drill && (
        <Pressable
          ariaLabel={a.drill.label}
          onClick={() => drillTo(a.drill!.region)}
          sx={{
            mt: `${space.md}px`,
            display: 'inline-block',
            fontSize: 13,
            fontWeight: 500,
            color: colors.accent,
            '&:hover': { color: colors.accentHover },
          }}
        >
          {a.drill.label}
        </Pressable>
      )}
      <Typography sx={{ ...type.label, color: colors.grey500, mt: `${space.md}px`, display: 'block', ...tabularNums }}>
        {SOURCE}
      </Typography>
    </Box>
  );

  const renderMessage = (m: Msg) => {
    if (m.role === 'user') {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Box
            sx={{
              bgcolor: colors.ink,
              color: colors.paper,
              px: `${space.md}px`,
              py: `${space.sm}px`,
              maxWidth: '85%',
              fontSize: type.body.fontSize,
              lineHeight: '20px',
            }}
          >
            {m.text}
          </Box>
        </Box>
      );
    }
    if (m.kind === 'text') {
      return (
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: `${space.sm}px` }}>
          <Box sx={{ width: 20, height: 20, mt: '2px', flexShrink: 0, bgcolor: colors.accentWash, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AutoAwesomeOutlined sx={{ fontSize: 13, color: colors.accent }} />
          </Box>
          <Typography sx={{ ...type.body, color: colors.grey700 }}>{m.text}</Typography>
        </Box>
      );
    }
    if (m.kind === 'typing') {
      return (
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: `${space.xs}px`, border: hairline, px: `${space.md}px`, py: `${space.sm}px` }}>
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              component={motion.span}
              animate={reduce ? undefined : { opacity: [0.3, 1, 0.3] }}
              transition={reduce ? undefined : { duration: 0.9, repeat: Infinity, ease: 'easeInOut', delay: i * 0.15 }}
              sx={{ width: 6, height: 6, bgcolor: colors.grey500 }}
            />
          ))}
        </Box>
      );
    }
    if (m.kind === 'fallback') {
      return (
        <Box sx={{ border: hairline, p: `${space.lg}px` }}>
          {NexTag}
          <Typography sx={{ ...type.body, color: colors.ink }}>
            I can answer that from your reconciled data — try one of these:
          </Typography>
        </Box>
      );
    }
    return renderAnswer(m.answer);
  };

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Thread */}
      <Box
        ref={threadRef}
        sx={{
          height: 340,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: `${space.md}px`,
          pr: `${space.xs}px`,
        }}
      >
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <Box
              key={m.id}
              component={motion.div}
              layout={!reduce}
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              {renderMessage(m)}
            </Box>
          ))}
        </AnimatePresence>
      </Box>

      {/* Suggested-question chips (primary interaction) */}
      <Box sx={{ mt: `${space.lg}px`, display: 'flex', flexWrap: 'wrap', gap: `${space.sm}px` }}>
        {ENTRIES.map((e) => (
          <Pressable
            key={e.id}
            ariaLabel={e.question}
            disabled={busy}
            onClick={() => onChip(e)}
            sx={{
              border: hairline,
              px: `${space.md}px`,
              py: `${space.sm}px`,
              fontSize: 13,
              lineHeight: '18px',
              color: colors.ink,
              opacity: busy ? 0.5 : 1,
              transition: 'background-color 0.12s ease',
              '&:hover': busy ? undefined : { bgcolor: colors.grey100 },
            }}
          >
            {e.question}
          </Pressable>
        ))}
      </Box>

      {/* Input row */}
      <Box sx={{ mt: `${space.md}px`, display: 'flex', alignItems: 'center', gap: `${space.sm}px` }}>
        <TextField
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onSubmit();
            }
          }}
          placeholder={`Ask about ${misData.period}…`}
          size="small"
          fullWidth
          sx={{ '& .MuiOutlinedInput-input': { fontSize: type.body.fontSize, py: `${space.sm}px` } }}
        />
        <Pressable
          ariaLabel="Send"
          disabled={!input.trim() || busy}
          onClick={onSubmit}
          sx={{
            width: 36,
            height: 36,
            flexShrink: 0,
            bgcolor: input.trim() && !busy ? colors.ink : colors.grey100,
            color: input.trim() && !busy ? colors.paper : colors.grey500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ArrowUpwardOutlined sx={{ fontSize: 18 }} />
        </Pressable>
      </Box>
    </Box>
  );
};

export default AskYourData;
