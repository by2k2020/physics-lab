# 가상 물리 실험실 (physics-lab)

코딩더메이커 수업용 물리 실험 시뮬레이터.
레고 스키 미니피겨 경사면 실험과 갈릴레이 자유낙하가 **"질량은 결과를 바꾸지 못한다"**는
같은 원리임을 확인하는 수업 도구다.

구조: 루트 `index.html` = 과정별 시뮬레이터 허브 / 시뮬레이터는 각자 폴더(`ski-slope/` 등).

- 브릭 프라임 과정 · **스키 슬로프 시뮬레이션** (`ski-slope/`) — 경사면 활주 + 갈릴레이 낙하, 공기저항 토글, 슬로모션, v-t 그래프, 기록 테이블
- 새 시뮬레이터 추가법: ① 새 폴더에 `index.html` 작성 ② 루트 `index.html`의 COURSES 배열에 한 줄 추가
- 외부 라이브러리 없음, 태블릿 동작, 고해상도(DPR) 렌더링

접속 주소 ──────────────────────────────── https://by2k2020.github.io/physics-lab/

## 재배포 (한 줄)

`index.html` 수정 후:

```
git add -A && git commit -m "update" && git push
```

push하면 GitHub Pages가 1~2분 내 자동 재배포한다. (Pages 설정: main 브랜치 / 루트)
