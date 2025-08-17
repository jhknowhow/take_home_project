# Take Home Project - API 테스트 자동화

## 프로젝트 개요

이 프로젝트는 음식 배달 서비스의 메뉴 예약 API를 테스트하는 자동화된 테스트 스위트입니다. Playwright를 사용하여 API 엔드포인트의 다양한 시나리오를 검증합니다.

**지원자**: 박준호

## 기술 스택

- **테스트 프레임워크**: Playwright
- **언어**: JavaScript
- **모킹**: Playwright Route API
- **패키지 관리**: npm

## 프로젝트 구조

```
take_home_project/
├── package.json              # 프로젝트 설정 및 의존성
├── playwright.config.js      # Playwright 설정
├── tests/
│   ├── api.spec.js          # 메인 API 테스트 케이스 파일
│   ├── helpers/
│   │   └── api-helper.js    # API 호출 헬퍼 함수 (mock 모드일때는 미리 정의된 url로 호출. 아닐때는 실서버 호출)
│   └── mocks/
│       └── routes.js        # Mock 라우트 설정 (mock 모드일때 테스트 케이스별 url 정의)
├── playwright-report/        # 테스트 리포트 (자동 생성)
└── test-results/            # 테스트 결과 (자동 생성)
```

## 동작 방식 및 고려사항

실제 API 서버가 존재하지 않음으로 모킹환경을 구성하여 실행

```
모킹환경은 Playwright route API를 사용하여 구현하였으며, 실제 API 서버를 호출하는것이 아니라 네트워크 요청을 가로채어 미리 정의된 응답값을 반환하도록 하였습니다. 이를 통해 성공, 실패, 에러 등 다양한 테스트 케이스를 API 서버 없이 동작가능하도록 하였습니다.
```


#### api.spec.js

각 테스트 케이스별로 mock 모드일때 url을 분기

```
const url = process.env.MOCK === 'true' ? `${DOMAIN}${API_URL.MENU_SELECT}/200/QUANTITY_MIN_BOUND` : `${DOMAIN}${API_URL.MENU_SELECT}`;
```

#### route.js

모킹모드일 경우만 route 동작하며 테스트 케이스별 URL 및 응답값 정의

```
    //MS-002
    await page.route(`${base}/api/v1/menu/select/200/QUANTITY_MIN_BOUND`, async route => {

        const req = route.request();
        if (req.method() !== 'POST') return route.fallback();

        const mockResponseBody = {
            status: 'SUCCESS',
            message: '메뉴 예약이 완료되었습니다.',
            timestamp: new Date().toISOString(),
            data: { 
                reservationId:"RSV_A7K9M2X8",
                reservationExpiresAt: "2025-08-14T12:00:00.000Z",
                menuId: "menu_001",
                quantity: 1,
            }
        }

        return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mockResponseBody),
        });
    });
```









## 실행방법

> GithubAction 이나 로컬 실행 2가지중 선택하여 실행

### Github Action으로 실행 (추천)

1. github 저장소 상단 메뉴 Actions 선택
2. 좌측 Actions > API 테스트 (Playwright) 선택
3. 본문 > Run workflow 셀렉트 박스 선택
4. 브랜치 및 테스트 환경 선택 (실세 서버가 없음으로 mock 환경 권장)

![GithubAction_01](/image/githubaction_01.png)
![GithubAction_02](/image/githubaction_02.png)
![GithubAction_03](/image/githubaction_03.png)
![GithubAction_04](/image/githubaction_04.png)



### 로컬 실행 

### 1. 의존성 설치

```bash
npm install
```

### 2. 테스트 실행

#### Mock 환경에서 테스트 실행
```bash
npm run test:mock
```

#### 실제 API 환경에서 테스트 실행
```bash
npm run test:qa
```

#### 기본 테스트 실행
```bash
npm test
```

## 테스트 시나리오

### 메뉴 예약 API (`/api/v1/menu/select`)

#### 성공 케이스
- **MS-001**: 메뉴 예약 성공 (200)
- **MS-002**: 수량 경계 하한(=1) (200)
- **MS-003**: 수량 경계 상한(=99) (200)
- **MS-007**: memberNo 정상값 (200)

