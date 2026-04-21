package com.kanten.pipelinemonitor.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * 定时任务配置
 * 启用 Spring @Scheduled 注解支持
 *
 * @author kanten
 * @since 2026-04-21
 */
@Configuration
@EnableScheduling
public class SchedulerConfig {
}
