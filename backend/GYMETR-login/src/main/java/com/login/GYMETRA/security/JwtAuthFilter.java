package com.login.GYMETRA.security;

import com.login.GYMETRA.entity.User;
import com.login.GYMETRA.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    // Rutas públicas (ajusta si necesitas más)
    private static final List<String> PUBLIC_PATHS = List.of(
            "/api/auth/**",
            "/v3/api-docs/**",
            "/swagger-ui/**",
            "/swagger-ui.html"
    );
    private static final AntPathMatcher PATH_MATCHER = new AntPathMatcher();

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        // No filtrar preflight ni rutas públicas
        if (HttpMethod.OPTIONS.matches(request.getMethod())) {
            return true;
        }
        String path = request.getServletPath();
        return PUBLIC_PATHS.stream().anyMatch(p -> PATH_MATCHER.match(p, path));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");

        // Si no hay Bearer, no seteamos autenticación y dejamos seguir
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            chain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);
        String username = null;

        try {
            username = jwtService.extractUsername(token);
        } catch (Exception e) {
            // Token ilegible/dañado → no autenticamos y seguimos
            SecurityContextHolder.clearContext();
            chain.doFilter(request, response);
            return;
        }

        // Si aún no hay autenticación en el contexto, intentamos validarla
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            User user = userRepository.findByEmail(username).orElse(null);

            try {
                if (user != null && jwtService.isTokenValid(token, user.getEmail())) {
                    // OJO: si tus roles no tienen prefijo, puedes agregarlo aquí si usas hasRole()
                    List<SimpleGrantedAuthority> authorities = user.getUserRoles().stream()
                            .map(ur -> ur.getRole().getRoleName())        // p.ej. "ADMIN"
                            //.map(name -> "ROLE_" + name)                 // descomenta si usas hasRole("ADMIN")
                            .map(SimpleGrantedAuthority::new)
                            .collect(Collectors.toList());

                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(user, null, authorities);
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                } else {
                    SecurityContextHolder.clearContext();
                }
            } catch (Exception e) {
                // Expirado / firma inválida / etc. → no autenticamos y seguimos
                SecurityContextHolder.clearContext();
            }
        }

        chain.doFilter(request, response);
    }
}
