import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#060A18] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link href="/ai-figure-studio" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8C3 5.24 5.24 3 8 3s5 2.24 5 5-2.24 5-5 5-5-2.24-5-5z" stroke="white" strokeWidth="1.5"/>
              <path d="M8 5.5v5M5.5 8h5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-semibold text-white text-[15px]">
            AnyFigure <span className="text-indigo-400">AI</span>
          </span>
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/ai-figure-studio" className="text-zinc-500 hover:text-white transition-colors">
            AI Figure Studio
          </Link>
          <Link href="/workspace" className="text-zinc-500 hover:text-white transition-colors">
            Workspace
          </Link>
        </div>
        <p className="text-zinc-600 text-sm">
          © {new Date().getFullYear()} AnyFigure AI
        </p>
      </div>
    </footer>
  );
}
