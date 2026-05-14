# 技术栈

## 核心
- **React 19** + **TypeScript** — UI 框架
- **Vite 8** — 构建工具
- **Tailwind CSS 4**（@tailwindcss/vite 插件）— 样式

## 音频
- **Web Audio API**（浏览器原生）— 音频合成与效果处理
  - OscillatorNode（正弦波 / 锯齿波）
  - GainNode（包络 ADSR + Master Gain + Delay Feedback）
  - BiquadFilterNode（低通滤波器）
  - DelayNode（延迟效果）

## 项目结构
- `src/hooks/` — 自定义 Hook（useAudioEngine、useKeyboardInput、useKnob）
- `src/components/` — UI 组件
- `src/lib/audio/` — 音频常量与类型定义
- `src/lib/utils.ts` — 工具函数（MIDI→频率、旋钮参数映射等）