#### 실패 케이스
- **MS-004**: 수량 상한 초과(=100) (400)
- **MS-005**: 수량=0 (400)
- **MS-006**: 수량 음수(-1) (400)
- **MS-008**: memberNo 타입 오류 (400)
- **MS-009**: 메뉴 미존재 (400)
- **MS-010**: 재료 부족 (400)
- **MS-011**: menuId 누락 (400)
- **MS-012**: quantity 누락 (400)
- **MS-013**: shopId 누락 (400)
- **MS-014**: memberNo 누락 (400)
- **MS-015**: quantity 타입 오류 (400)
- **MS-016**: content-type 오류 (400)
- **MS-017**: Authorization 누락 (401)
- **MS-018**: Authorization 형식 오류 (401)
- **MS-019**: menuId Null (400)
- **MS-020**: menuId 빈값 (400)

### 주문 생성 API  (`/api/v1/order/create`)

#### 성공 케이스
- **OS-001**: 주문 생성 성공 (200)

#### 실패 케이스
- **OS-002**: 예약 시간 만료
- **OS-003**: 예약 후 재료 소진
- **OS-004**: 유효하지 않은 예약

## API 스펙

### 요청 형식

```json
{
  "menuId": "menu_001",
  "quantity": 2,
  "shopId": "shop_001",
  "memberNo": "member_123"
}
```

### 응답 형식

#### 성공 응답 (200)
```json
{
  "status": "SUCCESS",
  "message": "메뉴 예약이 완료되었습니다.",
  "timestamp": "2025-08-14T12:00:00.000Z",
  "data": {
    "reservationId": "RSV_A7K9M2X8",
    "reservationExpiresAt": "2025-08-14T12:00:00.000Z",
    "menuId": "menu_001",
    "quantity": 2
  }
}
```

#### 에러 응답 (400)
```json
{
  "status": "ERROR",
  "errorCode": "INVALID_REQUEST",
  "message": "잘못된 요청",
  "timestamp": "2025-08-14T12:00:00.000Z"
}
```

## 환경 설정

### 환경 변수

- `MOCK`: Mock 환경 사용 여부 (`true`/`false`)
- `BASE_URL`: API 기본 URL (기본값: `https://api-test.fooddelivery.com`)

### Mock 환경

Mock 환경에서는 Playwright의 Route API를 사용하여 네트워크 요청을 가로채고 미리 정의된 응답을 반환합니다. 이를 통해 실제 API 서버 없이도 테스트를 실행할 수 있습니다.

### 실제 API 환경

실제 API 환경에서는 Node.js의 request API를 사용하여 실제 서버에 요청을 보냅니다.

## 헬퍼 함수

### `callPostApi(page, request, url, payload, headers)`

POST 요청을 보내는 헬퍼 함수입니다. Mock 환경에 따라 적절한 API 호출 방식을 선택합니다.

### `callGetApi(page, request, url, headers)`

GET 요청을 보내는 헬퍼 함수입니다. Mock 환경에 따라 적절한 API 호출 방식을 선택합니다.

## 테스트 실행 결과

테스트 실행 후 다음 디렉토리에 결과가 생성됩니다:

- `playwright-report/`: HTML 형태의 상세한 테스트 리포트
- `test-results/`: 테스트 실행 결과 및 스크린샷

## 개발 가이드

### 새로운 테스트 케이스 추가

1. `tests/api.spec.js`에 새로운 테스트 케이스를 추가
2. Mock 환경을 사용하는 경우 `tests/mocks/routes.js`에 해당 라우트 추가
3. 테스트 실행하여 검증

### Mock 응답 수정

`tests/mocks/routes.js` 파일에서 각 테스트 케이스에 해당하는 Mock 응답을 수정할 수 있습니다.

## 의존성

### 개발 의존성
- `@playwright/test`: Playwright 테스트 프레임워크
- `@stoplight/prism-cli`: API 모킹 도구
- `@types/node`: Node.js 타입 정의
- `wait-on`: 프로세스 대기 유틸리티

### 런타임 의존성
- `express`: 웹 서버 프레임워크 (필요시 사용)

## 라이선스

ISC License
