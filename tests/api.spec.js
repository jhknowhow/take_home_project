const { test, expect } = require('@playwright/test');
const { wireMockRoutes } = require('./mocks/routes');

test.describe('메뉴 예약 API 테스트 - /api/v1/menu/select', () => {
  const base = 'https://api-test.fooddelivery.com';

  test.beforeEach(async ({ page }) => {
    await wireMockRoutes(page, { base: base });
    await page.goto('data:text/html,<meta charset=utf-8>');
  });

  test('POST 정상요청 -> 200', async ({ page }) => {
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

    const result = await page.evaluate(async ({ url, body, headers }) => {
      const r = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body),
      });
      return { status: r.status, body: await r.json() };
    }, { url: `${base}/api/v1/menu/select`, body: payload, headers: headers }); 
    
     expect(result.status).toBe(200);
     expect(result.body.status).toBe('SUCCESS');
     expect(result.body.data.reservationId).toBe('RSV_A7K9M2X8');
     expect(result.body.data.reservationExpiresAt).toBe('2025-08-14T12:00:00.000Z');
     expect(result.body.data.menuId).toBe('menu_001');
     expect(result.body.data.quantity).toBe(2);
  
  });
});
