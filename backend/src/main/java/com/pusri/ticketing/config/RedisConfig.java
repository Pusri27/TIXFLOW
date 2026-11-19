package com.pusri.ticketing.config;

import lombok.extern.slf4j.Slf4j;
import org.redisson.Redisson;
import org.redisson.api.RedissonClient;
import org.redisson.config.Config;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.lang.reflect.Proxy;

@Configuration
@Slf4j
public class RedisConfig {

    @Value("${spring.redis.host:localhost}")
    private String redisHost;

    @Value("${spring.redis.port:6379}")
    private int redisPort;

    @Value("${spring.redis.password:}")
    private String redisPassword;

    @Bean
    public RedissonClient redissonClient() {
        // Fast-path for serverless / container deployments without external Redis (avoids cold-start timeout)
        if (redisHost == null || redisHost.trim().isEmpty()
                || ("localhost".equalsIgnoreCase(redisHost.trim()) && (redisPassword == null || redisPassword.isEmpty()))) {
            log.info("No external Redis configured (host={}), using instant DB/in-memory lock fallback", redisHost);
            return createFallbackClient();
        }

        Config config = new Config();
        String address;
        if (redisHost.startsWith("redis://") || redisHost.startsWith("rediss://")) {
            address = redisHost;
        } else {
            boolean isSsl = redisPort == 6380 || (redisPassword != null && !redisPassword.isEmpty() && !redisHost.equals("localhost"));
            String protocol = isSsl ? "rediss://" : "redis://";
            address = String.format("%s%s:%d", protocol, redisHost, redisPort);
        }

        var serverConfig = config.useSingleServer()
                .setAddress(address)
                .setConnectionPoolSize(4)
                .setConnectionMinimumIdleSize(1)
                .setConnectTimeout(2000)
                .setTimeout(2000)
                .setRetryAttempts(1)
                .setRetryInterval(500);

        if (redisPassword != null && !redisPassword.isEmpty()) {
            serverConfig.setPassword(redisPassword);
        }

        try {
            RedissonClient client = Redisson.create(config);
            log.info("Successfully connected to Redis at {}", address);
            return client;
        } catch (Exception e) {
            log.warn("Redis connection to {} failed ({}), fallback to in-memory/DB lock", address, e.getMessage());
            return createFallbackClient();
        }
    }

    private RedissonClient createFallbackClient() {
        return (RedissonClient) Proxy.newProxyInstance(
                RedissonClient.class.getClassLoader(),
                new Class<?>[]{RedissonClient.class},
                (proxy, method, args) -> {
                    String name = method.getName();
                    if ("hashCode".equals(name)) {
                        return System.identityHashCode(proxy);
                    }
                    if ("equals".equals(name)) {
                        return proxy == (args != null && args.length > 0 ? args[0] : null);
                    }
                    if ("toString".equals(name)) {
                        return "FallbackRedissonClientProxy";
                    }
                    if ("isShutdown".equals(name) || "isShuttingDown".equals(name)) {
                        return Boolean.TRUE;
                    }
                    return null;
                }
        );
    }
}

