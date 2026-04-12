import React, { useState } from 'react';

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', href: '/', active: true },
    { label: 'Uploads', href: '/uploads', active: false },
    { label: 'Results', href: '/results', active: false },
    { label: 'Admin', href: '/admin', active: false },
  ];

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <span className="text-2xl font-bold">🗳️ IEBC</span>
            <span className="text-sm ml-2 text-blue-100">Transparency Platform</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <button
                key={item.href}
                className={`py-2 px-3 rounded-md text-sm font-medium transition ${
                  item.active
                    ? 'bg-blue-500 text-white'
                    : 'text-blue-100 hover:bg-blue-700'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* User Section */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="bg-blue-500 hover:bg-blue-400 px-4 py-2 rounded-md text-sm font-medium">
              Sign Out
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white hover:text-blue-200 p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-blue-700 rounded-md mt-2">
              {navItems.map((item) => (
                <button
                  key={item.href}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-white hover:bg-blue-500 rounded-md"
                >
                  {item.label}
                </button>
              ))}
              <button className="block w-full text-left px-3 py-2 text-base font-medium text-white hover:bg-blue-500 rounded-md">
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-blue-100 hover:bg-blue-700"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={mobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block py-2 px-3 rounded-md text-sm font-medium mb-2 ${
                  router.pathname === item.href
                    ? 'bg-blue-500 text-white'
                    : 'text-blue-100 hover:bg-blue-700'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <button className="w-full text-left bg-blue-500 hover:bg-blue-400 px-3 py-2 rounded-md text-sm font-medium mt-2">
              Sign Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};
