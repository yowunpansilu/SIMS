package com.sims.server.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Deque;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;

/**
 * IP-based sliding-window rate limiter for public endpoints.
 * Enable by setting RATE_LIMITING=true in the environment (or application.properties).
 * Default is false so local development / testing is never blocked.
 */
@Component
@Order(1)
public class RateLimitFilter implements Filter {

    @Value("${RATE_LIMITING:false}")
    private boolean enabled;

    // Max requests per IP within the window
    private static final int  MAX_REQUESTS = 10;
    private static final long WINDOW_MS    = 60_000; // 1 minute

    // IP → timestamps of recent requests
    private final ConcurrentHashMap<String, Deque<Long>> log = new ConcurrentHashMap<>();

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest  httpReq = (HttpServletRequest)  req;
        HttpServletResponse httpRes = (HttpServletResponse) res;

        if (!enabled || !httpReq.getRequestURI().startsWith("/api/public/")) {
            chain.doFilter(req, res);
            return;
        }

        String ip  = clientIp(httpReq);
        long   now = System.currentTimeMillis();

        Deque<Long> timestamps = log.computeIfAbsent(ip, k -> new ConcurrentLinkedDeque<>());
        timestamps.removeIf(t -> now - t > WINDOW_MS);
        timestamps.addLast(now);

        if (timestamps.size() > MAX_REQUESTS) {
            httpRes.setStatus(429);
            httpRes.setContentType("application/json");
            httpRes.getWriter().write(
                    "{\"error\":\"Too many requests — please wait a minute before submitting again.\"}");
            return;
        }

        chain.doFilter(req, res);
    }

    private String clientIp(HttpServletRequest req) {
        String xff = req.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) return xff.split(",")[0].trim();
        return req.getRemoteAddr();
    }

    // Evict stale IP entries every 5 minutes to prevent unbounded memory growth
    @Scheduled(fixedDelay = 300_000)
    public void evictStale() {
        long cutoff = System.currentTimeMillis() - WINDOW_MS;
        log.entrySet().removeIf(e -> {
            e.getValue().removeIf(t -> t < cutoff);
            return e.getValue().isEmpty();
        });
    }
}
