import React, { useState } from 'react';
import { X } from 'lucide-react';
import Header from './Header';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="layout-root">
      {mobileMenuOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <Header onMenuClick={() => setMobileMenuOpen(true)} />

      <div className="layout-body">
        <div className={`sidebar-wrapper ${mobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-sidebar-header hide-desktop">
            <span style={{ fontWeight: 700, fontSize: '15px' }}>Navigation Menu</span>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                padding: '4px'
              }}
            >
              <X size={22} />
            </button>
          </div>
          <Sidebar onItemClick={() => setMobileMenuOpen(false)} />
        </div>

        <main className="layout-content custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
