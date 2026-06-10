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

function Signup() {
    const [name,         setName]         = useState('');
    const [email,        setEmail]        = useState('');
    const [password,     setPassword]     = useState('');
    const [confirmPwd,   setConfirmPwd]   = useState('');
    const [captcha,      setCaptcha]      = useState('');
    const [captchaInput, setCaptchaInput] = useState('');
    const [errors,       setErrors]       = useState({});
    const [serverError,  setServerError]  = useState('');
    const [loading,      setLoading]      = useState(false);

    useEffect(() => { setCaptcha(generateCaptcha()); }, []);

    function validate() {
        const e = {};
        if (!name.trim())                                                e.name       = 'Name is required';
        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email      = 'Valid email required';
        if (!password || password.length < 6)                            e.password   = 'Minimum 6 characters';
        if (password !== confirmPwd)                                      e.confirmPwd = 'Passwords do not match';
        if (!captchaInput || captchaInput !== captcha)                   e.captcha    = 'Captcha does not match';
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setServerError('');
        if (!validate()) return;

        setLoading(true);
        try {
            const { data } = await axios.post(
                `${BACKEND_URL}/signup`,
                { email, password, username: name },
                { withCredentials: true }
            );
            if (data.success) {
                // Auto-login: save credentials and go straight to dashboard
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
                setServerError(data.message || 'Signup failed. Please try again.');
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
        <div className="container" style={{ maxWidth: 480, margin: '40px auto' }}>
            <h2 className="mb-1">Open a free account</h2>
            <p className="text-muted mb-4" style={{ fontSize: '0.9rem' }}>
                Join millions of Indians investing with Zerodha
            </p>

            {serverError && (
                <div className="alert alert-danger" role="alert">{serverError}</div>
            )}

            <form onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                    <label className="form-label">Full name</label>
                    <input className="form-control" value={name}
                        onChange={e => setName(e.target.value)} disabled={loading}
                        placeholder="Your full name" />
                    {errors.name && <div className="text-danger small mt-1">{errors.name}</div>}
                </div>

                <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" value={email}
                        onChange={e => setEmail(e.target.value)} disabled={loading}
                        placeholder="you@email.com" />
                    {errors.email && <div className="text-danger small mt-1">{errors.email}</div>}
                </div>

                <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input type="password" className="form-control" value={password}
                        onChange={e => setPassword(e.target.value)} disabled={loading}
                        placeholder="Min. 6 characters" />
                    {errors.password && <div className="text-danger small mt-1">{errors.password}</div>}
                </div>

                <div className="mb-3">
                    <label className="form-label">Confirm password</label>
                    <input type="password" className="form-control" value={confirmPwd}
                        onChange={e => setConfirmPwd(e.target.value)} disabled={loading}
                        placeholder="Re-enter password" />
                    {errors.confirmPwd && <div className="text-danger small mt-1">{errors.confirmPwd}</div>}
                </div>

                <div className="mb-3">
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
                        {loading ? 'Creating your account…' : 'Create account'}
                    </button>
                </div>

                <p className="text-center text-muted" style={{ fontSize: '0.85rem' }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: '#387ed1' }}>Login here</Link>
                </p>
            </form>
        </div>
    );
}

export default Signup;
