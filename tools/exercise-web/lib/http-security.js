'use strict';

const net = require('node:net');
const os = require('node:os');
const { AppError } = require('./exercises');

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: http: https:",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'none'",
    "frame-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
  ].join('; '),
};

function normalizeHostname(hostname) {
  return hostname.toLowerCase().replace(/\.$/, '');
}

function isLoopback(address) {
  if (!address) return false;
  const normalized = address.toLowerCase();
  if (normalized === '::1' || normalized === '[::1]') return true;
  const ipv4 = normalized.startsWith('::ffff:') ? normalized.slice(7) : normalized;
  return net.isIP(ipv4) === 4 && ipv4.startsWith('127.');
}

// A custom header cannot be sent by a cross-origin form. No CORS permission is
// granted, so browsers must pass a preflight before attaching this header.
function assertWriteSource(req, origin) {
  const fetchSite = req.headers['sec-fetch-site'];
  if (fetchSite && fetchSite !== 'same-origin' && fetchSite !== 'none') {
    throw new AppError(403, '拒绝跨源写操作');
  }
  if (req.headers.origin && req.headers.origin !== origin) {
    throw new AppError(403, '拒绝跨源写操作');
  }
  if (req.headers['x-requested-with'] !== 'exercise-web') {
    throw new AppError(403, '写操作需要 X-Requested-With: exercise-web');
  }
}

function createRequestGuard(bindHost) {
  const allowed = new Set(['localhost', '[::1]']);
  const normalizedBind = normalizeHostname(bindHost);
  if (normalizedBind === '0.0.0.0' || normalizedBind === '::') {
    for (const addresses of Object.values(os.networkInterfaces())) {
      for (const { address } of addresses || []) {
        allowed.add(normalizeHostname(net.isIP(address) === 6 ? `[${address}]` : address));
      }
    }
  } else {
    allowed.add(normalizeHostname(net.isIP(bindHost) === 6 ? `[${bindHost}]` : bindHost));
  }

  return function parseRequestUrl(req) {
    const host = req.headers.host;
    // Reject userinfo, paths, whitespace and ambiguous Host values before URL
    // parsing, which would otherwise normalize some malformed input for us.
    if (typeof host !== 'string' || !/^(?:\[[0-9a-fA-F:.]+\]|[a-zA-Z0-9._-]+)(?::[0-9]+)?$/.test(host)) {
      throw new AppError(400, 'Host 请求头不合法');
    }
    let base;
    let url;
    try {
      base = new URL(`http://${host}`);
      if (!allowed.has(normalizeHostname(base.hostname)) && !isLoopback(base.hostname)) {
        throw new AppError(403, 'Host 不在本机或配置的监听地址范围内');
      }
      if (typeof req.url !== 'string' || !req.url.startsWith('/') || req.url.startsWith('//')) {
        throw new AppError(400, '请求 URL 不合法');
      }
      url = new URL(req.url, base);
      // Validate escapes on API routes as well as static routes.
      if (decodeURIComponent(url.pathname).includes('\0')) throw new URIError('NUL');
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(400, '请求 URL 不合法');
    }
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) assertWriteSource(req, base.origin);
    return url;
  };
}

module.exports = { SECURITY_HEADERS, createRequestGuard, isLoopback };
