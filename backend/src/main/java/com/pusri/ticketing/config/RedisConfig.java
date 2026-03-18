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
                .setConnectTimeout(3000)
                .setTimeout(2000)
                .setRetryAttempts(1)
                .setRetryInterval(1000);

        if (redisPassword != null && !redisPassword.isEmpty()) {
            serverConfig.setPassword(redisPassword);
        }

        try {
            RedissonClient client = Redisson.create(config);
            log.info("Successfully connected to Redis at {}", address);
            return client;
        } catch (Exception e) {
            log.warn("Redis connection to {} failed ({}), fallback to in-memory/DB lock", address, e.getMessage());
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
}

