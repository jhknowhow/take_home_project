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

        
        const timestamp = new Date();
        const reservationExpiresAt = new Date(timestamp.getTime() + 5 * 60 * 1000).toISOString();
        
        const mockResponseBody = {
            status: 'SUCCESS',
            message: '메뉴 예약이 완료되었습니다.',
            timestamp: timestamp.toISOString(),
            data: { 
                reservationId:"RSV_A7K9M2X8",
                reservationExpiresAt: reservationExpiresAt,
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

        const timestamp = new Date();
        const reservationExpiresAt = new Date(timestamp.getTime() + 5 * 60 * 1000).toISOString();

        const mockResponseBody = {
            status: 'SUCCESS',
            message: '메뉴 예약이 완료되었습니다.',
            timestamp: timestamp.toISOString(),
            data: { 
                reservationId:"RSV_A7K9M2X8",
                reservationExpiresAt: reservationExpiresAt,
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

        const timestamp = new Date();
        const reservationExpiresAt = new Date(timestamp.getTime() + 5 * 60 * 1000).toISOString();

        const mockResponseBody = {
            status: 'SUCCESS',
            message: '메뉴 예약이 완료되었습니다.',
            timestamp: timestamp.toISOString(),
            data: { 
                reservationId:"RSV_A7K9M2X8",
                reservationExpiresAt: reservationExpiresAt,
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
            message: '주문하신 수량만큼 재료가 부족합니다.',
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

    //MS-012
    await page.route(`${base}/api/v1/menu/select/400/QUANTITY_MISSING`, async route => {
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

    //MS-013
    await page.route(`${base}/api/v1/menu/select/400/SHOP_ID_MISSING`, async route => {
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

    //MS-014
    await page.route(`${base}/api/v1/menu/select/400/MEMBER_NO_MISSING`, async route => {
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

    //MS-015
    await page.route(`${base}/api/v1/menu/select/400/QUANTITY_STRING`, async route => {
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

    //MS-016
    await page.route(`${base}/api/v1/menu/select/400/CONTENT_TYPE_TEXT_PLAIN`, async route => {
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

    //MS-017
    await page.route(`${base}/api/v1/menu/select/401/AUTHORIZATION_MISSING`, async route => {
        const req = route.request();
        if (req.method() !== 'POST') return route.fallback();

        const mockResponseBody = {
            status: 'ERROR',
            errorCode :"INVALID_REQUEST",
            message: '잘못된 요청',
            timestamp: new Date().toISOString(),
        }
        return route.fulfill({
            status: 401,
            contentType: 'application/json',
            body: JSON.stringify(mockResponseBody),
        });
    });

    //MS-018
    await page.route(`${base}/api/v1/menu/select/401/AUTHORIZATION_FORMAT_ERROR`, async route => {
        const req = route.request();
        if (req.method() !== 'POST') return route.fallback();

        const mockResponseBody = {
            status: 'ERROR',
            errorCode :"INVALID_REQUEST",
            message: '잘못된 요청',
            timestamp: new Date().toISOString(),
        }
        return route.fulfill({
            status: 401,
            contentType: 'application/json',
            body: JSON.stringify(mockResponseBody),
        });
    });

    //MS-019
    await page.route(`${base}/api/v1/menu/select/400/MENU_ID_NULL`, async route => {
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

    //MS-020
    await page.route(`${base}/api/v1/menu/select/400/MENU_ID_EMPTY`, async route => {
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

    //OS-001
    await page.route(`${base}/api/v1/order/create`, async route => {
        const req = route.request();
        if (req.method() !== 'POST') return route.fallback();

        // POST 요청의 payload 데이터 가져오기
        const requestBody = req.postDataJSON() || {};
        
        const mockResponseBody = {
            status: 'SUCCESS',
            message: '주문이 성공적으로 완료되었습니다.',
            timestamp: new Date().toISOString(),
            data: {
                orderNo: "R7X9K2M8",
                orderStatus: "INITIALIZING",
                reservationId: requestBody.reservationId,
                createdAt: new Date().toISOString(),
                memberInfo: {
                    memberNo: requestBody.memberNo
                }
            }
        }
        return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mockResponseBody),
        });
    });

    //OS-002
    await page.route(`${base}/api/v1/order/create/RESERVATION_EXPIRED`, async route => {
        const req = route.request();
        if (req.method() !== 'POST') return route.fallback();

        const mockResponseBody = {
            status: 'ERROR',
            errorCode :"RESERVATION_EXPIRED",
            message: '예약 만료 (5분 초과)',
            timestamp: new Date().toISOString(),
        }
        
        return route.fulfill({
            status: 420,
            contentType: 'application/json',
            body: JSON.stringify(mockResponseBody),
        });
    });

    //OS-003
    await page.route(`${base}/api/v1/order/create/INGREDIENTS_EXHAUSTED`, async route => {
        const req = route.request();
        if (req.method() !== 'POST') return route.fallback();
        
        const mockResponseBody = {
            status: 'ERROR',
            errorCode :"INGREDIENTS_EXHAUSTED",
            message: '예약 후 재료 소진',
            timestamp: new Date().toISOString(),
        }
        return route.fulfill({
            contentType: 'application/json',
            body: JSON.stringify(mockResponseBody),
        });
    });

    //OS-004
    await page.route(`${base}/api/v1/order/create/INVALID_RESERVATION`, async route => {
        const req = route.request();
        if (req.method() !== 'POST') return route.fallback();

        const mockResponseBody = {
            status: 'ERROR',
            errorCode :"INVALID_RESERVATION",
            message: '유효하지 않은 예약',
            timestamp: new Date().toISOString(),
        }
        return route.fulfill({
            contentType: 'application/json',
            body: JSON.stringify(mockResponseBody),
        });
    });

    return { base, mock };
  }
  
  module.exports = { wireMockRoutes };
  