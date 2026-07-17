# 가상실험실 (physics-lab)

코딩더메이커 수업용 실험 시뮬레이터 모음 — 통합 허브.
레고 스키 미니피겨 경사면 실험과 갈릴레이 자유낙하가 **"질량은 결과를 바꾸지 못한다"**는
같은 원리임을 확인하는 수업 도구다.

구조: 루트 `index.html` = 과정별 시뮬레이터 허브 / 시뮬레이터는 각자 폴더(`ski-slope/` 등).

- 브릭 프라임 과정 · **스키 슬로프 시뮬레이션** (`ski-slope/`) — 경사면 활주 + 갈릴레이 낙하, 공기저항 토글, 슬로모션, v-t 그래프, 기록 테이블
- 브릭 프라임 과정 · **기어비 시뮬레이션** (`gear-ratio/`)
- 항공 · 드론 과정 · **요·피치·롤 비행 시뮬레이션** (`flight-attitude/`)
- 수업 시뮬레이터(AI 생성)는 index.html이 수업 PT API(hub.ctmrobotics.com/lessons/)에서 동적 로드
- 새 시뮬레이터 추가법: ① 새 폴더에 `index.html` 작성 ② 루트 `index.html`의 COURSES 배열에 한 줄 추가
- 외부 라이브러리 없음, 태블릿 동작, 고해상도(DPR) 렌더링

## 사본 구조 (진본은 여기 하나)

- **진본**: `프로젝트/시뮬레이터` — 게이트웨이 `physics` 시스템이 직접 서빙
- **외부 미러**: `프로젝트/physics-lab` — GitHub Pages 배포용, 진본에서 통째로 복사
- **앱 미러**: `프로젝트/시뮬레이터-app/web` — Electron 포터블 앱 패키징용, 진본에서 통째로 복사
- 수정은 항상 진본에서 → 두 미러로 복사 (robocopy /MIR /XD .git)

접속 주소 ──────────────────────────────── https://by2k2020.github.io/physics-lab/

## 재배포 (한 줄)

진본 수정 후 `physics-lab`에 복사하고:

```
git add -A && git commit -m "update" && git push
```

push하면 GitHub Pages가 1~2분 내 자동 재배포한다. (Pages 설정: main 브랜치 / 루트)
