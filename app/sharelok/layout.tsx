import { CartProvider } from "@/components/sharelok/cart-context";
import { CartDrawer } from "@/components/sharelok/cart-drawer";

export default function SharelokLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      {children}
      <CartDrawer />
    </CartProvider>
  );
}
