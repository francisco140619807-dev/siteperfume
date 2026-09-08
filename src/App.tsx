import { useEffect, useState, type ReactElement } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";

export default function App() {
  const [BelowFold, setBelowFold] = useState<(() => ReactElement) | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      Promise.all([
        import("./components/BrandsCarousel"),
        import("./components/Benefits"),
        import("./components/Footer"),
      ]).then(([brands, benefits, footer]) => {
        if (cancelled) return;
        setBelowFold(() => () => (
          <>
            <main className="overflow-hidden"><brands.default /><benefits.default /></main>
            <footer.default />
          </>
        ));
      });
    };
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      const id = window.requestIdleCallback(load, { timeout: 900 });
      return () => { cancelled = true; window.cancelIdleCallback(id); };
    }
    const id = window.setTimeout(load, 350);
    return () => { cancelled = true; window.clearTimeout(id); };
  }, []);

  return <div className="min-h-screen relative selection:bg-red-600 selection:text-white"><Header /><main className="overflow-hidden" style={{ paddingTop: "44px" }}><Hero /></main>{BelowFold ? <BelowFold /> : null}</div>;
}
