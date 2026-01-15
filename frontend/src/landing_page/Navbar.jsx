import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  const [showAuthMenu, setShowAuthMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowAuthMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav
      className="navbar navbar-expand-lg border-bottom"
      style={{ backgroundColor: "#FFF" }}
    >
      <div className="container p-2">
        <Link className="navbar-brand" to="/">
          <img
            src="media/images/logo.svg"
            style={{ width: "25%" }}
            alt="Logo"
          />
        </Link>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <form className="d-flex" role="search">
            <ul className="navbar-nav mb-lg-0">
              <li class="nav-item">
                <Link class="nav-link active" aria-current="page" to="/signup">
                  Signup
                </Link>
              </li>
              <li class="nav-item">
                <Link class="nav-link active" to="/about">
                  About
                </Link>
              </li>
              <li class="nav-item">
                <Link class="nav-link active" to="/product">
                  Product
                </Link>
              </li>
              <li class="nav-item">
                <Link class="nav-link active" to="/pricing">
                  Pricing
                </Link>
              </li>
              <li class="nav-item">
                <Link class="nav-link active" to="/support">
                  Support
                </Link>
              </li>
              <li className="nav-item d-flex align-items-center" ref={menuRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  className="nav-link btn"
                  onClick={() => setShowAuthMenu(s => !s)}
                  aria-expanded={showAuthMenu}
                  aria-label="Open auth menu"
                  style={{ background: 'none', border: 'none', padding: '0 .5rem', display: 'inline-flex', alignItems: 'center', height: '100%' }}
                >
                  <i className="fa fa-bars" aria-hidden="true" />
                </button>
                {showAuthMenu && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 'calc(100% + 6px)',
                      background: '#fff',
                      border: '1px solid #eee',
                      boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
                      borderRadius: 8,
                      padding: 6,
                      zIndex: 1000,
                      minWidth: 160,
                    }}
                  >
                    <Link to="/login" className="btn btn-sm btn-light d-block text-start" style={{ textDecoration: 'none', color: '#212529', marginBottom: 6 }} onClick={() => setShowAuthMenu(false)}>Login</Link>
                    <Link to="/signup" className="btn btn-sm btn-light d-block text-start" style={{ textDecoration: 'none', color: '#212529' }} onClick={() => setShowAuthMenu(false)}>Signup</Link>
                  </div>
                )}
              </li>
              </ul>
          </form>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
