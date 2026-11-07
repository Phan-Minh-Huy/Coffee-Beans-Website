import { test,expect } from '@playwright/test';
test('visitors can browse the menu and add an item',async({page})=>{
 await page.goto('/menu');
 await expect(page.getByRole('heading',{name:/something good/i})).toBeVisible();
 await page.getByRole('button',{name:/add honey oat latte to cart/i}).click();
 await page.getByRole('link',{name:/shopping bag with 1 items/i}).click();
 await expect(page.getByRole('heading',{name:'Good choices.'})).toBeVisible();
 await expect(page.getByText('Honey Oat Latte')).toBeVisible();
});
test('menu search filters products',async({page})=>{
 await page.goto('/menu');
 await page.getByRole('searchbox',{name:'Search the menu'}).fill('matcha');
 await expect(page.getByText('Ceremonial Matcha')).toBeVisible();
 await expect(page.getByText('Cloud Cappuccino')).toHaveCount(0);
});
