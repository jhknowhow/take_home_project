const { test, expect } = require('@playwright/test');
const { wireMockRoutes } = require('./mocks/routes');
const { callPostApi, callGetApi } = require('./helpers/api-helper');

const DOMAIN = 'https://api-test.fooddelivery.com';
const DOMAIN_LOCAL = 'http://localhost';
const API_URL = {
  MENU_SELECT: '/api/v1/menu/select',
  ORDER: '/api/v1/order'
}

test.describe('메뉴 예약 API 테스트(api/v1/menu/select)', () => {
  
  test.beforeEach(async ({ page }) => {
    await wireMockRoutes(page);
    await page.goto('data:text/html,<meta charset=utf-8>');
  });

  test('로컬 테스트', async ({ page, request }) => {
    const url = process.env.MOCK === 'true' ? `${DOMAIN}/projects` : `${DOMAIN_LOCAL}/projects`;
    const result = await callGetApi(page, request, url);
  });

  test('MS-001 : 메뉴 예약 성공 -> 200', async ({ page, request }) => {
    const url = `${DOMAIN}${API_URL.MENU_SELECT}`;    
    const payload = {
      "menuId": "menu_001",
      "quantity": 2,
      "shopId": "shop_001",
      "memberNo": "member_123"
    }

    const headers = { 
      'content-type': 'application/json', 
      'Authorization': 'Bearer test-api-token-1234567890' 
    };

    const result = await callPostApi(page, request, url, payload, headers);
    
     expect(result.status).toBe(200);
     expect(result.body.status).toBe('SUCCESS');
     expect(result.body.data.reservationId).toBe('RSV_A7K9M2X8');
     expect(result.body.data.reservationExpiresAt).toBe('2025-08-14T12:00:00.000Z');
     expect(result.body.data.menuId).toBe('menu_001');
     expect(result.body.data.quantity).toBe(2);
  
  });

  test('MS-002 : 수량 경계 하한(=1) -> 200', async ({ page, request }) => {
    const url = process.env.MOCK === 'true' ? `${DOMAIN}${API_URL.MENU_SELECT}/200/QUANTITY_MIN_BOUND` : `${DOMAIN}${API_URL.MENU_SELECT}`;
    const payload = {
      "menuId": "menu_001",
      "quantity": 1,
      "shopId": "shop_001",
      "memberNo": "member_123"
    }

    const headers = { 
      'content-type': 'application/json', 
      'Authorization': 'Bearer test-api-token-1234567890' 
    };

    const result = await callPostApi(page, request, url, payload, headers);

    expect(result.status).toBe(200);
    expect(result.body.status).toBe('SUCCESS');
    expect(result.body.data.reservationId).toBe('RSV_A7K9M2X8');
    expect(result.body.data.reservationExpiresAt).toBe('2025-08-14T12:00:00.000Z');
    expect(result.body.data.menuId).toBe('menu_001');
    expect(result.body.data.quantity).toBe(1);
  });

  test('MS-003 : 수량 경계 상한(=99) -> 200', async ({ page, request }) => {
    const url = process.env.MOCK === 'true' ? `${DOMAIN}${API_URL.MENU_SELECT}/200/QUANTITY_MAX_BOUND` : `${DOMAIN}${API_URL.MENU_SELECT}`;
    const payload = {
      "menuId": "menu_001",
      "quantity": 99,
      "shopId": "shop_001",
      "memberNo": "member_123"
    }

    const headers = { 
      'content-type': 'application/json', 
      'Authorization': 'Bearer test-api-token-1234567890' 
    };

    const result = await callPostApi(page, request, url, payload, headers); 

    expect(result.status).toBe(200);
    expect(result.body.status).toBe('SUCCESS');
    expect(result.body.data.reservationId).toBe('RSV_A7K9M2X8');
    expect(result.body.data.reservationExpiresAt).toBe('2025-08-14T12:00:00.000Z');
    expect(result.body.data.menuId).toBe('menu_001');
    expect(result.body.data.quantity).toBe(99);
  });

  test('MS-004 : 수량 상한 초과(=100) -> 400', async ({ page, request }) => {
    const url = process.env.MOCK === 'true' ? `${DOMAIN}${API_URL.MENU_SELECT}/400/QUANTITY_MAX_BOUND` : `${DOMAIN}${API_URL.MENU_SELECT}`;
    const payload = {
      "menuId": "menu_001",
      "quantity": 100,
      "shopId": "shop_001",
      "memberNo": "member_123"
    }
    
    const headers = { 
      'content-type': 'application/json', 
      'Authorization': 'Bearer test-api-token-1234567890' 
    };

    const result = await callPostApi(page, request, url, payload, headers);

    expect(result.status).toBe(400);
    expect(result.body.errorCode).toBe('INVALID_REQUEST');
    expect(result.body.message).toBe('잘못된 요청');
  });

  test('MS-005 : 수량=0 -> 400', async ({ page, request }) => {
    const url = process.env.MOCK === 'true' ? `${DOMAIN}${API_URL.MENU_SELECT}/400/QUANTITY_ZERO` : `${DOMAIN}${API_URL.MENU_SELECT}`;
    const payload = {
      "menuId": "menu_001",
      "quantity": 0,
      "shopId": "shop_001",
      "memberNo": "member_123"
    }

    const headers = { 
      'content-type': 'application/json', 
      'Authorization': 'Bearer test-api-token-1234567890' 
    };

    const result = await callPostApi(page, request, url, payload, headers);

    expect(result.status).toBe(400);
    expect(result.body.errorCode).toBe('INVALID_REQUEST');
    expect(result.body.message).toBe('잘못된 요청');
  });

  test('MS-006 : 수량 음수(-1) -> 400', async ({ page, request }) => {
    const url = process.env.MOCK === 'true' ? `${DOMAIN}${API_URL.MENU_SELECT}/400/QUANTITY_NEGATIVE` : `${DOMAIN}${API_URL.MENU_SELECT}`;
    const payload = {
      "menuId": "menu_001",
      "quantity": -1,
      "shopId": "shop_001",
      "memberNo": "member_123"
    }

    const headers = { 
      'content-type': 'application/json', 
      'Authorization': 'Bearer test-api-token-1234567890' 
    };

    const result = await callPostApi(page, request, url, payload, headers);

    expect(result.status).toBe(400);
    expect(result.body.errorCode).toBe('INVALID_REQUEST');
    expect(result.body.message).toBe('잘못된 요청');  
  });

  test('MS-007 : memberNo 정상(=member_123) -> 200', async ({ page, request }) => {
    const url = `${DOMAIN}${API_URL.MENU_SELECT}`;
    const payload = {
      "menuId": "menu_001",
      "quantity": 1,
      "shopId": "shop_001",
      "memberNo": "member_123"
    }

    const headers = { 
      'content-type': 'application/json', 
      'Authorization': 'Bearer test-api-token-1234567890' 
    };

    const result = await callPostApi(page, request, url, payload, headers);

    expect(result.status).toBe(200);
    expect(result.body.status).toBe('SUCCESS');
    expect(result.body.data.reservationId).toBe('RSV_A7K9M2X8');
    expect(result.body.data.reservationExpiresAt).toBe('2025-08-14T12:00:00.000Z');
    expect(result.body.data.menuId).toBe('menu_001');
    expect(result.body.data.quantity).toBe(2);
  });

  test('MS-008 : memberNo 타입오류(=integer) -> 400', async ({ page, request }) => {
    const url = process.env.MOCK === 'true' ? `${DOMAIN}${API_URL.MENU_SELECT}/400/MEMBER_NO_INTEGER` : `${DOMAIN}${API_URL.MENU_SELECT}`;
    const payload = {
      "menuId": "menu_001",
      "quantity": 1,
      "shopId": "shop_001",
      "memberNo": 123
    }

    const headers = { 
      'content-type': 'application/json', 
      'Authorization': 'Bearer test-api-token-1234567890' 
    };

    const result = await callPostApi(page, request, url, payload, headers);

    expect(result.status).toBe(400);
    expect(result.body.errorCode).toBe('INVALID_REQUEST');
    expect(result.body.message).toBe('잘못된 요청');
  });

  test('MS-009 : 메뉴미존재(=menu_001_not_found) -> 400', async ({ page, request }) => {
    const url = process.env.MOCK === 'true' ? `${DOMAIN}${API_URL.MENU_SELECT}/400/MENU_NOT_FOUND` : `${DOMAIN}${API_URL.MENU_SELECT}`;
    const payload = {
      "menuId": "menu_001_not_found",
      "quantity": 2,
      "shopId": "shop_001",
      "memberNo": "member_123"
    }

    const headers = { 
      'content-type': 'application/json', 
      'Authorization': 'Bearer test-api-token-1234567890' 
    };

    const result = await callPostApi(page, request, url, payload, headers);
    
    expect(result.status).toBe(400);
    expect(result.body.errorCode).toBe('MENU_NOT_FOUND');
    expect(result.body.message).toBe('존재하지 않는 메뉴');
  });

  test('MS-010 : 재료 부족 -> 400', async ({ page, request }) => {
    const url = process.env.MOCK === 'true' ? `${DOMAIN}${API_URL.MENU_SELECT}/400/INSUFFICIENT_INGREDIENTS` : `${DOMAIN}${API_URL.MENU_SELECT}`;
    const payload = {
      "menuId": "menu_001",
      "quantity": 50,
      "shopId": "shop_001",
      "memberNo": "member_123"
    }

    const headers = { 
      'content-type': 'application/json', 
      'Authorization': 'Bearer test-api-token-1234567890' 
    };

    const result = await callPostApi(page, request, url, payload, headers); 

    expect(result.status).toBe(400);
    expect(result.body.errorCode).toBe('INSUFFICIENT_INGREDIENTS');
    expect(result.body.message).toBe('재료가 부족합니다.');
  });

  test('MS-011 : menuId 누락(필수값누락) -> 400', async ({ page, request }) => {
    const url = process.env.MOCK === 'true' ? `${DOMAIN}${API_URL.MENU_SELECT}/400/MENU_ID_MISSING` : `${DOMAIN}${API_URL.MENU_SELECT}`;
    const payload = {
      "quantity": 1,
      "shopId": "shop_001",
      "memberNo": "member_123"
    }

    const headers = { 
      'content-type': 'application/json', 
      'Authorization': 'Bearer test-api-token-1234567890' 
    };

    const result = await callPostApi(page, request, url, payload, headers); 

    expect(result.status).toBe(400);
    expect(result.body.errorCode).toBe('INVALID_REQUEST');
    expect(result.body.message).toBe('잘못된 요청');
  });

  test('MS-012 : quantity 누락(필수값누락) -> 400', async ({ page, request }) => {
    const url = `${DOMAIN}${API_URL.MENU_SELECT}`;
    const payload = {
      "menuId": "menu_001",
      "shopId": "shop_001",
      "memberNo": "member_123"
    }
  });
});
