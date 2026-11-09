# Landing demo rehearsal

## Story

The example types a FastAPI question, sends it, shows context retrieval, streams a typed Python response, and reveals the saved preference that informed it. The desktop scene uses an EngramLoop workspace window. The compact scene uses a phone frame and keeps the same conversation readable at a 390px viewport. The stages are 660×550px desktop and 358×718px compact.

The Stageshow `ai-chat` example was the composition reference. The copied kit and scripts live beside this component; the kit's MIT license is in `STAGESHOW-LICENSE`.

The project mascot is `apps/web/public/assets/engramloop-mascot.png`, rendered through `apps/web/components/engram-mascot.tsx` in the orbit illustration, process step, and assistant avatars. The Memories navigation keeps a database icon for clarity.

## Captures

- Desktop reduced-motion poster: `shots/wide-poster.png` at 1440px. `shots/wide-poster-report.json` reports no issues.
- Phone reduced-motion poster: `shots/mobile-poster.png` at 390px. `shots/mobile-poster-report.json` reports no issues.
- Desktop and phone mascot avatar stills: `shots/mascot-wide.png` and `shots/mascot-mobile.png`; both reports show no issues.
- Landing orbit illustration: `shots/mascot-orbit-desktop.png`; `shots/mascot-orbit-report.json` reports no layout issues.
- Full landing page with the mascot in the conversation: `shots/mascot-landing-desktop.png`; `shots/mascot-landing-report.json` reports no layout issues.
- Phone story states: `shots/mobile-states.png` at 390px. The state sheet was visually reviewed.
- Full landing page at 1440px, with the completed chat story: `shots/host-desktop-layout.png`. `shots/host-desktop-layout-report.json` reports no layout issues across 5 controls and 6 padded containers.
- Full landing page at 390px: `shots/host-layout.png`. `shots/host-layout-report.json` reports no layout issues across 2 controls and 3 padded containers.
- Desktop motion contact sheet: `shots/wide.png`. `shots/wide-report.json` is inconclusive and reports a 1.1px settle shift on the code block and its descendants.
- Phone motion contact sheet: `shots/mobile.png`. `shots/mobile-report.json` found no motion candidates, but its capture is inconclusive.
- Phone story-state sheet: `shots/mobile-states.png`. `shots/mobile-states-report.json` is inconclusive and reports a 0.6px settle shift on the streamed answer and code descendants.

## Validation and limits

- `pnpm --dir apps/web typecheck` passed.
- Stageshow still gates passed at both shipping widths. The mobile state capture also passed the required framing and crop gate.
- Motion capture is not signed off: Chrome's animation-frame recorder reported 91 gaps on desktop (largest 563ms) and 89 gaps on mobile (largest 582ms). Motion during those gaps was not judged.
- Captures used headless Chrome at desktop and CSS 390px viewport widths. They do not emulate a physical phone or touch input.
- Playback interruption, tab visibility/offscreen pause and resume, live reduced-motion toggling, and real-device touch behavior still need a manual pass.
- The development-only Next.js indicator appears in the page capture gutter; it is not part of the landing page or demo.
