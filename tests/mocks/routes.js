async function wireMockRoutes(page, opts = {}) {
    const base = opts.base ?? process.env.BASE_URL ?? 'https://api-test.fooddelivery.com';
    const mock = typeof opts.mock === 'boolean'
      ? opts.mock
      : String(process.env.MOCK).toLowerCase() === 'true';
  
    if (!mock) {
      return { base, mock };
    }

    await page.route(`${base}/api/v1/menu/select`, async route => {
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
            quantity: 2,
        }
      }

      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockResponseBody),
      });
    });
  
    return { base, mock };
  }
  
  module.exports = { wireMockRoutes };
  