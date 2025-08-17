const { test, expect } = require('@playwright/test');
const { wireMockRoutes } = require('./mocks/routes');
const { callPostApi } = require('./helpers/api-helper');

const DOMAIN = 'https://api-test.fooddelivery.com';

const API_URL = {
  MENU_SELECT: '/api/v1/menu/select',
  ORDER_CREATE: '/api/v1/order/create'
}

test.describe('메뉴 예약 API 테스트(api/v1/menu/select)', () => {
  
  test.beforeEach(async ({ page }) => {
    await wireMockRoutes(page);
    await page.goto('data:text/html,<meta charset=utf-8>');
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
      'content-type': 'application/json;charset=UTF-8', 
      'Authorization': 'Bearer test-api-token-12345' 
    };

    const result = await callPostApi(page, request, url, payload, headers);
    
    //응답시간에서 5분 뒤의 시간으로 예약만료시간 예상하여 검증
    const expectedReservationExpiresAt = new Date(new Date(result.body.timestamp).getTime() + 5 * 60 * 1000).toISOString();

     expect(result.status).toBe(200); // 응답 코드
     expect(result.body.status).toBe('SUCCESS'); // 응답 상태
     expect(result.body.message).toBe('메뉴 예약이 완료되었습니다.'); // 응답 메시지
     expect(result.body.data.reservationId).toBeDefined(); // 예약ID
     expect(result.body.data.reservationExpiresAt).toBeDefined(); // 예약시간
     expect(result.body.data.reservationExpiresAt).toBe(expectedReservationExpiresAt); // 예약 만료시간 검증
     expect(result.body.data.menuId).toBe('menu_001'); // 메뉴ID
     expect(result.body.data.quantity).toBe(2); // 수량
  
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
      'content-type': 'application/json;charset=UTF-8', 
      'Authorization': 'Bearer test-api-token-12345' 
    };

    const result = await callPostApi(page, request, url, payload, headers);

    expect(result.status).toBe(200);
    expect(result.body.status).toBe('SUCCESS');
    expect(result.body.data.reservationExpiresAt).toBeDefined();
     
    const expectedReservationExpiresAt = new Date(new Date(result.body.timestamp).getTime() + 5 * 60 * 1000).toISOString();
    expect(result.body.data.reservationExpiresAt).toBe(expectedReservationExpiresAt);
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
      'content-type': 'application/json;charset=UTF-8', 
      'Authorization': 'Bearer test-api-token-12345' 
    };

    const result = await callPostApi(page, request, url, payload, headers); 

    expect(result.status).toBe(200);
    expect(result.body.status).toBe('SUCCESS');
    expect(result.body.data.reservationExpiresAt).toBeDefined();
     
    const expectedReservationExpiresAt = new Date(new Date(result.body.timestamp).getTime() + 5 * 60 * 1000).toISOString();
    expect(result.body.data.reservationExpiresAt).toBe(expectedReservationExpiresAt);
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
      'content-type': 'application/json;charset=UTF-8', 
      'Authorization': 'Bearer test-api-token-12345' 
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
      'content-type': 'application/json;charset=UTF-8', 
      'Authorization': 'Bearer test-api-token-12345' 
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
      'content-type': 'application/json;charset=UTF-8', 
      'Authorization': 'Bearer test-api-token-12345' 
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
      'content-type': 'application/json;charset=UTF-8', 
      'Authorization': 'Bearer test-api-token-12345' 
    };

    const result = await callPostApi(page, request, url, payload, headers);

    expect(result.status).toBe(200);
    expect(result.body.status).toBe('SUCCESS');
    expect(result.body.data.reservationId).toBe('RSV_A7K9M2X8');
    expect(result.body.data.reservationExpiresAt).toBeDefined();
    const expectedReservationExpiresAt = new Date(new Date(result.body.timestamp).getTime() + 5 * 60 * 1000).toISOString();
    expect(result.body.data.reservationExpiresAt).toBe(expectedReservationExpiresAt);
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
      'content-type': 'application/json;charset=UTF-8', 
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
      'content-type': 'application/json;charset=UTF-8', 
      'Authorization': 'Bearer test-api-token-12345' 
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
      'content-type': 'application/json;charset=UTF-8', 
      'Authorization': 'Bearer test-api-token-12345' 
    };

    const result = await callPostApi(page, request, url, payload, headers); 

    expect(result.status).toBe(400);
    expect(result.body.errorCode).toBe('INSUFFICIENT_INGREDIENTS');
    expect(result.body.message).toBe('주문하신 수량만큼 재료가 부족합니다.');
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
      'Authorization': 'Bearer test-api-token-12345' 
    };

    const result = await callPostApi(page, request, url, payload, headers); 

    expect(result.status).toBe(400);
    expect(result.body.errorCode).toBe('INVALID_REQUEST');
    expect(result.body.message).toBe('잘못된 요청');
  });

  test('MS-012 : quantity 누락(필수값누락) -> 400', async ({ page, request }) => {
    const url = process.env.MOCK === 'true' ? `${DOMAIN}${API_URL.MENU_SELECT}/400/QUANTITY_MISSING` : `${DOMAIN}${API_URL.MENU_SELECT}`;
    const payload = {
      "menuId": "menu_001",
      "shopId": "shop_001",
      "memberNo": "member_123"
    }

    const headers = { 
      'content-type': 'application/json;charset=UTF-8', 
      'Authorization': 'Bearer test-api-token-12345' 
    };

    const result = await callPostApi(page, request, url, payload, headers); 

    expect(result.status).toBe(400);
    expect(result.body.errorCode).toBe('INVALID_REQUEST');
    expect(result.body.message).toBe('잘못된 요청');
  });

  test('MS-013 : shopId 누락(필수값누락) -> 400', async ({ page, request }) => {
    const url = process.env.MOCK === 'true' ? `${DOMAIN}${API_URL.MENU_SELECT}/400/SHOP_ID_MISSING` : `${DOMAIN}${API_URL.MENU_SELECT}`;
    const payload = {
      "menuId": "menu_001",
      "quantity": 1,
      "memberNo": "member_123"
    }

    const headers = { 
      'content-type': 'application/json;charset=UTF-8', 
      'Authorization': 'Bearer test-api-token-12345' 
    };

    const result = await callPostApi(page, request, url, payload, headers); 

    expect(result.status).toBe(400);
    expect(result.body.errorCode).toBe('INVALID_REQUEST');
    expect(result.body.message).toBe('잘못된 요청');
  });
  
  test('MS-014 : memberNo 누락(필수값누락) -> 400', async ({ page, request }) => {
    const url = process.env.MOCK === 'true' ? `${DOMAIN}${API_URL.MENU_SELECT}/400/MEMBER_NO_MISSING` : `${DOMAIN}${API_URL.MENU_SELECT}`;
    const payload = {
      "menuId": "menu_001",
      "quantity": 1,
      "shopId": "shop_001"
    }

    const headers = { 
      'content-type': 'application/json;charset=UTF-8', 
      'Authorization': 'Bearer test-api-token-12345' 
    };

    const result = await callPostApi(page, request, url, payload, headers); 

    expect(result.status).toBe(400);
    expect(result.body.errorCode).toBe('INVALID_REQUEST');
    expect(result.body.message).toBe('잘못된 요청');
  });   

  test('MS-015 : quantity 타입오류(=string) -> 400', async ({ page, request }) => {
    const url = process.env.MOCK === 'true' ? `${DOMAIN}${API_URL.MENU_SELECT}/400/QUANTITY_STRING` : `${DOMAIN}${API_URL.MENU_SELECT}`;
    const payload = {
      "menuId": "menu_001",
      "quantity": "1",
      "shopId": "shop_001",
      "memberNo": "member_123"
    }

    const headers = { 
      'content-type': 'application/json;charset=UTF-8', 
      'Authorization': 'Bearer test-api-token-12345' 
    };

    const result = await callPostApi(page, request, url, payload, headers); 

    expect(result.status).toBe(400);
    expect(result.body.errorCode).toBe('INVALID_REQUEST');
    expect(result.body.message).toBe('잘못된 요청');
  });     

  test('MS-016 : contet-type 오류(=text/plain) -> 400', async ({ page, request }) => {
    const url = process.env.MOCK === 'true' ? `${DOMAIN}${API_URL.MENU_SELECT}/400/CONTENT_TYPE_TEXT_PLAIN` : `${DOMAIN}${API_URL.MENU_SELECT}`;
    const payload = {
      "menuId": "menu_001",
      "quantity": 1,
      "shopId": "shop_001",
      "memberNo": "member_123"
    }

    const headers = { 
      'content-type': 'text/plain;', 
      'Authorization': 'Bearer test-api-token-12345' 
    };

    const result = await callPostApi(page, request, url, payload, headers);   

    expect(result.status).toBe(400);
    expect(result.body.errorCode).toBe('INVALID_REQUEST');
    expect(result.body.message).toBe('잘못된 요청');
  }); 

  test('MS-017 : Authorization 누락(필수값누락) -> 401', async ({ page, request }) => {
    const url = process.env.MOCK === 'true' ? `${DOMAIN}${API_URL.MENU_SELECT}/401/AUTHORIZATION_MISSING` : `${DOMAIN}${API_URL.MENU_SELECT}`;
    const payload = {
      "menuId": "menu_001",
      "quantity": 1,
      "shopId": "shop_001",
      "memberNo": "member_123"
    }

    const headers = { 
      'content-type': 'application/json', 
    };

    const result = await callPostApi(page, request, url, payload, headers); 

    expect(result.status).toBe(401);
  }); 

  test('MS-018 : Authorization 형식 오류(=Bearer) -> 401', async ({ page, request }) => {
    const url = process.env.MOCK === 'true' ? `${DOMAIN}${API_URL.MENU_SELECT}/401/AUTHORIZATION_FORMAT_ERROR` : `${DOMAIN}${API_URL.MENU_SELECT}`;
    const payload = {
      "menuId": "menu_001",
      "quantity": 1,
      "shopId": "shop_001",
      "memberNo": "member_123"
    }

    const headers = { 
      'content-type': 'application/json;charset=UTF-8', 
      'Authorization': 'Bearer test-api-token-xxxxxx' 
    };

    const result = await callPostApi(page, request, url, payload, headers); 

    expect(result.status).toBe(401);
  }); 

  test('MS-019 : menuId Null -> 400', async ({ page, request }) => {
    const url = process.env.MOCK === 'true' ? `${DOMAIN}${API_URL.MENU_SELECT}/400/MENU_ID_NULL` : `${DOMAIN}${API_URL.MENU_SELECT}`;
    const payload = {
      "menuId": null,
      "quantity": 1,
      "shopId": "shop_001",
      "memberNo": "member_123"
    }

    const headers = { 
      'content-type': 'application/json;charset=UTF-8', 
      'Authorization': 'Bearer test-api-token-12345' 
    };

    const result = await callPostApi(page, request, url, payload, headers); 

    expect(result.status).toBe(400);
    expect(result.body.errorCode).toBe('INVALID_REQUEST');
    expect(result.body.message).toBe('잘못된 요청');
  });

  test('MS-020 : menuId 빈값 -> 400', async ({ page, request }) => {
    const url = process.env.MOCK === 'true' ? `${DOMAIN}${API_URL.MENU_SELECT}/400/MENU_ID_EMPTY` : `${DOMAIN}${API_URL.MENU_SELECT}`;
    const payload = {
      "menuId": "",
      "quantity": 1,
      "shopId": "shop_001",
      "memberNo": "member_123"
    }

    const headers = { 
      'content-type': 'application/json;charset=UTF-8', 
      'Authorization': 'Bearer test-api-token-12345' 
    };

    const result = await callPostApi(page, request, url, payload, headers);

    expect(result.status).toBe(400);
    expect(result.body.errorCode).toBe('INVALID_REQUEST');
    expect(result.body.message).toBe('잘못된 요청');
  });

});
  
