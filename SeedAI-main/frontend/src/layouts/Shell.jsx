import { Link, NavLink, Outlet } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Shell() {
 const [isSidebarOpen, setIsSidebarOpen] = useState(false);

const toggleSidebar = () => {
 setIsSidebarOpen(!isSidebarOpen);
 };

 const closeSidebar = () => {
 setIsSidebarOpen(false);
 };

 const navLinks = [
 { to: '/guide', label: '새싹아이란?' },
 { to: '/mychild', label: '우리아이' },
 { to: '/identify', label: '찾아줘' },
 { to: '/care', label: '관리해줘' },
 { to: '/growth', label: '예측해줘' },
 { to: '/detect', label: '진단해줘' },
 ];

 return (
 <div className="min-h-screen bg-emerald-50">
      {/* 1. 메인 헤더: 불투명한 'bg-white', 흐림 효과(backdrop-blur) 없음 */}
 <header className="sticky top-0 z-40 bg-white border-b border-emerald-100">
 <div className="max-w-5xl mx-auto flex items-center justify-between p-3">
 {/* 로고 (변경 없음) */}
 <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition" onClick={closeSidebar}>
 <img
 src="/images/logo.svg"
 alt="새싹 아이 로고"
 className="w-12 h-12 object-contain"
 />
 <div className="leading-tight">
 <div className="font-semibold text-lg text-gray-800" style={{ letterSpacing: '0.02em' }}>새싹 아이</div>
 <div className="text-[10px] tracking-[0.25em] text-gray-500 font-light">SEED-AI</div>
 </div>
 </Link>

 {/* 데스크톱 네비게이션 (변경 없음) */}
 <nav className="hidden md:flex gap-4 text-sm font-medium">
{navLinks.map((link) => (
 <NavLink
 key={link.to}
 to={link.to}
 className={({ isActive }) =>
 `hover:text-emerald-700 transition ${isActive ? 'text-emerald-700 font-semibold' : 'text-emerald-900'}`
 }
 >
 {link.label}
 </NavLink>
 ))}
</nav>

{/* 모바일 햄버거 버튼 (변경 없음) */}
 <button
onClick={toggleSidebar}
className="md:hidden p-2 rounded-lg hover:bg-emerald-50 transition"
aria-label="메뉴"
>
{isSidebarOpen ? (
<X className="w-6 h-6 text-emerald-900" />
) : (
<Menu className="w-6 h-6 text-emerald-900" />
)}
</button>
</div>

{/* 모바일 사이드바 오버레이 및 사이드바 */}
<>
{/* 오버레이 (변경 없음) */}
<div
className={`md:hidden fixed inset-0 bg-black/50 transition-opacity duration-300 ${
isSidebarOpen ? 'opacity-100 pointer-events-auto z-[60]' : 'opacity-0 pointer-events-none'
}`}
onClick={closeSidebar}
/>

{/* [수정] 2. 사이드바: h-full, flex-col, overflow-y-auto 제거 */}
          {/* 사이드바 배경이 메뉴 내용만큼만 나오도록 수정합니다. */}
<nav
className={`md:hidden fixed top-0 right-0 w-72 bg-white shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out ${
isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
}`}
>
{/* 사이드바 헤더 (삭제된 상태) */}

{/* [수정] p-6 -> pt-6 pb-4 px-4 (상하 여백만 줌) */}
          {/* [수정] flex-grow, overflow-y-auto 제거 */}
<div className="pt-6 pb-4 px-4">
<div className="flex flex-col space-y-2">
{navLinks.map((link) => (
<NavLink
key={link.to}
to={link.to}
onClick={closeSidebar}
className={({ isActive }) =>
`py-3 px-4 rounded-lg text-base font-medium transition-colors ${ 
isActive
? 'bg-emerald-100 text-emerald-700'
: 'text-emerald-900 hover:bg-emerald-50'
}`
}
>
{link.label}
</NavLink>
))}
</div>
</div>
</nav>
</>
</header>
<main>
<Outlet />
</main>
</div>
);
}

