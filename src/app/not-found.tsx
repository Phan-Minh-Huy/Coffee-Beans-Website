import Link from 'next/link';
export default function NotFound(){return <section className="shell centered-page"><span className="section-kicker">404 · WRONG TURN</span><h1>Oops, this cup is empty.</h1><p>The page you’re looking for isn’t here.</p><Link href="/" className="pill-btn">Back to the good stuff →</Link></section>}
