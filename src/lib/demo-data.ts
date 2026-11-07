import type { Product } from '@/types';
/** Local design preview only. Real checkout deliberately requires Supabase + Stripe. */
export const demoProducts: Product[] = [
  { id:'demo-espresso', slug:'signature-espresso', name:'Signature Espresso', description:'Bold, velvety espresso with notes of dark chocolate and toasted hazelnut.',category:'coffee',image_url:'/images/espresso.svg',base_price_cents:350,size_prices:{Single:350,Double:450},featured:true,is_available:true },
  { id:'demo-latte', slug:'honey-oat-latte', name:'Honey Oat Latte', description:'Silky oat milk, rich espresso and a soft swirl of wildflower honey.',category:'coffee',image_url:'/images/latte.svg',base_price_cents:550,size_prices:{Regular:550,Large:650},featured:true,is_available:true },
  { id:'demo-cappuccino', slug:'cloud-cappuccino', name:'Cloud Cappuccino', description:'A beautifully balanced classic with pillowy microfoam.',category:'coffee',image_url:'/images/cappuccino.svg',base_price_cents:490,size_prices:{Regular:490,Large:590},featured:true,is_available:true },
  { id:'demo-cold', slug:'slow-cold-brew', name:'Slow Cold Brew', description:'Steeped for 18 hours. Smooth, refreshing and naturally sweet.',category:'cold',image_url:'/images/coldbrew.svg',base_price_cents:520,size_prices:{Regular:520,Large:620},featured:true,is_available:true },
  { id:'demo-matcha', slug:'ceremonial-matcha', name:'Ceremonial Matcha', description:'Vibrant stone-ground matcha whisked smooth and finished with milk.',category:'matcha',image_url:'/images/matcha.svg',base_price_cents:590,size_prices:{Regular:590,Large:690},featured:false,is_available:true },
  { id:'demo-tea', slug:'garden-chai', name:'Garden Chai', description:'Slow-simmered spices with black tea, gently sweetened.',category:'tea',image_url:'/images/chai.svg',base_price_cents:480,size_prices:{Regular:480,Large:580},featured:false,is_available:true },
  { id:'demo-croissant', slug:'butter-croissant', name:'Butter Croissant', description:'Golden, flaky layers baked fresh each morning.',category:'bakery',image_url:'/images/croissant.svg',base_price_cents:420,size_prices:{One:420},featured:false,is_available:true },
  { id:'demo-cookie', slug:'chocolate-cookie', name:'Brown Butter Cookie', description:'Crisp edges, chewy center and generous chocolate chunks.',category:'bakery',image_url:'/images/cookie.svg',base_price_cents:380,size_prices:{One:380},featured:false,is_available:true }
];
export const categoryNames = { all:'All drinks', coffee:'Hot coffee', cold:'Cold brew', matcha:'Matcha', tea:'Tea', bakery:'Bakery' } as const;
