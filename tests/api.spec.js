const { test, expect } = require('@playwright/test');
const { wireMockRoutes } = require('./mocks/routes');
const { callPostApi, callGetApi } = require('./helpers/api-helper');

const MENU_SELECT_URL = '/api/v1/menu/select';
const ORDER_URL = '/api/v1/order';
const DOMAIN = 'https://api-test.fooddelivery.com';
const API_URL = {
  MENU_SELECT: '/api/v1/menu/select',
  ORDER: '/api/v1/order'
}

test.describe('메뉴 예약 API 테스트 - /api/v1/menu/select', () => {
  
  test.beforeEach(async ({ page }) => {
    await wireMockRoutes(page, { domain: DOMAIN });
    await page.goto('data:text/html,<meta charset=utf-8>');
  });

  test('예약 성공 -> 200', async ({ page, request }) => {
    const url = process.env.MOCK ? `${DOMAIN}${API_URL.MENU_SELECT}` : `${DOMAIN}${API_URL.MENU_SELECT}`;
    
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

  test('예약 실패 -> 400 (MENU_NOT_FOUND): 메뉴가 존재하지 않음', async ({ page, request }) => {
    const url = process.env.MOCK ? `${DOMAIN}${API_URL.MENU_SELECT}/400/MENU_NOT_FOUND` : `${DOMAIN}${API_URL.MENU_SELECT}`;

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
});
