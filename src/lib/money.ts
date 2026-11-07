export function formatMoney(cents: number) { return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(cents/100); }
export function sumCart(items: Array<{unitPriceCents:number;quantity:number}>) {return items.reduce((sum,item)=>sum+item.unitPriceCents*item.quantity,0);}