test.describe('주문 생성 API 테스트(api/v1/order/create)', () => {
  test.beforeEach(async ({ page }) => {
    await wireMockRoutes(page);
    await page.goto('data:text/html,<meta charset=utf-8>');
  });

  test('OS-001 : 주문 생성 성공 -> 200', async ({ page, request }) => {
    const menuUrl = `${DOMAIN}${API_URL.MENU_SELECT}`;
    const orderUrl = `${DOMAIN}${API_URL.ORDER_CREATE}`;
    
    const menuPayload = {
      "menuId": "menu_001",
      "quantity": 1,
      "shopId": "shop_001",
      "memberNo": "member_123"
    }

    const headers = { 
      'content-type': 'application/json;charset=UTF-8', 
      'Authorization': 'Bearer test-api-token-12345' 
    };

    const menuResult = await callPostApi(page, request, menuUrl, menuPayload, headers);
    
    if(menuResult.status === 200) {
      const reservationId = menuResult.body.data.reservationId;
      const memberNo = menuPayload.memberNo;

      const orderPayload = {
        "reservationId": reservationId,
        "memberNo": memberNo
      }

      const orderResult = await callPostApi(page, request, orderUrl, orderPayload, headers);

      expect(orderResult.status).toBe(200);
      expect(orderResult.body.status).toBe('SUCCESS');
      expect(orderResult.body.message).toBe('주문이 성공적으로 완료되었습니다.');
      expect(orderResult.body.data.orderNo).toBeDefined();
      expect(orderResult.body.data.orderNo).toMatch(/^[A-Z0-9]{8}$/);
      expect(orderResult.body.data.orderStatus).toBe('INITIALIZING');
      expect(orderResult.body.data.reservationId).toBe(reservationId);
      expect(orderResult.body.data.createdAt).toBeDefined();
      expect(orderResult.body.data.memberInfo.memberNo).toBe(memberNo);
    }
  });

  test('OS-002 : 주문실패 - 예약 시간 만료 ', async ({ page, request }) => {
    const menuUrl = `${DOMAIN}${API_URL.MENU_SELECT}`;
    const orderUrl = process.env.MOCK === 'true' ? `${DOMAIN}${API_URL.ORDER_CREATE}/RESERVATION_EXPIRED` : `${DOMAIN}${API_URL.ORDER_CREATE}`;

    const menuPayload = {
      "menuId": "menu_001",
      "quantity": 1,
      "shopId": "shop_001",
      "memberNo": "member_123"
    }

    const headers = {
      'content-type': 'application/json;charset=UTF-8', 
      'Authorization': 'Bearer test-api-token-12345' 
    };

    const menuResult = await callPostApi(page, request, menuUrl, menuPayload, headers);

    if(menuResult.status === 200) {
      const reservationId = menuResult.body.data.reservationId;
      const memberNo = menuPayload.memberNo;

      const orderPayload = {
        "reservationId": reservationId,
        "memberNo": memberNo
      }

      // 예약 만료 시간(5분)을 초과하도록 대기
      // MOCK=true 환경에서는 5초, MOCK=false 환경에서는 6분 대기
      const waitTime = process.env.MOCK === 'true' ? 5 * 1000 : 6 * 60 * 1000;
      console.log("환경에 따른 대기시간: ", waitTime);

      await new Promise(resolve => setTimeout(resolve, waitTime));

      const orderResult = await callPostApi(page, request, orderUrl, orderPayload, headers);

      expect(orderResult.body.errorCode).toBe('RESERVATION_EXPIRED');
      expect(orderResult.body.message).toBe('예약 만료 (5분 초과)');
    } 
  });


  test('OS-003 : 주문 실패 - 예약 후 재료 소진', async ({ page, request }) => {
    const menuUrl = `${DOMAIN}${API_URL.MENU_SELECT}`;
    const orderUrl = process.env.MOCK === 'true' ? `${DOMAIN}${API_URL.ORDER_CREATE}/INGREDIENTS_EXHAUSTED` : `${DOMAIN}${API_URL.ORDER_CREATE}`;

    const menuPayload = {
      "menuId": "menu_001",
      "quantity": 1,
      "shopId": "shop_001",
      "memberNo": "member_123"
    }

    const headers = {
      'content-type': 'application/json;charset=UTF-8', 
      'Authorization': 'Bearer test-api-token-12345' 
    };

    const menuResult = await callPostApi(page, request, menuUrl, menuPayload, headers);

    if(menuResult.status === 200) {
      const reservationId = menuResult.body.data.reservationId;
      const memberNo = menuPayload.memberNo;

      const orderPayload = {
        "reservationId": reservationId,
        "memberNo": memberNo
      }

      const orderResult = await callPostApi(page, request, orderUrl, orderPayload, headers);

      expect(orderResult.body.errorCode).toBe('INGREDIENTS_EXHAUSTED');
      expect(orderResult.body.message).toBe('예약 후 재료 소진');
    }
  });

  test('OS-004 : 주문 실패 - 유효하지 않은 예약', async ({ page, request }) => {
    const menuUrl = `${DOMAIN}${API_URL.MENU_SELECT}`;
    const orderUrl = process.env.MOCK === 'true' ? `${DOMAIN}${API_URL.ORDER_CREATE}/INVALID_RESERVATION` : `${DOMAIN}${API_URL.ORDER_CREATE}`;

    const menuPayload = {
      "menuId": "menu_001",
      "quantity": 1,
      "shopId": "shop_001",
      "memberNo": "member_123"
    }

    const headers = {
      'content-type': 'application/json;charset=UTF-8', 
      'Authorization': 'Bearer test-api-token-12345' 
    };

    const menuResult = await callPostApi(page, request, menuUrl, menuPayload, headers);   

    if(menuResult.status === 200) {
      const memberNo = menuPayload.memberNo;

      const orderPayload = {
        "reservationId": "invalid_reservation_id",
        "memberNo": memberNo
      }

      const orderResult = await callPostApi(page, request, orderUrl, orderPayload, headers);

      expect(orderResult.body.errorCode).toBe('INVALID_RESERVATION');
      expect(orderResult.body.message).toBe('유효하지 않은 예약');
    } 
  });

  
});