/**
 * API 호출 헬퍼 함수
 * MOCK 환경에 따라 적절한 API 호출 방식을 선택합니다.
 * MOCK=true 일 때는 브라우저 컨텍스트에서 실행 -> evaluate을 통해 URL 가로채서 모킹 처리
 * MOCK=false 일 때는 Node.js 환경에서 실행 -> request API 사용하여 실제 API 호출
 */

async function callPostApi(page, request, url, payload, headers) {
  if (process.env.MOCK === 'true') {
    // MOCK=true일 때는 page.evaluate 사용 (브라우저 컨텍스트에서 실행)
    return await page.evaluate(async ({ url, body, headers }) => {
      const r = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body),
      });
      return { status: r.status, body: await r.json() };
    }, { url: url, body: payload, headers: headers });
  } else {
    // MOCK=false일 때는 request API 사용 (Node.js 환경에서 실행)
    const response = await request.post(url, {
      data: payload,
      headers: headers
    });
    return {
      status: response.status(),
      body: await response.json()
    };
  }
}


async function callGetApi(page, request, url, headers = {}) {
  if (process.env.MOCK === 'true') {
    // MOCK=true일 때는 page.evaluate 사용 (브라우저 컨텍스트에서 실행)
    return await page.evaluate(async ({ url, headers }) => {
      const r = await fetch(url, {
        method: 'GET',
        headers: headers,
      });
      return { status: r.status, body: await r.json() };
    }, { url: url, headers: headers });
  } else {
    // MOCK=false일 때는 request API 사용 (Node.js 환경에서 실행)
    const response = await request.get(url, {
      headers: headers
    });
    return {
      status: response.status(),
      body: await response.json()
    };
  }
}

module.exports = {
  callPostApi,
  callGetApi
};
