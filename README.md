# Cadi - AI 옷장 스타일링 서비스

보유한 의류 사진을 등록하면 AI가 상황에 맞는 착장과 어울리는 MCM 가방을 추천해주는 웹 서비스입니다.

## 주요 기능

- **랜딩 오프닝**: 서비스 소개와 시작하기 흐름
- **온보딩**: 회원가입, 로그인, 데이터 활용 동의
- **내 옷장**: 의류 사진 등록 및 AI 분석(카테고리/색상/스타일), 카테고리 필터, 가로형 카드 목록
- **AI 스타일링 추천**: 착용 장소, 방문 목적, 날씨, 시간대 입력 시 보유 의류 조합 추천
- **데이터 관리**: 등록된 의류 데이터 확인 및 관리

## 기술 스택

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Supabase (데이터베이스, 인증, Edge Functions)
- lucide-react (아이콘)

## 시작하기

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 타입 체크
npm run typecheck
```

## 환경 변수

`.env` 파일에 아래 항목을 설정합니다.

```
VITE_SUPABASE_URL=<Supabase 프로젝트 URL>
VITE_SUPABASE_ANON_KEY=<Supabase anon key>
```

## 프로젝트 구조

```
src/
├── App.tsx                      # 랜딩 → 온보딩 → 메인 흐름
├── MainService.tsx              # 옷장, 스타일링, 데이터 관리 메인
├── components/
│   ├── LandingOpening.tsx       # 랜딩 오프닝 화면
│   ├── Onboarding.tsx           # 회원가입/로그인/동의
│   ├── ClosetUploadFlow.tsx     # 의류 사진 업로드 및 AI 분석
│   └── ui.tsx                   # 공통 UI 컴포넌트
├── lib/supabase.ts              # Supabase 클라이언트
├── services/ai.ts               # AI 호출 서비스
└── types.ts                     # 타입 정의
supabase/
├── migrations/                  # 데이터베이스 마이그레이션
└── functions/cadi-ai/           # AI Edge Function
```

## 라이선스

본 프로젝트는 비공개 프로젝트입니다.
