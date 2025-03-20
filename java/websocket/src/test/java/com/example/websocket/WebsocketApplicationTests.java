package com.example.websocket;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.web.server.LocalServerPort;
import org.springframework.messaging.converter.MappingJackson2MessageConverter;
import org.springframework.messaging.simp.stomp.*;
import org.springframework.web.socket.WebSocketHttpHeaders;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.messaging.WebSocketStompClient;
import org.springframework.web.socket.sockjs.client.SockJsClient;
import org.springframework.web.socket.sockjs.client.Transport;
import org.springframework.web.socket.sockjs.client.WebSocketTransport;

import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class WebsocketApplicationTests {

    @LocalServerPort
    private int port;
    private SockJsClient sockJsClient;
    private WebSocketStompClient stompClient;
    private final WebSocketHttpHeaders headers = new WebSocketHttpHeaders();

    @BeforeEach
    public void setup() {
        List<Transport> transports = new ArrayList<>();
        transports.add(new WebSocketTransport(new StandardWebSocketClient()));
        this.sockJsClient = new SockJsClient(transports);
        this.stompClient = new WebSocketStompClient(sockJsClient);
        this.stompClient.setMessageConverter(new MappingJackson2MessageConverter());
        this.headers.add("key1", "value1");
    }

    @Test
    public void getGreeting() throws Exception {
        StompSessionHandler handler = new StompSessionHandlerAdapter() {
            @Override
            public void afterConnected(final StompSession session, StompHeaders connectedHeaders) {
                session.subscribe("/topic/greetings", new StompFrameHandler() {
                    @Override
                    public Type getPayloadType(StompHeaders headers) {
                        return Greeting.class;
                    }
                    @Override
                    public void handleFrame(StompHeaders headers, Object payload) {
                        Greeting greeting = (Greeting) payload;
                        try {
                            assertEquals("Hello, Spring!", greeting.getContent());
                        } catch (Throwable t) {
                            fail("Greeting not received");
                        } finally {
                            session.disconnect();
                        }
                    }
                });
            }
        };

        this.stompClient.connect("ws://localhost:{port}/gs-guide-websocket", this.headers, handler, this.port);
    }

}
