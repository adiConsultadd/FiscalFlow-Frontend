import { NavLink, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Upload, History, Sparkles, ExternalLink } from 'lucide-react';
import { clsx } from 'clsx';

const navItems = [
    { to: '/', icon: Search, label: 'Query' },
    { to: '/upload', icon: Upload, label: 'Upload' },
    { to: '/history', icon: History, label: 'History' },
];

export function MainLayout() {
    return (
        <div className="min-h-screen flex">
            {/* Sidebar */}
            <aside className="w-64 border-r border-[var(--border-default)] bg-[var(--bg-secondary)]/50 flex flex-col">
                {/* Logo */}
                <div className="px-6 py-5 border-b border-[var(--border-default)]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary-500)] to-[var(--accent)] flex items-center justify-center shadow-lg shadow-[var(--primary-500)]/30">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg text-[var(--text-primary)]">FiscalFlow</h1>
                            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">AI Financial Analysis</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4">
                    <ul className="space-y-1">
                        {navItems.map((item) => (
                            <li key={item.to}>
                                <NavLink
                                    to={item.to}
                                    className={({ isActive }) => clsx(
                                        'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                                        isActive
                                            ? 'bg-[var(--primary-500)]/10 text-[var(--primary-400)] border border-[var(--primary-500)]/20'
                                            : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
                                    )}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span className="font-medium">{item.label}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-[var(--border-default)]">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-[var(--primary-500)]/10 to-[var(--accent)]/10 border border-[var(--primary-500)]/20">
                        <p className="text-xs text-[var(--text-muted)] mb-2">
                            Powered by AI with full source provenance
                        </p>
                        <a
                            href="#"
                            className="flex items-center gap-1 text-xs font-medium text-[var(--primary-400)] hover:text-[var(--primary-300)]"
                        >
                            Learn more <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <motion.div
                    className="flex-1 overflow-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <Outlet />
                </motion.div>
            </main>
        </div>
    );
}
