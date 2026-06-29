import { test, expect } from '@playwright/test';
import testData from '../data/testData.json';

test.describe('API Testing', () => {
  function getUniqueUserDetails() {
    const uniqueId = `${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const user = testData.users[0];
    return {
      name: user.name,
      email: `api_user_${uniqueId}@example.com`,
      password: user.password,
      title: user.gender,
      birth_date: user.days,
      birth_month: user.months,
      birth_year: user.years,
      firstname: user.firstName,
      lastname: user.lastName,
      company: user.company,
      address1: user.address1,
      address2: user.address2,
      country: user.country,
      state: user.state,
      city: user.city,
      zipcode: user.zipcode,
      mobile_number: user.mobileNumber
    };
  }

  test('Get All Products List', async ({ request }) => {
    const response = await request.get('/api/productsList');
    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    expect(responseBody.responseCode).toBe(200);
    expect(responseBody.products).toBeDefined();
    expect(Array.isArray(responseBody.products)).toBe(true);
    expect(responseBody.products.length).toBeGreaterThan(0);

    const firstProduct = responseBody.products[0];
    expect(firstProduct).toHaveProperty('id');
    expect(firstProduct).toHaveProperty('name');
    expect(firstProduct).toHaveProperty('price');
    expect(firstProduct).toHaveProperty('brand');
    expect(firstProduct).toHaveProperty('category');
  });

  test('POST To All Products List', async ({ request }) => {
    const response = await request.post('/api/productsList');
    const responseBody = await response.json();
    expect(responseBody.responseCode).toBe(405);
    expect(responseBody.message).toBe('This request method is not supported.');
  });

  test('Get All Brands List', async ({ request }) => {
    const response = await request.get('/api/brandsList');
    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    expect(responseBody.responseCode).toBe(200);
    expect(responseBody.brands).toBeDefined();
    expect(Array.isArray(responseBody.brands)).toBe(true);
    expect(responseBody.brands.length).toBeGreaterThan(0);

    const firstBrand = responseBody.brands[0];
    expect(firstBrand).toHaveProperty('id');
    expect(firstBrand).toHaveProperty('brand');
  });

  test('PUT To All Brands List', async ({ request }) => {
    const response = await request.put('/api/brandsList');
    const responseBody = await response.json();
    expect(responseBody.responseCode).toBe(405);
    expect(responseBody.message).toBe('This request method is not supported.');
  });

  test('POST To Search Product', async ({ request }) => {
    const response = await request.post('/api/searchProduct', {
      form: {
        search_product: 'tshirt'
      }
    });
    expect(response.status()).toBe(200);
    const responseBody = await response.json();
    expect(responseBody.responseCode).toBe(200);
    expect(responseBody.products).toBeDefined();
    expect(Array.isArray(responseBody.products)).toBe(true);
    expect(responseBody.products.length).toBeGreaterThan(0);

    // All returned products should relate to 'tshirt' or 'shirt'
    for (const product of responseBody.products) {
      expect(product.name.toLowerCase()).toContain('shirt');
    }
  });

  test('POST To Search Product without search_product parameter', async ({ request }) => {
    const response = await request.post('/api/searchProduct');
    const responseBody = await response.json();
    expect(responseBody.responseCode).toBe(400);
    expect(responseBody.message).toBe('Bad request, search_product parameter is missing in POST request.');
  });

  test('POST To Verify Login with valid details', async ({ request }) => {
    const user = getUniqueUserDetails();

    const createRes = await request.post('/api/createAccount', { form: user });
    const createBody = await createRes.json();
    expect(createBody.responseCode).toBe(201);

    const loginRes = await request.post('/api/verifyLogin', {
      form: {
        email: user.email,
        password: user.password
      }
    });
    expect(loginRes.status()).toBe(200);
    const loginBody = await loginRes.json();
    expect(loginBody.responseCode).toBe(200);
    expect(loginBody.message).toBe('User exists!');

    const deleteRes = await request.delete('/api/deleteAccount', {
      form: {
        email: user.email,
        password: user.password
      }
    });
    const deleteBody = await deleteRes.json();
    expect(deleteBody.responseCode).toBe(200);
  });

  test('POST To Verify Login without email parameter', async ({ request }) => {
    const response = await request.post('/api/verifyLogin', {
      form: {
        password: 'Password123'
      }
    });
    const responseBody = await response.json();
    expect(responseBody.responseCode).toBe(400);
    expect(responseBody.message).toBe('Bad request, email or password parameter is missing in POST request.');
  });

  test('DELETE To Verify Login', async ({ request }) => {
    const response = await request.delete('/api/verifyLogin');
    const responseBody = await response.json();
    expect(responseBody.responseCode).toBe(405);
    expect(responseBody.message).toBe('This request method is not supported.');
  });

  test('POST To Verify Login with invalid details', async ({ request }) => {
    const response = await request.post('/api/verifyLogin', {
      form: {
        email: 'nonexistent_api_user@example.com',
        password: 'wrong_password'
      }
    });
    const responseBody = await response.json();
    expect(responseBody.responseCode).toBe(404);
    expect(responseBody.message).toBe('User not found!');
  });

  test('POST To Create/Register User Account', async ({ request }) => {
    const user = getUniqueUserDetails();

    const createRes = await request.post('/api/createAccount', { form: user });
    expect(createRes.status()).toBe(200);
    const createBody = await createRes.json();
    expect(createBody.responseCode).toBe(201);
    expect(createBody.message).toBe('User created!');

    await request.delete('/api/deleteAccount', {
      form: {
        email: user.email,
        password: user.password
      }
    });
  });

  test('DELETE METHOD To Delete User Account', async ({ request }) => {
    const user = getUniqueUserDetails();

    await request.post('/api/createAccount', { form: user });

    const deleteRes = await request.delete('/api/deleteAccount', {
      form: {
        email: user.email,
        password: user.password
      }
    });
    expect(deleteRes.status()).toBe(200);
    const deleteBody = await deleteRes.json();
    expect(deleteBody.responseCode).toBe(200);
    expect(deleteBody.message).toBe('Account deleted!');
  });

  test('PUT To Update User Account', async ({ request }) => {
    const user = getUniqueUserDetails();

    await request.post('/api/createAccount', { form: user });

    const updatedUser = {
      ...user,
      name: 'Updated Antigravity API',
      company: 'Updated Google DeepMind'
    };
    const updateRes = await request.put('/api/updateAccount', { form: updatedUser });
    expect(updateRes.status()).toBe(200);
    const updateBody = await updateRes.json();
    expect(updateBody.responseCode).toBe(200);
    expect(updateBody.message).toBe('User updated!');

    await request.delete('/api/deleteAccount', {
      form: {
        email: user.email,
        password: user.password
      }
    });
  });

  test('GET user account detail by email', async ({ request }) => {
    const user = getUniqueUserDetails();

    await request.post('/api/createAccount', { form: user });

    const detailRes = await request.get('/api/getUserDetailByEmail', {
      params: {
        email: user.email
      }
    });
    expect(detailRes.status()).toBe(200);
    const detailBody = await detailRes.json();
    expect(detailBody.responseCode).toBe(200);
    expect(detailBody.user).toBeDefined();

    expect(detailBody.user.name).toBe(user.name);
    expect(detailBody.user.email).toBe(user.email);
    expect(detailBody.user.company).toBe(user.company);

    await request.delete('/api/deleteAccount', {
      form: {
        email: user.email,
        password: user.password
      }
    });
  });
});
