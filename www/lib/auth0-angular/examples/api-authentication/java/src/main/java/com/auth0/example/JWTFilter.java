package com.auth0.example;

import com.auth0.jwt.JWTVerifier;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;
import java.io.IOException;
import java.security.Principal;
import java.util.Map;
import java.util.regex.Pattern;

public class JWTFilter implements Filter {
    private JWTVerifier jwtVerifier;

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        jwtVerifier = new JWTVerifier(filterConfig.getInitParameter("jwt.secret"),
                filterConfig.getInitParameter("jwt.audience"));
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;

        // Allow CORS
        allowPreflightRequest(request, response, chain, httpRequest);

        String token = getToken(httpRequest);

        try {
            Map<String, Object> decoded = jwtVerifier.verify(token);
            chain.doFilter(new UserRequestWrapper(decoded, httpRequest), response);
        } catch (Exception e) {
            throw new ServletException("Unauthorized: Token validation failed", e);
        }
    }

    private String getToken(HttpServletRequest httpRequest) throws ServletException {
        String token = null;
        final String authorizationHeader = httpRequest.getHeader("authorization");
        if (authorizationHeader != null) {
            String[] parts = authorizationHeader.split(" ");
            if (parts.length == 2) {
                String scheme = parts[0];
                String credentials = parts[1];

                Pattern pattern = Pattern.compile("^Bearer$", Pattern.CASE_INSENSITIVE);
                if (pattern.matcher(scheme).matches()) {
                    token = credentials;
                }
            } else {
                throw new ServletException("Unauthorized: Format is Authorization: Bearer [token]");
            }
        } else {
            throw new ServletException("Unauthorized: No Authorization header was found");
        }
        return token;
    }

    private void allowPreflightRequest(ServletRequest request, ServletResponse response, FilterChain chain, HttpServletRequest httpRequest) throws IOException, ServletException {
        if ("OPTIONS".equals(httpRequest.getMethod())) {
            String accessControlRequestHeaders = httpRequest.getHeader("access-control-request-headers");
            if (accessControlRequestHeaders != null) {
                final String[] allowedHeaders = accessControlRequestHeaders.split(", ");
                for (String allowedHeader : allowedHeaders) {
                    if ("authorization".equalsIgnoreCase(allowedHeader)) {
                        chain.doFilter(request, response);
                        return;
                    }
                }
            }
        }
    }

    @Override
    public void destroy() {

    }

    private class JWTPrincipal implements Principal {

        private final String name;

        public JWTPrincipal(Map<String, Object> decoded) {
            this.name = (String) decoded.get("name");
        }

        @Override
        public String getName() {
            return this.name;
        }
    }

    private class UserRequestWrapper extends HttpServletRequestWrapper {
        private final Map<String, Object> decoded;

        public UserRequestWrapper(Map<String, Object> decoded, HttpServletRequest request) {
            super(request);
            this.decoded = decoded;
        }

        @Override
        public Principal getUserPrincipal() {
            return new JWTPrincipal(decoded);
        }
    }
}
