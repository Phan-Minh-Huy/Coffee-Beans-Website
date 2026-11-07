import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin-auth";
import { serviceSupabase } from "@/lib/supabase/admin";
import { formatMoney } from "@/lib/money";
import {
  logoutAction,
  saveProductAction,
  toggleProductAction,
  updateOrderAction,
} from "./actions";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Admin dashboard",
  robots: { index: false, follow: false },
};
const categories = ["coffee", "cold", "matcha", "tea", "bakery"];
function sizesAsText(sizes: Record<string, number>) {
  return Object.entries(sizes)
    .map(([name, cents]) => `${name}:${(cents / 100).toFixed(2)}`)
    .join(", ");
}
export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const user = await requireAdmin();
  const db = serviceSupabase();
  const [productResponse, orderResponse, messageResponse] = await Promise.all([
    db.from("products").select("*").order("name"),
    db
      .from("orders")
      .select(
        "id,created_at,customer_name,customer_email,pickup_date,pickup_time,total_cents,status,order_items(product_name,size,quantity)",
      )
      .order("created_at", { ascending: false })
      .limit(40),
    db
      .from("contact_messages")
      .select("id,name,email,message,created_at")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);
  const products = productResponse.data ?? [];
  const orders = orderResponse.data ?? [];
  const messages = messageResponse.data ?? [];
  const { error, success } = await searchParams;
  return (
    <section className="shell admin-dashboard">
      <div className="admin-top">
        <div>
          <span className="section-kicker">BREW & BEAN · BACK OFFICE</span>
          <h1>Shop dashboard</h1>
          <p>Signed in as {user.email}</p>
        </div>
        <form action={logoutAction}>
          <button type="submit" className="small-ghost">
            Sign out
          </button>
        </form>
      </div>
      {error && (
        <div className="form-error" role="alert">
          Update failed ({error}). Check the fields and retry. For paid refunds,
          use the Stripe Dashboard and documented refund process.
        </div>
      )}
      {success && (
        <div className="admin-success" role="status">
          Update saved.
        </div>
      )}
      {(productResponse.error ||
        orderResponse.error ||
        messageResponse.error) && (
        <div className="form-error">
          Some data could not be loaded. Verify Supabase schema and permissions.
        </div>
      )}
      <div className="admin-metrics">
        <div>
          <span>Products</span>
          <strong>{products.length}</strong>
        </div>
        <div>
          <span>Available</span>
          <strong>{products.filter((x) => x.is_available).length}</strong>
        </div>
        <div>
          <span>Recent orders</span>
          <strong>{orders.length}</strong>
        </div>
        <div>
          <span>New messages</span>
          <strong>{messages.length}</strong>
        </div>
      </div>
      <section className="admin-section">
        <div className="admin-section-head">
          <h2>Incoming orders</h2>
          <p>Paid orders can move through preparation and pickup.</p>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order / customer</th>
                <th>Items</th>
                <th>Pickup</th>
                <th>Total</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <strong>#{order.id.slice(0, 8)}</strong>
                    <small>
                      {order.customer_name}
                      <br />
                      {order.customer_email}
                    </small>
                  </td>
                  <td>
                    {(
                      order.order_items as unknown as
                        | {
                            product_name: string;
                            size: string;
                            quantity: number;
                          }[]
                        | null
                    )?.map((item, i) => (
                      <small key={i}>
                        {item.quantity}× {item.product_name} ({item.size})
                      </small>
                    ))}
                  </td>
                  <td>
                    <small>
                      {order.pickup_date}
                      <br />
                      {order.pickup_time}
                    </small>
                  </td>
                  <td>{formatMoney(order.total_cents)}</td>
                  <td>
                    <span className={`status-pill status-${order.status}`}>
                      {order.status.replace("_", " ")}
                    </span>
                  </td>
                  <td>
                    {["paid", "preparing", "ready"].includes(order.status) ? (
                      <form
                        action={updateOrderAction}
                        className="admin-inline-form"
                      >
                        <input type="hidden" name="id" value={order.id} />
                        <select name="status" defaultValue={order.status}>
                          <option disabled value="paid">
                            Paid
                          </option>
                          <option value="preparing">Preparing</option>
                          <option value="ready">Ready</option>
                          <option value="completed">Completed</option>
                        </select>
                        <button type="submit">Save</button>
                      </form>
                    ) : (
                      <span className="subtle">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {!orders.length && (
                <tr>
                  <td colSpan={6}>
                    No orders yet. Paid customer orders will appear here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      <section className="admin-section">
        <div className="admin-section-head">
          <h2>Menu management</h2>
          <p>
            Edit a product, adjust sizes, or toggle availability. Prices are in
            USD.
          </p>
        </div>
        <div className="admin-products">
          {products.map((product) => (
            <details key={product.id} className="admin-product">
              <summary>
                <span>
                  {product.name}{" "}
                  <small>
                    {formatMoney(product.base_price_cents)} · {product.category}
                  </small>
                </span>
                <strong>{product.is_available ? "Active" : "Hidden"} ▾</strong>
              </summary>
              <form action={saveProductAction} className="admin-edit-grid">
                <input type="hidden" name="id" value={product.id} />
                <label>
                  Product name
                  <input required name="name" defaultValue={product.name} />
                </label>
                <label>
                  Base price (USD)
                  <input
                    required
                    name="price"
                    type="number"
                    step=".01"
                    min=".5"
                    defaultValue={(product.base_price_cents / 100).toFixed(2)}
                  />
                </label>
                <label>
                  Category
                  <select name="category" defaultValue={product.category}>
                    {categories.map((x) => (
                      <option key={x} value={x}>
                        {x}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Image path or HTTPS URL
                  <input
                    required
                    name="image"
                    defaultValue={product.image_url}
                  />
                </label>
                <label className="admin-wide">
                  Description
                  <textarea
                    required
                    name="description"
                    defaultValue={product.description}
                  />
                </label>
                <label className="admin-wide">
                  Size prices (e.g. Regular:5.50, Large:6.50)
                  <input
                    required
                    name="sizes"
                    defaultValue={sizesAsText(product.size_prices)}
                  />
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="featured"
                    defaultChecked={product.featured}
                  />{" "}
                  Featured on homepage
                </label>
                <div className="admin-edit-actions">
                  <button className="pill-btn" type="submit">
                    Save changes
                  </button>
                </div>
              </form>
              <form action={toggleProductAction} className="admin-toggle">
                <input type="hidden" name="id" value={product.id} />
                <input
                  type="hidden"
                  name="available"
                  value={String(product.is_available)}
                />
                <button type="submit">
                  {product.is_available ? "Hide from menu" : "Make available"}
                </button>
              </form>
            </details>
          ))}
        </div>
        <details className="admin-product admin-create">
          <summary>+ Add a new menu item</summary>
          <form action={saveProductAction} className="admin-edit-grid">
            <label>
              Name
              <input name="name" required />
            </label>
            <label>
              Base price (USD)
              <input name="price" type="number" min=".5" step=".01" required />
            </label>
            <label>
              Category
              <select name="category">
                {categories.map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Image path / HTTPS URL
              <input name="image" defaultValue="/images/latte.svg" required />
            </label>
            <label className="admin-wide">
              Description
              <textarea name="description" required />
            </label>
            <label className="admin-wide">
              Sizes{" "}
              <input
                name="sizes"
                defaultValue="Regular:5.50, Large:6.50"
                required
              />
            </label>
            <label>
              <input type="checkbox" name="featured" /> Featured product
            </label>
            <button className="pill-btn" type="submit">
              Create product
            </button>
          </form>
        </details>
      </section>
      <section className="admin-section">
        <div className="admin-section-head">
          <h2>Contact messages</h2>
        </div>
        <div className="messages-grid">
          {messages.map((m) => (
            <article key={m.id}>
              <h3>{m.name}</h3>
              <small>
                {m.email} · {new Date(m.created_at).toLocaleDateString()}
              </small>
              <p>{m.message}</p>
            </article>
          ))}
          {messages.length === 0 && <p>No contact messages yet.</p>}
        </div>
      </section>
    </section>
  );
}
