package com.kanten.pipelinemonitor.websocket;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * 传感器数据 WebSocket 处理器
 * 管理所有连接的客户端，支持广播消息
 *
 * @author kanten
 * @since 2026-04-21
 */
@Slf4j
@Component
public class SensorWebSocketHandler extends TextWebSocketHandler {

    /** 线程安全的 session 列表 */
    private final List<WebSocketSession> sessions = new CopyOnWriteArrayList<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        sessions.add(session);
        log.info("WebSocket 客户端连接: {}, 当前连接数: {}", session.getId(), sessions.size());
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        sessions.remove(session);
        log.info("WebSocket 客户端断开: {}, 状态: {}, 当前连接数: {}", session.getId(), status, sessions.size());
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) {
        log.error("WebSocket 传输错误: {}", session.getId(), exception);
        sessions.remove(session);
    }

    /**
     * 向所有连接的客户端广播消息
     */
    public void broadcast(String message) {
        TextMessage textMessage = new TextMessage(message);
        for (WebSocketSession session : sessions) {
            if (session.isOpen()) {
                try {
                    session.sendMessage(textMessage);
                } catch (IOException e) {
                    log.error("WebSocket 发送消息失败: {}", session.getId(), e);
                    sessions.remove(session);
                }
            }
        }
    }
}
