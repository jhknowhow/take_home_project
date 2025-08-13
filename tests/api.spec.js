import { test, expect } from '@playwright/test';

test.describe('Woowahan Food Delivery API', () => {
  let reservationId;

  test.describe('/api/v1/menu/select', () => {
    test('메뉴 선택 성공 - 유효한 요청으로 예약 생성', async ({ request }) => {
      const response = await request.post('/api/v1/menu/select', {
        data: {
          menuId: 'menu_001',
          quantity: 2,
          shopId: 'shop_001',
          memberNo: 'member_123'
        }
      });

      expect(response.status()).toBe(200);
      
      const responseBody = await response.json();
      expect(responseBody.status).toBe('SUCCESS');
      expect(responseBody.message).toBe('메뉴 예약이 완료되었습니다');
      expect(responseBody.data).toBeDefined();
      expect(responseBody.data.reservationId).toBeDefined();
      expect(responseBody.data.reservationId).toMatch(/^RSV_[A-Z0-9]+$/);
      expect(responseBody.data.menuId).toBe('menu_001');
      expect(responseBody.data.quantity).toBe(2);
      expect(responseBody.data.reservationExpiresAt).toBeDefined();
      
      // 예약 ID를 다음 테스트에서 사용하기 위해 저장
      reservationId = responseBody.data.reservationId;
    });

    test('메뉴 선택 실패 - 필수 필드 누락', async ({ request }) => {
      const response = await request.post('/api/v1/menu/select', {
        data: {
          menuId: 'menu_001',
          quantity: 2
          // shopId와 memberNo 누락
        }
      });

      expect(response.status()).toBe(400);
      
      const responseBody = await response.json();
      expect(responseBody.status).toBe('ERROR');
      expect(responseBody.errorCode).toBeDefined();
    });

    test('메뉴 선택 실패 - 수량 초과 (99개 이상)', async ({ request }) => {
      const response = await request.post('/api/v1/menu/select', {
        data: {
          menuId: 'menu_001',
          quantity: 100, // 최대 99개 초과
          shopId: 'shop_001',
          memberNo: 'member_123'
        }
      });

      expect(response.status()).toBe(400);
      
      const responseBody = await response.json();
      expect(responseBody.status).toBe('ERROR');
      expect(responseBody.errorCode).toBeDefined();
    });

    test('메뉴 선택 실패 - 수량 부족 (1개 미만)', async ({ request }) => {
      const response = await request.post('/api/v1/menu/select', {
        data: {
          menuId: 'menu_001',
          quantity: 0, // 최소 1개 미만
          shopId: 'shop_001',
          memberNo: 'member_123'
        }
      });

      expect(response.status()).toBe(400);
      
      const responseBody = await response.json();
      expect(responseBody.status).toBe('ERROR');
      expect(responseBody.errorCode).toBeDefined();
    });

    test('메뉴 선택 실패 - 음수 수량', async ({ request }) => {
      const response = await request.post('/api/v1/menu/select', {
        data: {
          menuId: 'menu_001',
          quantity: -1, // 음수 수량
          shopId: 'shop_001',
          memberNo: 'member_123'
        }
      });

      expect(response.status()).toBe(400);
      
      const responseBody = await response.json();
      expect(responseBody.status).toBe('ERROR');
      expect(responseBody.errorCode).toBeDefined();
    });

    test('메뉴 선택 실패 - 재료 부족 (3개 재고에 4개 주문)', async ({ request }) => {
      const response = await request.post('/api/v1/menu/select', {
        data: {
          menuId: 'menu_low_stock', // 재고가 적은 메뉴 ID
          quantity: 4, // 재고(3개)보다 많은 수량
          shopId: 'shop_001',
          memberNo: 'member_123'
        }
      });

      expect(response.status()).toBe(400);
      
      const responseBody = await response.json();
      expect(responseBody.status).toBe('ERROR');
      expect(responseBody.errorCode).toBe('INSUFFICIENT_INGREDIENTS');
      expect(responseBody.message).toContain('재료가 부족합니다');
    });



    test('메뉴 선택 성공 - 재고 1개 남은 상황에서 1개 주문', async ({ request }) => {
      const response = await request.post('/api/v1/menu/select', {
        data: {
          menuId: 'menu_single_stock', // 재고가 1개만 남은 메뉴 ID
          quantity: 1, // 재고와 동일한 수량
          shopId: 'shop_001',
          memberNo: 'member_123'
        }
      });

      expect(response.status()).toBe(200);
      
      const responseBody = await response.json();
      expect(responseBody.status).toBe('SUCCESS');
      expect(responseBody.data.quantity).toBe(1);
    });

    test('메뉴 선택 실패 - 잘못된 데이터 타입', async ({ request }) => {
      const response = await request.post('/api/v1/menu/select', {
        data: {
          menuId: 'menu_001',
          quantity: 'invalid_quantity', // 문자열이어야 할 정수
          shopId: 'shop_001',
          memberNo: 'member_123'
        }
      });

      expect(response.status()).toBe(400);
    });

    // 수량 시뮬레이션 테스트
    test.describe('수량 시뮬레이션 테스트', () => {
      test('재고 2개에서 3개 주문 시도 - 실패', async ({ request }) => {
        const response = await request.post('/api/v1/menu/select', {
          data: {
            menuId: 'menu_stock_2', // 재고 2개인 메뉴
            quantity: 3, // 재고(2개)보다 많은 수량
            shopId: 'shop_001',
            memberNo: 'member_123'
          }
        });

        expect(response.status()).toBe(400);
        
        const responseBody = await response.json();
        expect(responseBody.status).toBe('ERROR');
        expect(responseBody.errorCode).toBe('INSUFFICIENT_INGREDIENTS');
        expect(responseBody.message).toContain('재료가 부족합니다');
      });

      test('재고 2개에서 2개 주문 시도 - 성공', async ({ request }) => {
        const response = await request.post('/api/v1/menu/select', {
          data: {
            menuId: 'menu_stock_2', // 재고 2개인 메뉴
            quantity: 2, // 재고와 동일한 수량
            shopId: 'shop_001',
            memberNo: 'member_123'
          }
        });

        expect(response.status()).toBe(200);
        
        const responseBody = await response.json();
        expect(responseBody.status).toBe('SUCCESS');
        expect(responseBody.data.quantity).toBe(2);
      });

      test('재고 2개에서 1개 주문 시도 - 성공', async ({ request }) => {
        const response = await request.post('/api/v1/menu/select', {
          data: {
            menuId: 'menu_stock_2', // 재고 2개인 메뉴
            quantity: 1, // 재고보다 적은 수량
            shopId: 'shop_001',
            memberNo: 'member_123'
          }
        });

        expect(response.status()).toBe(200);
        
        const responseBody = await response.json();
        expect(responseBody.status).toBe('SUCCESS');
        expect(responseBody.data.quantity).toBe(1);
      });

      test('재고 5개에서 6개 주문 시도 - 실패', async ({ request }) => {
        const response = await request.post('/api/v1/menu/select', {
          data: {
            menuId: 'menu_stock_5', // 재고 5개인 메뉴
            quantity: 6, // 재고(5개)보다 많은 수량
            shopId: 'shop_001',
            memberNo: 'member_123'
          }
        });

        expect(response.status()).toBe(400);
        
        const responseBody = await response.json();
        expect(responseBody.status).toBe('ERROR');
        expect(responseBody.errorCode).toBe('INSUFFICIENT_INGREDIENTS');
      });

      test('재고 10개에서 99개 주문 시도 - 실패 (최대 수량 초과)', async ({ request }) => {
        const response = await request.post('/api/v1/menu/select', {
          data: {
            menuId: 'menu_stock_10', // 재고 10개인 메뉴
            quantity: 99, // API 스키마 최대값
            shopId: 'shop_001',
            memberNo: 'member_123'
          }
        });

        expect(response.status()).toBe(400);
        
        const responseBody = await response.json();
        expect(responseBody.status).toBe('ERROR');
        expect(responseBody.errorCode).toBe('INSUFFICIENT_INGREDIENTS');
      });

      test('재고 100개에서 50개 주문 시도 - 성공', async ({ request }) => {
        const response = await request.post('/api/v1/menu/select', {
          data: {
            menuId: 'menu_stock_100', // 재고 100개인 메뉴
            quantity: 50, // 재고보다 적은 수량
            shopId: 'shop_001',
            memberNo: 'member_123'
          }
        });

        expect(response.status()).toBe(200);
        
        const responseBody = await response.json();
        expect(responseBody.status).toBe('SUCCESS');
        expect(responseBody.data.quantity).toBe(50);
      });
    });

    // 동적 재고 시뮬레이션 테스트
    test.describe('동적 재고 시뮬레이션', () => {
      test('연속 주문으로 재고 소진 시뮬레이션', async ({ request }) => {
        // 1단계: 첫 번째 주문 (재고 3개 중 2개 사용)
        const firstResponse = await request.post('/api/v1/menu/select', {
          data: {
            menuId: 'menu_dynamic_stock_3',
            quantity: 2,
            shopId: 'shop_001',
            memberNo: 'member_123'
          }
        });

        expect(firstResponse.status()).toBe(200);
        const firstBody = await firstResponse.json();
        expect(firstBody.data.quantity).toBe(2);

        // 2단계: 두 번째 주문 (재고 1개 중 1개 사용)
        const secondResponse = await request.post('/api/v1/menu/select', {
          data: {
            menuId: 'menu_dynamic_stock_3',
            quantity: 1,
            shopId: 'shop_001',
            memberNo: 'member_456'
          }
        });

        expect(secondResponse.status()).toBe(200);
        const secondBody = await secondResponse.json();
        expect(secondBody.data.quantity).toBe(1);

        // 3단계: 세 번째 주문 시도 (재고 0개 상태에서 1개 주문)
        const thirdResponse = await request.post('/api/v1/menu/select', {
          data: {
            menuId: 'menu_dynamic_stock_3',
            quantity: 1,
            shopId: 'shop_001',
            memberNo: 'member_789'
          }
        });

        expect(thirdResponse.status()).toBe(400);
        
        const thirdBody = await thirdResponse.json();
        expect(thirdBody.status).toBe('ERROR');
        expect(thirdBody.errorCode).toBe('INSUFFICIENT_INGREDIENTS');
        expect(thirdBody.message).toContain('재료가 부족합니다');
      });

      test('재고 경계값 테스트', async ({ request }) => {
        const stockScenarios = [
          { stock: 1, order: 1, shouldSucceed: true },
          { stock: 1, order: 2, shouldSucceed: false },
          { stock: 5, order: 5, shouldSucceed: true },
          { stock: 5, order: 6, shouldSucceed: false },
          { stock: 10, order: 9, shouldSucceed: true },
          { stock: 10, order: 10, shouldSucceed: true },
          { stock: 10, order: 11, shouldSucceed: false }
        ];

        for (const scenario of stockScenarios) {
          const response = await request.post('/api/v1/menu/select', {
            data: {
              menuId: `menu_stock_${scenario.stock}`,
              quantity: scenario.order,
              shopId: 'shop_001',
              memberNo: 'member_123'
            }
          });

          if (scenario.shouldSucceed) {
            expect(response.status()).toBe(200);
            const body = await response.json();
            expect(body.status).toBe('SUCCESS');
            expect(body.data.quantity).toBe(scenario.order);
          } else {
            expect(response.status()).toBe(400);
            const body = await response.json();
            expect(body.status).toBe('ERROR');
            expect(body.errorCode).toBe('INSUFFICIENT_INGREDIENTS');
          }
                 }
       });
     });

     // MENU_NOT_FOUND 에러 코드 테스트
     test.describe('MENU_NOT_FOUND 에러 테스트', () => {
       test('존재하지 않는 메뉴 ID로 주문 시도 - MENU_NOT_FOUND', async ({ request }) => {
         const response = await request.post('/api/v1/menu/select', {
           data: {
             menuId: 'non_existent_menu', // 존재하지 않는 메뉴 ID
             quantity: 1,
             shopId: 'shop_001',
             memberNo: 'member_123'
           }
         });

         expect(response.status()).toBe(400);
         
         const responseBody = await response.json();
         expect(responseBody.status).toBe('ERROR');
         expect(responseBody.errorCode).toBe('MENU_NOT_FOUND');
         expect(responseBody.message).toContain('요청하신 메뉴를 찾을 수 없습니다');
         expect(responseBody.timestamp).toBeDefined();
       });

       test('잘못된 형식의 메뉴 ID - MENU_NOT_FOUND', async ({ request }) => {
         const response = await request.post('/api/v1/menu/select', {
           data: {
             menuId: 'invalid_menu_123', // 잘못된 형식의 메뉴 ID
             quantity: 1,
             shopId: 'shop_001',
             memberNo: 'member_123'
           }
         });

         expect(response.status()).toBe(400);
         
         const responseBody = await response.json();
         expect(responseBody.status).toBe('ERROR');
         expect(responseBody.errorCode).toBe('MENU_NOT_FOUND');
         expect(responseBody.message).toContain('요청하신 메뉴를 찾을 수 없습니다');
       });

       test('빈 문자열 메뉴 ID - MENU_NOT_FOUND', async ({ request }) => {
         const response = await request.post('/api/v1/menu/select', {
           data: {
             menuId: '', // 빈 문자열
             quantity: 1,
             shopId: 'shop_001',
             memberNo: 'member_123'
           }
         });

         expect(response.status()).toBe(400);
         
         const responseBody = await response.json();
         expect(responseBody.status).toBe('ERROR');
         expect(responseBody.errorCode).toBe('MENU_NOT_FOUND');
         expect(responseBody.message).toContain('요청하신 메뉴를 찾을 수 없습니다');
       });

       test('null 메뉴 ID - MENU_NOT_FOUND', async ({ request }) => {
         const response = await request.post('/api/v1/menu/select', {
           data: {
             menuId: null, // null 값
             quantity: 1,
             shopId: 'shop_001',
             memberNo: 'member_123'
           }
         });

         expect(response.status()).toBe(400);
         
         const responseBody = await response.json();
         expect(responseBody.status).toBe('ERROR');
         expect(responseBody.errorCode).toBe('MENU_NOT_FOUND');
         expect(responseBody.message).toContain('요청하신 메뉴를 찾을 수 없습니다');
       });

       test('존재하는 메뉴 ID와 존재하지 않는 메뉴 ID 비교', async ({ request }) => {
         // 1단계: 존재하는 메뉴 ID로 성공 테스트
         const validResponse = await request.post('/api/v1/menu/select', {
           data: {
             menuId: 'menu_001', // 존재하는 메뉴 ID
             quantity: 1,
             shopId: 'shop_001',
             memberNo: 'member_123'
           }
         });

         expect(validResponse.status()).toBe(200);
         const validBody = await validResponse.json();
         expect(validBody.status).toBe('SUCCESS');

         // 2단계: 존재하지 않는 메뉴 ID로 실패 테스트
         const invalidResponse = await request.post('/api/v1/menu/select', {
           data: {
             menuId: 'menu_999', // 존재하지 않는 메뉴 ID
             quantity: 1,
             shopId: 'shop_001',
             memberNo: 'member_123'
           }
         });

         expect(invalidResponse.status()).toBe(400);
         const invalidBody = await invalidResponse.json();
         expect(invalidBody.status).toBe('ERROR');
         expect(invalidBody.errorCode).toBe('MENU_NOT_FOUND');
         expect(invalidBody.message).toContain('요청하신 메뉴를 찾을 수 없습니다');
       });

       test('다양한 존재하지 않는 메뉴 ID 패턴 테스트', async ({ request }) => {
         const invalidMenuIds = [
           'menu_999',
           'non_existent_menu',
           'invalid_menu_123',
           'menu_',
           'menu_invalid',
           '999_menu',
           'menu_abc123',
           'MENU_001', // 대문자 (존재하는 메뉴는 소문자)
           'Menu_001'  // 혼합 대소문자
         ];

         for (const menuId of invalidMenuIds) {
           const response = await request.post('/api/v1/menu/select', {
             data: {
               menuId: menuId,
               quantity: 1,
               shopId: 'shop_001',
               memberNo: 'member_123'
             }
           });

           expect(response.status()).toBe(400);
           
           const responseBody = await response.json();
           expect(responseBody.status).toBe('ERROR');
           expect(responseBody.errorCode).toBe('MENU_NOT_FOUND');
           expect(responseBody.message).toContain('요청하신 메뉴를 찾을 수 없습니다');
         }
       });
     });
   });

  test.describe('/api/v1/order/create', () => {
    test('주문 생성 성공 - 유효한 예약 ID로 주문 생성', async ({ request }) => {
      // 먼저 메뉴를 선택하여 예약 ID를 얻습니다
      const selectResponse = await request.post('/api/v1/menu/select', {
        data: {
          menuId: 'menu_001',
          quantity: 1,
          shopId: 'shop_001',
          memberNo: 'member_123'
        }
      });

      const selectBody = await selectResponse.json();
      const validReservationId = selectBody.data.reservationId;

      const response = await request.post('/api/v1/order/create', {
        data: {
          reservationId: validReservationId,
          memberNo: 'member_123'
        }
      });

      expect(response.status()).toBe(200);
      
      const responseBody = await response.json();
      expect(responseBody.status).toBe('SUCCESS');
      expect(responseBody.message).toBe('주문이 성공적으로 생성되었습니다');
      expect(responseBody.data).toBeDefined();
      expect(responseBody.data.orderNo).toBeDefined();
      expect(responseBody.data.orderNo).toMatch(/^[A-Z0-9]{8}$/); // 8자리 영숫자
      expect(responseBody.data.orderStatus).toBe('INITIALIZING');
      expect(responseBody.data.reservationId).toBe(validReservationId);
      expect(responseBody.data.createdAt).toBeDefined();
      expect(responseBody.data.memberInfo.memberNo).toBe('member_123');
    });

    test('주문 생성 실패 - 필수 필드 누락', async ({ request }) => {
      const response = await request.post('/api/v1/order/create', {
        data: {
          reservationId: 'RSV_A7K9M2X8'
          // memberNo 누락
        }
      });

      expect(response.status()).toBe(400);
    });

    test('주문 생성 실패 - 유효하지 않은 예약 ID', async ({ request }) => {
      const response = await request.post('/api/v1/order/create', {
        data: {
          reservationId: 'INVALID_RESERVATION_ID',
          memberNo: 'member_123'
        }
      });

      expect(response.status()).toBe(400);
      
      const responseBody = await response.json();
      expect(responseBody.errorCode).toBeDefined();
      expect(responseBody.message).toBeDefined();
    });

 

    test('주문 생성 실패 - 다른 회원의 예약 ID 사용', async ({ request }) => {
      // 먼저 member_123으로 메뉴를 선택
      const selectResponse = await request.post('/api/v1/menu/select', {
        data: {
          menuId: 'menu_001',
          quantity: 1,
          shopId: 'shop_001',
          memberNo: 'member_123'
        }
      });

      const selectBody = await selectResponse.json();
      const reservationId = selectBody.data.reservationId;

      // 다른 회원(member_456)으로 주문 생성 시도
      const response = await request.post('/api/v1/order/create', {
        data: {
          reservationId: reservationId,
          memberNo: 'member_456'
        }
      });

      expect(response.status()).toBe(400);
      
      const responseBody = await response.json();
      expect(responseBody.errorCode).toBeDefined();
    });

    test('재고 소진 시나리오 - 연속 주문으로 재고 부족 발생', async ({ request }) => {
      // 1단계: 첫 번째 주문 (재고 3개 중 2개 사용)
      const firstSelectResponse = await request.post('/api/v1/menu/select', {
        data: {
          menuId: 'menu_low_stock',
          quantity: 2,
          shopId: 'shop_001',
          memberNo: 'member_123'
        }
      });

      expect(firstSelectResponse.status()).toBe(200);
      const firstReservationId = (await firstSelectResponse.json()).data.reservationId;

      // 첫 번째 주문 완료
      const firstOrderResponse = await request.post('/api/v1/order/create', {
        data: {
          reservationId: firstReservationId,
          memberNo: 'member_123'
        }
      });
      expect(firstOrderResponse.status()).toBe(200);

      // 2단계: 두 번째 주문 (재고 1개 중 1개 사용)
      const secondSelectResponse = await request.post('/api/v1/menu/select', {
        data: {
          menuId: 'menu_low_stock',
          quantity: 1,
          shopId: 'shop_001',
          memberNo: 'member_456'
        }
      });

      expect(secondSelectResponse.status()).toBe(200);
      const secondReservationId = (await secondSelectResponse.json()).data.reservationId;

      // 두 번째 주문 완료
      const secondOrderResponse = await request.post('/api/v1/order/create', {
        data: {
          reservationId: secondReservationId,
          memberNo: 'member_456'
        }
      });
      expect(secondOrderResponse.status()).toBe(200);

      // 3단계: 세 번째 주문 시도 (재고 0개 상태에서 1개 주문)
      const thirdSelectResponse = await request.post('/api/v1/menu/select', {
        data: {
          menuId: 'menu_low_stock',
          quantity: 1,
          shopId: 'shop_001',
          memberNo: 'member_789'
        }
      });

      expect(thirdSelectResponse.status()).toBe(400);
      
      const thirdSelectBody = await thirdSelectResponse.json();
      expect(thirdSelectBody.status).toBe('ERROR');
      expect(thirdSelectBody.errorCode).toBe('INSUFFICIENT_INGREDIENTS');
      expect(thirdSelectBody.message).toContain('재료가 부족합니다');
    });
  });

  test.describe('통합 테스트', () => {
    test('전체 주문 플로우 - 메뉴 선택부터 주문 생성까지', async ({ request }) => {
      // 1단계: 메뉴 선택
      const selectResponse = await request.post('/api/v1/menu/select', {
        data: {
          menuId: 'menu_001',
          quantity: 3,
          shopId: 'shop_001',
          memberNo: 'member_123'
        }
      });

      expect(selectResponse.status()).toBe(200);
      const selectBody = await selectResponse.json();
      const reservationId = selectBody.data.reservationId;

      // 2단계: 주문 생성
      const orderResponse = await request.post('/api/v1/order/create', {
        data: {
          reservationId: reservationId,
          memberNo: 'member_123'
        }
      });

      expect(orderResponse.status()).toBe(200);
      const orderBody = await orderResponse.json();
      
      // 응답 검증
      expect(orderBody.data.reservationId).toBe(reservationId);
      expect(orderBody.data.memberInfo.memberNo).toBe('member_123');
      expect(orderBody.data.orderStatus).toBe('INITIALIZING');
    });

    test('동일한 예약 ID로 중복 주문 시도', async ({ request }) => {
      // 1단계: 메뉴 선택
      const selectResponse = await request.post('/api/v1/menu/select', {
        data: {
          menuId: 'menu_001',
          quantity: 1,
          shopId: 'shop_001',
          memberNo: 'member_123'
        }
      });

      const selectBody = await selectResponse.json();
      const reservationId = selectBody.data.reservationId;

      // 2단계: 첫 번째 주문 생성 (성공)
      const firstOrderResponse = await request.post('/api/v1/order/create', {
        data: {
          reservationId: reservationId,
          memberNo: 'member_123'
        }
      });

      expect(firstOrderResponse.status()).toBe(200);

      // 3단계: 동일한 예약 ID로 두 번째 주문 생성 시도 (실패)
      const secondOrderResponse = await request.post('/api/v1/order/create', {
        data: {
          reservationId: reservationId,
          memberNo: 'member_123'
        }
      });

      expect(secondOrderResponse.status()).toBe(400);
      
      const secondOrderBody = await secondOrderResponse.json();
      expect(secondOrderBody.errorCode).toBeDefined();
    });
  });
});
