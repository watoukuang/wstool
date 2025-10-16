import React, { useEffect, useRef, useState } from 'react';

export default function ThemeToggle(): React.ReactElement {
    // Theme state: 'light' | 'dark' | 'system'
    const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
        if (typeof window === 'undefined') return 'system';
        return (localStorage.getItem('theme') as 'light' | 'dark' | 'system') || 'system';
    });

    // 下拉开关 & 系统深色侦测
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const [systemDark, setSystemDark] = useState(false);

    // Apply theme based on preference and system setting
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const root = document.documentElement;
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        setSystemDark(mediaQuery.matches);

        const applyTheme = () => {
            const isDark = theme === 'dark' || (theme === 'system' && mediaQuery.matches);
            root.classList.toggle('dark', isDark);
        };

        // 初始应用主题
        applyTheme();
        localStorage.setItem('theme', theme);

        // 监听系统主题变化
        const handleSystemThemeChange = (e: MediaQueryListEvent) => {
            setSystemDark(e.matches);
            if (theme === 'system') {
                root.classList.toggle('dark', e.matches);
            }
        };

        // 添加事件监听 (兼容新旧API)
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleSystemThemeChange);
            return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
        } else {
            // 旧版浏览器支持
            mediaQuery.addListener(handleSystemThemeChange);
            return () => mediaQuery.removeListener(handleSystemThemeChange);
        }
    }, [theme]);

    // 点击外部关闭菜单
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (!menuRef.current) return;
            if (!menuRef.current.contains(e.target as Node)) setMenuOpen(false);
        };
        if (menuOpen) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [menuOpen]);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setMenuOpen((v) => !v)}
                className="h-8 w-8 flex items-center justify-center transition-colors rounded-md hover:bg-gray-700"
                aria-label="主题/设置"
                aria-expanded={menuOpen}
                aria-haspopup="menu"
            >
                {(theme === 'dark' || (theme === 'system' && systemDark)) ? (
                    <svg className="h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
                    </svg>
                ) : (
                    <svg className="h-5 w-5 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
                    </svg>
                )}
            </button>
            {menuOpen && (
                <div
                    role="menu"
                    aria-label="主题切换"
                    className="absolute right-0 mt-2 w-56 rounded-2xl border bg-white/98 backdrop-blur-sm shadow-lg ring-1 ring-black/5 p-2
                               border-gray-200 dark:bg-gray-800/95 dark:border-gray-600 dark:ring-white/5 dark:text-gray-200 z-50"
                >
                    <button
                        role="menuitemradio"
                        aria-checked={theme === 'light'}
                        onClick={() => { 
                            setTheme('light'); 
                            localStorage.setItem('theme','light'); 
                            document.documentElement.classList.remove('dark'); 
                            setMenuOpen(false); 
                        }}
                        className={`group flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                            theme === 'light' ? 'bg-gray-100 dark:bg-gray-700' : ''
                        }`}
                    >
                        <span className="text-yellow-500">☀️</span>
                        <span className="flex-1 text-left">明亮主题</span>
                        {theme === 'light' && (
                          <span aria-hidden className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"/>
                        )}
                    </button>
                    <div className="my-1 h-px bg-gray-200 dark:bg-gray-700"/>
                    <button
                        role="menuitemradio"
                        aria-checked={theme === 'dark'}
                        onClick={() => { 
                            setTheme('dark'); 
                            localStorage.setItem('theme','dark'); 
                            document.documentElement.classList.add('dark'); 
                            setMenuOpen(false); 
                        }}
                        className={`group flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                            theme === 'dark' ? 'bg-gray-100 dark:bg-gray-700' : ''
                        }`}
                    >
                        <span className="text-gray-700 dark:text-gray-300">🌙</span>
                        <span className="flex-1 text-left">暗黑主题</span>
                        {theme === 'dark' && (
                          <span aria-hidden className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"/>
                        )}
                    </button>
                    <div className="my-1 h-px bg-gray-200 dark:bg-gray-700"/>
                    <button
                        role="menuitemradio"
                        aria-checked={theme === 'system'}
                        onClick={() => { 
                            setTheme('system'); 
                            localStorage.setItem('theme','system'); 
                            document.documentElement.classList.toggle('dark', window.matchMedia('(prefers-color-scheme: dark)').matches); 
                            setMenuOpen(false); 
                        }}
                        className={`group flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                            theme === 'system' ? 'bg-gray-100 dark:bg-gray-700' : ''
                        }`}
                    >
                        <span className="text-indigo-600 dark:text-indigo-400">🖥️</span>
                        <span className="flex-1 text-left">跟随系统</span>
                        {theme === 'system' && (
                          <span aria-hidden className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"/>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
