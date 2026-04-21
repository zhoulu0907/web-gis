package com.kanten.pipelinemonitor;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 石油管道监控系统 - 主启动类
 *
 * @author kanten
 * @since 2026-04-21
 */
@SpringBootApplication
@MapperScan("com.kanten.pipelinemonitor.mapper")
public class PipelineMonitorApplication {

    public static void main(String[] args) {
        SpringApplication.run(PipelineMonitorApplication.class, args);
    }
}
