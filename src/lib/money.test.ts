import { describe,expect,it } from 'vitest';
import { formatMoney,sumCart } from './money';
describe('money helpers',()=>{
 it('formats USD cents',()=>expect(formatMoney(525)).toBe('$5.25'));
 it('sums cart quantities',()=>expect(sumCart([{unitPriceCents:500,quantity:2},{unitPriceCents:350,quantity:1}])).toBe(1350));
});
