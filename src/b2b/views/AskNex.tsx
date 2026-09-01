// B2B Ask Nex — a calm, conversational Q&A over settlements. All pairs come from
// the mock barrel (src/b2b/mock). Monochrome + one accent (#7A5DBF): accent is
// used ONLY on the input glyph, the Nex avatar, and the "Ask something else"
// link. Square corners, hairline borders, tabular figures. The assistant is
// "Nex" throughout.
import React from 'react';
import { Box, Typography } from '@mui/material';
import { AutoAwesomeOutlined, ArrowForwardOutlined, ArrowUpwardOutlined } from '@mui/icons-material';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { colors, hairline, type, space } from '../theme/b2bTokens';
import { PageTitle, Pressable } from '../components/primitives';
import { askNexQA } from '../mock';

const MAXW = 720;

const AskNex: React.FC = () => {
  const reduce = useReducedMotion();
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const selected = askNexQA.find((q) => q.id === selectedId) ?? null;

  const fade = (key: string, children: React.ReactNode) => (
    <Box
      component={motion.div}
      key={key}
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? undefined : { opacity: 0, y: -6 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
    >
      {children}
    </Box>
  );

  return (
    <Box sx={{ maxWidth: MAXW, mx: 'auto' }}>
      <PageTitle>Ask Nex</PageTitle>

      {/* Input bar (read-only) */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: `${space.md}px`,
          border: hairline,
          px: `${space.lg}px`,
          py: `${space.sm}px`,
        }}
      >
        <AutoAwesomeOutlined sx={{ fontSize: 18, color: colors.accent, flexShrink: 0 }} />
        <Typography sx={{ flex: 1, fontSize: type.body.fontSize, color: colors.grey500 }}>
          Ask anything about your settlements…
        </Typography>
        <Box
          aria-hidden
          sx={{
            width: 34,
            height: 34,
            flexShrink: 0,
            bgcolor: colors.ink,
            color: colors.paper,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ArrowUpwardOutlined sx={{ fontSize: 18 }} />
        </Box>
      </Box>

      {/* Suggested questions ↔ conversation */}
      <Box sx={{ mt: `${space.xl}px` }}>
        <AnimatePresence mode="wait" initial={false}>
          {!selected
            ? fade(
                'suggest',
                <Box>
                  <Typography sx={{ ...type.label, color: colors.grey500, display: 'block', mb: `${space.md}px` }}>
                    Try asking
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: `${space.sm}px` }}>
                    {askNexQA.map((q) => (
                      <Pressable
                        key={q.id}
                        ariaLabel={q.question}
                        onClick={() => setSelectedId(q.id)}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: `${space.lg}px`,
                          border: hairline,
                          px: `${space.lg}px`,
                          py: `${space.lg}px`,
                          transition: 'background-color 0.12s ease',
                          '&:hover': { bgcolor: colors.grey100 },
                        }}
                      >
                        <Typography sx={{ fontSize: type.body.fontSize, color: colors.ink }}>{q.question}</Typography>
                        <ArrowForwardOutlined sx={{ fontSize: 16, color: colors.grey500, flexShrink: 0 }} />
                      </Pressable>
                    ))}
                  </Box>
                </Box>,
              )
            : fade(
                selected.id,
                <Box>
                  {/* User bubble (right-aligned ink) */}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Box
                      sx={{
                        bgcolor: colors.ink,
                        color: colors.paper,
                        px: `${space.lg}px`,
                        py: `${space.md}px`,
                        maxWidth: '82%',
                        fontSize: type.body.fontSize,
                        lineHeight: '20px',
                      }}
                    >
                      {selected.question}
                    </Box>
                  </Box>

                  {/* Nex answer card */}
                  <Box sx={{ border: hairline, p: `${space.xl}px`, mt: `${space.lg}px` }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: `${space.sm}px`, mb: `${space.md}px` }}>
                      <Box
                        sx={{
                          width: 22,
                          height: 22,
                          bgcolor: colors.accentWash,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <AutoAwesomeOutlined sx={{ fontSize: 14, color: colors.accent }} />
                      </Box>
                      <Typography sx={{ fontSize: type.body.fontSize, fontWeight: 600, color: colors.ink }}>Nex</Typography>
                    </Box>
                    <Typography sx={{ fontSize: type.body.fontSize, color: colors.ink, lineHeight: '24px' }}>
                      {selected.answer}
                    </Typography>
                  </Box>

                  {/* Reset */}
                  <Pressable
                    ariaLabel="Ask something else"
                    onClick={() => setSelectedId(null)}
                    sx={{
                      mt: `${space.lg}px`,
                      display: 'inline-block',
                      fontSize: 13,
                      fontWeight: 500,
                      color: colors.accent,
                      '&:hover': { color: colors.accentHover },
                    }}
                  >
                    ← Ask something else
                  </Pressable>
                </Box>,
              )}
        </AnimatePresence>
      </Box>
    </Box>
  );
};

export default AskNex;
