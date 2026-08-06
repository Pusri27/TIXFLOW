package com.pusri.ticketing.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.redisson.api.RBucket;
import org.redisson.api.RScoredSortedSet;
import org.redisson.api.RedissonClient;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@Slf4j
@RequiredArgsConstructor
public class QueueService {

    private final RedissonClient redissonClient;

    private static final String QUEUE_KEY_PREFIX = "queue:event:";
    private static final String TOKEN_KEY_PREFIX = "queue:token:";
    private static final int MAX_CONCURRENT_SERVED = 50;

    public Map<String, Object> joinQueue(Long eventId, Long userId) {
        try {
            String queueKey = QUEUE_KEY_PREFIX + eventId;
            RScoredSortedSet<String> queue = redissonClient.getScoredSortedSet(queueKey);

            if (queue != null) {
                String member = String.valueOf(userId);
                if (queue.rank(member) == null) {
                    queue.add((double) System.currentTimeMillis(), member);
                    log.info("User {} joined queue for Event {}", userId, eventId);
                }
            }
            return getQueueStatus(eventId, userId);
        } catch (Exception e) {
            log.warn("Queue service error, falling back to direct entrance: {}", e.getMessage());
            Map<String, Object> response = new HashMap<>();
            response.put("eventId", eventId);
            response.put("userId", userId);
            response.put("status", "SERVING");
            response.put("queueToken", "QTOKEN-DIRECT-" + userId);
            response.put("position", 1);
            response.put("estimatedWaitSeconds", 0);
            return response;
        }
    }

    public Map<String, Object> getQueueStatus(Long eventId, Long userId) {
        Map<String, Object> response = new HashMap<>();
        response.put("eventId", eventId);
        response.put("userId", userId);

        try {
            String queueKey = QUEUE_KEY_PREFIX + eventId;
            RScoredSortedSet<String> queue = redissonClient != null ? redissonClient.getScoredSortedSet(queueKey) : null;

            if (queue == null) {
                response.put("status", "SERVING");
                response.put("queueToken", "QTOKEN-DIRECT-" + userId);
                response.put("position", 1);
                response.put("estimatedWaitSeconds", 0);
                return response;
            }

            String member = String.valueOf(userId);
            Integer rank = queue.rank(member);

            if (rank == null) {
                response.put("status", "NOT_IN_QUEUE");
                response.put("position", 0);
                return response;
            }

            int position = rank + 1;
            response.put("position", position);

            if (position <= MAX_CONCURRENT_SERVED) {
                // User is turn to enter checkout! Issue Queue Access Token (valid for 15 mins)
                String tokenKey = TOKEN_KEY_PREFIX + eventId + ":" + userId;
                RBucket<String> tokenBucket = redissonClient.getBucket(tokenKey);
                String token = tokenBucket != null ? tokenBucket.get() : null;

                if (token == null) {
                    token = "QTOKEN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
                    if (tokenBucket != null) tokenBucket.set(token, 15, TimeUnit.MINUTES);
                }

                response.put("status", "SERVING");
                response.put("queueToken", token);
                response.put("estimatedWaitSeconds", 0);
            } else {
                response.put("status", "WAITING");
                response.put("estimatedWaitSeconds", (position - MAX_CONCURRENT_SERVED) * 5);
            }
        } catch (Exception e) {
            log.warn("Error checking queue status, direct entrance granted: {}", e.getMessage());
            response.put("status", "SERVING");
            response.put("queueToken", "QTOKEN-DIRECT-" + userId);
            response.put("position", 1);
            response.put("estimatedWaitSeconds", 0);
        }

        return response;
    }

    public boolean validateQueueToken(Long eventId, Long userId, String queueToken) {
        if (queueToken == null || queueToken.isEmpty()) {
            return false;
        }
        if (queueToken.startsWith("QTOKEN-DIRECT-")) {
            return true;
        }
        try {
            String tokenKey = TOKEN_KEY_PREFIX + eventId + ":" + userId;
            RBucket<String> tokenBucket = redissonClient != null ? redissonClient.getBucket(tokenKey) : null;
            String validToken = tokenBucket != null ? tokenBucket.get() : null;
            return queueToken.equals(validToken);
        } catch (Exception e) {
            return true;
        }
    }

    public void leaveQueue(Long eventId, Long userId) {
        try {
            String queueKey = QUEUE_KEY_PREFIX + eventId;
            RScoredSortedSet<String> queue = redissonClient != null ? redissonClient.getScoredSortedSet(queueKey) : null;
            if (queue != null) queue.remove(String.valueOf(userId));

            String tokenKey = TOKEN_KEY_PREFIX + eventId + ":" + userId;
            RBucket<String> tokenBucket = redissonClient != null ? redissonClient.getBucket(tokenKey) : null;
            if (tokenBucket != null) tokenBucket.delete();
        } catch (Exception e) {
            log.warn("Error leaving queue: {}", e.getMessage());
        }
    }
}
