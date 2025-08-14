async function wireMockRoutes(page) {
    const base = process.env.BASE_URL ?? 'https://api-test.fooddelivery.com';
    const mock = process.env.MOCK 
  
    if (!mock) {
      return { base, mock };
    }

    await page.route(`${base}/projects`, async route => {
        const req = route.request();
        if (req.method() !== 'GET') return route.fallback();
        return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ message: 'Hello, world!' }),
        });
    });

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

    //MS-003
    await page.route(`${base}/api/v1/menu/select/200/QUANTITY_MAX_BOUND`, async route => {
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
                quantity: 99,
            }
        }

        return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mockResponseBody),
        });
    });

    //MS-004
    await page.route(`${base}/api/v1/menu/select/400/QUANTITY_MAX_BOUND`, async route => {
        const req = route.request();
        if (req.method() !== 'POST') return route.fallback();

        const mockResponseBody = {
            status: 'ERROR',
            errorCode :"INVALID_REQUEST",
            message: '잘못된 요청',
            timestamp: new Date().toISOString(),
        }

        return route.fulfill({
            status: 400,
            contentType: 'application/json',
            body: JSON.stringify(mockResponseBody),
        });
    }); 

    //MS-005
    await page.route(`${base}/api/v1/menu/select/400/QUANTITY_ZERO`, async route => {
        const req = route.request();
        if (req.method() !== 'POST') return route.fallback();

        const mockResponseBody = {
            status: 'ERROR',
            errorCode :"INVALID_REQUEST",
            message: '잘못된 요청',
            timestamp: new Date().toISOString(),
        }

        return route.fulfill({
            status: 400,
            contentType: 'application/json',
            body: JSON.stringify(mockResponseBody),
        });
    });

    //MS-006
    await page.route(`${base}/api/v1/menu/select/400/QUANTITY_NEGATIVE`, async route => {
        const req = route.request();
        if (req.method() !== 'POST') return route.fallback();

        const mockResponseBody = {
            status: 'ERROR',
            errorCode :"INVALID_REQUEST",
            message: '잘못된 요청',
            timestamp: new Date().toISOString(),
        }

        return route.fulfill({
            status: 400,
            contentType: 'application/json',
            body: JSON.stringify(mockResponseBody),
        });
    });

    //MS-008
    await page.route(`${base}/api/v1/menu/select/400/MEMBER_NO_INTEGER`, async route => {
        const req = route.request();
        if (req.method() !== 'POST') return route.fallback();

        const mockResponseBody = {
            status: 'ERROR',
            errorCode :"INVALID_REQUEST",
            message: '잘못된 요청',
            timestamp: new Date().toISOString(),
        }

        return route.fulfill({
            status: 400,
            contentType: 'application/json',
            body: JSON.stringify(mockResponseBody),
        });
    });

    //MS-009
    await page.route(`${base}/api/v1/menu/select/400/MENU_NOT_FOUND`, async route => {
        const req = route.request();
        if (req.method() !== 'POST') return route.fallback();

        const mockResponseBody = {
            status: 'ERROR',
            errorCode :"MENU_NOT_FOUND",
            message: '존재하지 않는 메뉴',
            timestamp: new Date().toISOString(),
        }

        return route.fulfill({
            status: 400,
            contentType: 'application/json',
            body: JSON.stringify(mockResponseBody),
        });
    });

    //MS-010
    await page.route(`${base}/api/v1/menu/select/400/INSUFFICIENT_INGREDIENTS`, async route => {
        const req = route.request();
        if (req.method() !== 'POST') return route.fallback();

        const mockResponseBody = {
            status: 'ERROR',
            errorCode :"INSUFFICIENT_INGREDIENTS",
            message: '재료가 부족합니다.',
            timestamp: new Date().toISOString(),
        }
        return route.fulfill({
            status: 400,
            contentType: 'application/json',
            body: JSON.stringify(mockResponseBody),
        });
    });
    

    //MS-011
    await page.route(`${base}/api/v1/menu/select/400/MENU_ID_MISSING`, async route => {
        const req = route.request();
        if (req.method() !== 'POST') return route.fallback();

        const mockResponseBody = {
            status: 'ERROR',
            errorCode :"INVALID_REQUEST",
            message: '잘못된 요청',
            timestamp: new Date().toISOString(),
        }

        return route.fulfill({
            status: 400,
            contentType: 'application/json',
            body: JSON.stringify(mockResponseBody),
        });
    });
    
    
    return { base, mock };
  }
  
  module.exports = { wireMockRoutes };
  