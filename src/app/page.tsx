import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Clock,
  Heart,
  Leaf,
  MoveUpRight,
} from "lucide-react";
import { getCatalog } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";
export default async function Home() {
  const { products, demo } = await getCatalog();
  const featured = products.filter((x) => x.featured).slice(0, 4);
  return (
    <>
      <section className="hero">
        <div className="shell hero-layout">
          <div className="hero-content">
            <div className="eyebrow">
              <span className="tiny-star">✳</span> A LITTLE RITUAL, EVERY DAY
            </div>
            <h1>
              Coffee for
              <br />
              <em>the moments</em>
              <br />
              that matter<span className="hero-dot">.</span>
            </h1>
            <p>
              Slow mornings, thoughtful pours, and a place that feels like
              yours. The good stuff starts here.
            </p>
            <div className="hero-actions">
              <Link href="/menu" className="pill-btn">
                Explore our menu <ArrowUpRight size={18} />
              </Link>
              <Link href="/about" className="underlined-link">
                Get to know us <ArrowRight size={17} />
              </Link>
            </div>
            <div className="hero-foot">
              <span className="hero-asterisk">✺</span>
              <span>
                CRAFTED WITH CARE
                <br />
                SERVED WITH LOVE
              </span>
              <div className="hero-line" />
              <span className="hero-small">EVERY SINGLE CUP.</span>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-orbit orbit-1" />
            <div className="hero-orbit orbit-2" />
            <img
              src="/images/hero-coffee.svg"
              alt="Illustration of latte in a ceramic coffee cup"
            />
            <div className="circle-stamp">
              <span>FRESHLY BREWED</span>
              <span className="stamp-star">✳</span>
              <span>DAILY RITUAL</span>
            </div>
            <div className="hero-visual-note">
              A GOOD DAY
              <br />
              STARTS HERE <MoveUpRight size={14} />
            </div>
          </div>
        </div>
        <div className="hero-bottom-ticker">
          <div className="shell">
            <span>GOOD COFFEE, GOOD PEOPLE</span>
            <span>✳</span>
            <span>YOUR DAILY MOMENT OF JOY</span>
            <span>✳</span>
            <span>SLOW DOWN & SIP IN</span>
          </div>
        </div>
      </section>
      <section className="introduction shell">
        <div className="intro-topline">
          <span className="section-kicker">WELCOME TO BREW & BEAN</span>
          <span className="section-index">01 — OUR PHILOSOPHY</span>
        </div>
        <div className="intro-grid">
          <h2>
            More than just
            <br />
            <em>a coffee stop.</em>
          </h2>
          <div>
            <p>
              We believe that great coffee is about so much more than the cup.
              It’s the moment you take for yourself, the conversation that runs
              long, the little pause in a busy day.
            </p>
            <Link href="/about" className="text-link">
              The story behind the beans <ArrowUpRight size={17} />
            </Link>
          </div>
        </div>
      </section>
      <section className="favorites-section">
        <div className="shell">
          <div className="section-heading-row">
            <div>
              <span className="section-kicker">MADE FOR YOUR EVERY MOOD</span>
              <h2>
                Meet your new <em>favorites.</em>
              </h2>
            </div>
            <Link href="/menu" className="text-link">
              Full menu <ArrowUpRight size={18} />
            </Link>
          </div>
          {demo && (
            <p className="demo-caption">
              Preview menu · sample products and prices
            </p>
          )}
          {featured.length ? (
            <div className="products-grid">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p>Our menu is coming soon.</p>
          )}
        </div>
      </section>
      <section className="story-section">
        <div className="story-image">
          <img
            src="/images/story-coffee.svg"
            alt="Illustrated coffee dripper and roasted coffee beans"
            loading="lazy"
          />
          <div className="story-image-overlay">
            FROM BEAN
            <br />
            TO BETTER DAYS.
          </div>
        </div>
        <div className="story-copy">
          <span className="section-kicker">GOOD THINGS TAKE TIME</span>
          <h2>
            Slow coffee.
            <br />
            <em>Full hearts.</em>
          </h2>
          <p>
            From carefully sourced beans to the final flourish of latte art, we
            obsess over the details so you can simply enjoy the moment.
          </p>
          <div className="story-points">
            <span>
              <Leaf size={19} /> Thoughtfully sourced
            </span>
            <span>
              <Heart size={19} /> Made with love
            </span>
            <span>
              <Clock size={19} /> Always worth the wait
            </span>
          </div>
          <Link href="/about" className="pill-btn dark-outline-btn">
            Read our story <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
      <section className="visit-section shell">
        <div className="visit-stamp">
          BREW.
          <br />
          PAUSE.
          <br />
          REPEAT.
        </div>
        <div>
          <span className="section-kicker">
            THERE'S ALWAYS ROOM FOR ONE MORE
          </span>
          <h2>
            Come on in.
            <br />
            <em>Stay a while.</em>
          </h2>
          <p>
            Whether it’s your first visit or your fiftieth, there’s a seat
            waiting for you.
          </p>
          <Link href="/contact" className="pill-btn">
            Find our coffee house <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="visit-bean">✳</div>
      </section>
    </>
  );
}
