# 已实现功能

## 音频引擎
- Piano 模式：8 个正弦谐波叠加合成（多谐波加法合成）
- Synthesizer 模式：3 个失谐锯齿波振荡器（detune: -7, 0, +7 音分）
- ADSR 包络（Attack + Release 参数可调）
- 低通滤波器（Cutoff 旋钮，20Hz–20kHz 对数映射）
- Delay 效果（Delay 旋钮控制延迟时间，含 feedback 回路）
- Master Gain（音量旋钮 0–100%）
- 浏览器自动播放策略处理（Initialize Audio / Stop All 按钮）
- Stop All：一键停止所有正在发声的音符

## 钢琴键盘
- 两八度键盘（C4–B5），14 个白键 + 10 个黑键
- 鼠标点击/触摸演奏
- 电脑键盘映射演奏（A-J 低音区，K-C 高音区，W/U/O/P 等黑键）
- 激活态视觉反馈（蓝色高亮）

## 控制界面
- Sound Mode 切换（Piano / Synthesizer）
- 5 个 SVG 旋钮（Attack、Release、Delay、Cutoff、Gain），支持拖拽调节和双击归零
- 模式说明文字区域
- 底部键盘映射说明
- 底部工具栏
