
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function generateCaptcha() {
	const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
	let s = '';
	for (let i = 0; i < 5; i++) s += chars[Math.floor(Math.random() * chars.length)];
	return s;
}

function Login() {
	const navigate = useNavigate();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [captcha, setCaptcha] = useState('');
	const [captchaInput, setCaptchaInput] = useState('');
	const [errors, setErrors] = useState({});

	useEffect(() => setCaptcha(generateCaptcha()), []);

	function validate() {
		const e = {};
		if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Valid email required';
		if (!password) e.password = 'Password is required';
		if (!captchaInput || captchaInput !== captcha) e.captcha = 'Captcha does not match';
		setErrors(e);
		return Object.keys(e).length === 0;
	}

	function handleSubmit(ev) {
		ev.preventDefault();
		if (!validate()) return;
		// TODO: call login API
		console.log('Logging in', { email });
		navigate('/');
	}

	return (
		<div className="container" style={{ maxWidth: 480, marginTop: 40 }}>
			<h2 className="mb-3">Login</h2>
			<form onSubmit={handleSubmit} noValidate>
				<div className="mb-3">
					<label className="form-label">Email</label>
					<input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} />
					{errors.email && <div className="text-danger small">{errors.email}</div>}
				</div>

				<div className="mb-3">
					<label className="form-label">Password</label>
					<input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} />
					{errors.password && <div className="text-danger small">{errors.password}</div>}
				</div>

				<div className="mb-3">
					<label className="form-label">Captcha verification</label>
					<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
						<div style={{ padding: '8px 12px', background: '#f5f5f5', border: '1px solid #ddd', fontFamily: 'monospace', letterSpacing: 2, fontSize: 18 }}>{captcha}</div>
						<button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setCaptcha(generateCaptcha())}>Refresh</button>
					</div>
					<input className="form-control mt-2" value={captchaInput} onChange={e => setCaptchaInput(e.target.value)} placeholder="Enter shown text" />
					{errors.captcha && <div className="text-danger small">{errors.captcha}</div>}
				</div>

				<div className="d-grid">
					<button className="btn btn-primary" type="submit">Login</button>
				</div>
			</form>
		</div>
	);
}

export default Login;
