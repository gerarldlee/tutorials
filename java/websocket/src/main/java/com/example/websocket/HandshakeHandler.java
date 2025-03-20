package com.example.websocket;

import org.springframework.http.HttpHeaders;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

import java.security.Principal;
import java.util.Map;

public class HandshakeHandler extends DefaultHandshakeHandler {

    @Override
    protected Principal determineUser(ServerHttpRequest request,
                                      WebSocketHandler handler, Map<String, Object> attributes) {

        HttpHeaders headers = request.getHeaders();

        Principal p = request.getPrincipal();
        System.out.println(p);

        for (Map.Entry e : headers.entrySet()) {
            System.out.printf("Key: %s , Value: %s \n", e.getKey(), e.getValue());
        }
        System.out.println(attributes);

        return new Principal() {
            @Override
            public String getName() {
                return "gerard";
            }
        };
    }
}
