import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3002';

function generateCaptcha() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let s = '';
    for (let i = 0; i < 5; i++) s += chars[Math.floor(Math.random() * chars.length)];
    return s;
}

function Login() {
    const [email,        setEmail]        = useState('');
    const [password,     setPassword]     = useState('');
    const [captcha,      setCaptcha]      = useState('');
    const [captchaInput, setCaptchaInput] = useState('');
    const [errors,       setErrors]       = useState({});
    const [serverError,  setServerError]  = useState('');
    const [loading,      setLoading]      = useState(false);

    useEffect(() => setCaptcha(generateCaptcha()), []);

    function validate() {
        const e = {};
        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email    = 'Valid email required';
        if (!password)                                                     e.password = 'Password is required';
        if (!captchaInput || captchaInput !== captcha)                    e.captcha  = 'Captcha does not match';
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    async function handleSubmit(ev) {
        ev.preventDefault();
        setServerError('');
        if (!validate()) return;

        setLoading(true);
        try {
            const { data } = await axios.post(
                `${BACKEND_URL}/login`,
                { email, password },
                { withCredentials: true }
            );
            if (data.success) {
                localStorage.setItem('token',    data.token);
                localStorage.setItem('userId',   String(data.userId));
                localStorage.setItem('username', data.username);
                localStorage.setItem('email',    data.email);
                // Pass token via URL param because localStorage is not shared across origins
                const params = new URLSearchParams({
                    token:    data.token,
                    userId:   String(data.userId),
                    username: data.username,
                    email:    data.email,
                });
                window.location.href = `http://localhost:3001?${params.toString()}`;
            } else {
                setServerError(data.message || 'Login failed. Please try again.');
                setCaptcha(generateCaptcha());
                setCaptchaInput('');
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Unable to connect to server.';
            setServerError(msg);
            setCaptcha(generateCaptcha());
            setCaptchaInput('');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="container" style={{ maxWidth: 440, margin: '48px auto' }}>
            <h2 className="mb-1">Welcome back</h2>
            <p className="text-muted mb-4" style={{ fontSize: '0.9rem' }}>
                Login to your Zerodha account
            </p>

            {serverError && (
                <div className="alert alert-danger" role="alert">{serverError}</div>
            )}

            <form onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" value={email}
                        onChange={e => setEmail(e.target.value)} disabled={loading}
                        placeholder="you@email.com" autoFocus />
                    {errors.email && <div className="text-danger small mt-1">{errors.email}</div>}
                </div>

                <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input type="password" className="form-control" value={password}
                        onChange={e => setPassword(e.target.value)} disabled={loading}
                        placeholder="Your password" />
                    {errors.password && <div className="text-danger small mt-1">{errors.password}</div>}
                </div>

                <div className="mb-4">
                    <label className="form-label">Captcha verification</label>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                        <div style={{
                            padding: '7px 14px', background: '#f0f0f0', border: '1px solid #ddd',
                            fontFamily: 'monospace', letterSpacing: 4, fontSize: 20, userSelect: 'none',
                            borderRadius: 4, minWidth: 120, textAlign: 'center',
                        }}>{captcha}</div>
                        <button type="button" className="btn btn-outline-secondary btn-sm"
                            onClick={() => { setCaptcha(generateCaptcha()); setCaptchaInput(''); }}>
                            ↺ Refresh
                        </button>
                    </div>
                    <input className="form-control" value={captchaInput}
                        onChange={e => setCaptchaInput(e.target.value)}
                        placeholder="Enter the text shown above" disabled={loading} />
                    {errors.captcha && <div className="text-danger small mt-1">{errors.captcha}</div>}
                </div>

                <div className="d-grid mb-3">
                    <button className="btn btn-primary btn-lg" type="submit" disabled={loading}>
                        {loading ? 'Logging in…' : 'Login →'}
                    </button>
                </div>

                <p className="text-center text-muted" style={{ fontSize: '0.85rem' }}>
                    New to Zerodha?{' '}
                    <Link to="/signup" style={{ color: '#387ed1' }}>Open a free account</Link>
                </p>
            </form>
        </div>
    );
}

export default Login;
