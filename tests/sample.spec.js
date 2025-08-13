import { test, expect } from '@playwright/test';

test('GET /users 샘플코드 테스트용', async ({ request }) => {
  // GET 요청을 보냄
  const response = await request.get('/users');

  // 응답 상태 코드가 200인지 확인
  expect(response.status()).toBe(200);

  // 응답 본문을 JSON으로 파싱
  const users = await response.json();
  
  // 응답 데이터의 구조와 값을 검증
  expect(Array.isArray(users)).toBeTruthy();
  expect(users.length).toBeGreaterThan(0);
  expect(users[0]).toHaveProperty('id');
  expect(users[0]).toHaveProperty('name');
});