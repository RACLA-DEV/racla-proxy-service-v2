# RACLA Proxy Service

[RACLA](https://r-archive.zip)에서 [V-ARCHIVE](https://v-archive.net), [전일 아카이브](https://hard-archive.com) 등 외부 API 또는 서비스와의 CORS 이슈를 해결하기 위한 프록시 서비스입니다.    
기존에 사용하던 프록시 서비스를 너무 대충 짠 나머지 Vite 기반의 RACLA 데스크톱 앱에서 사용할려고 똑같은 베이스로 만들어만 놓았다가    
결국에는 사용하지 않고 스프링 부트 3와 스프링 클라우드 기반으로 재작성된 [RACLA-DEV/racla-spring-proxy-service-v2](https://github.com/RACLA-DEV/racla-spring-proxy-service)를 사용합니다. ~(개발자 능지 이슈)~

## 설치 및 실행

```bash
yarn install #or npm install
yarn start #or npm run start
```

## API 명세

### 프록시 요청 엔드포인트

- **URL**: `/api/v2/proxy`
- **Method**: `POST`
- **Content-Type**: `application/json`

### 요청 인터페이스

```typescript
interface ProxyRequest {
  method: 'GET' | 'POST';    // 대상 서버에 보낼 요청 메소드
  url: string;               // 대상 서버 URL
  type: 'query' | 'body';    // 데이터 전송 방식
  data: {                    // 전송할 데이터
    [key: string]: any;
    headers?: {              // 요청 헤더 (선택사항)
      Authorization?: string;
      Cookie?: string;
      [key: string]: string;
    };
  };
}
```

### 사용 예시

[V-ARCHIVE Open API](https://github.com/djmax-in/openapi)에서 제공하는 개발용 계정을 사용하여 요청하는 예시입니다.

1. GET 요청 with Query Parameters
```typescript
{
  "method": "GET",
  "url": "https://v-archive.net/api/db/comments",
  "type": "query",
  "data": {
    "page": 0,
    "order": "ymdt",
    "headers": {
        "Cookie": "Authorization=1|95d6c422-52b4-4016-8587-38c46a2e7917"
    }
  }
}
```
위 요청은 다음과 같이 변환됩니다: `GET https://v-archive.net/api/db/comments?page=0&order=ymdt`

2. POST 요청 with Body
```typescript
{
  "method": "POST",
  "url": "https://v-archive.net/client/open/1/score",
  "type": "body",
  "data": {
    "name": "Urban Night",
    "dlc": "EMOTIONAL S.",
    "composer": "Electronic Boutique",
    "button": 6,
    "pattern": "SC",
    "score": 90.9,
    "maxCombo": 0,
    "headers": {
      "Authorization": "95d6c422-52b4-4016-8587-38c46a2e7917",
      "Content-Type": "application/json"
    }
  }
}
```

### 응답 형식

```typescript
interface ProxyResponse {
  statusCode: number;           // HTTP 상태 코드
  data?: any;              // 응답 데이터
  error?: string;          // 에러 메시지 (에러 발생 시)
}
```

### 주의사항

1. 허용된 도메인
   - https://v-archive.net
   - https://hard-archive.com
   - 다른 도메인으로의 요청은 403 Forbidden 에러가 발생합니다. 만약 추가 도메인이 필요하다면 프록시 서버 코드를 수정해야 합니다.

2. 보안
   - 민감한 인증 정보는 headers를 통해 전달하세요.
   - CSRF 토큰 적용을 권장합니다.
   - HTTPS 사용을 권장합니다.

3. 에러 처리
   - 잘못된 URL 형식: 400 Bad Request
   - 허용되지 않은 도메인: 403 Forbidden
   - 서버 에러: 500 Internal Server Error

## 개발 환경

- Node.js
- NestJS
- TypeScript
