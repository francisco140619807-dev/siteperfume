type Props = { onHeightChange?: (height: number) => void };
export default function Header(_props: Props) {
  return <header className="fixed top-0 left-0 right-0 z-50 bg-linear-to-r from-[#E62020] to-[#C81E1E] text-white flex items-center justify-center py-2.5 px-4 shadow-lg font-heading font-extrabold text-center text-sm md:text-base tracking-wide border-b border-red-500" style={{backgroundImage:"linear-gradient(to right, #E62020, #C81E1E)"}}><div className="max-w-7xl mx-auto flex items-center justify-center gap-2 uppercase leading-tight"><span className="animate-bounce shrink-0">🔥</span><h2>Chega de pagar caro em perfume</h2><span className="animate-bounce shrink-0">🔥</span></div></header>;
}
