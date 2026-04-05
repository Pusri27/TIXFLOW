package com.pusri.ticketing.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.redisson.api.RBucket;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@Slf4j
@RequiredArgsConstructor
public class SeatLockService {

    private final RedissonClient redissonClient;

    @Value("${app.booking.lock-ttl-minutes:10}")
    private int lockTtlMinutes;

    private static final String LOCK_KEY_PREFIX = "seat:lock:";
    private static final String HOLD_KEY_PREFIX = "seat:hold:";

    public boolean tryLockSeat(Long seatId, Long userId) {
        String lockKey = LOCK_KEY_PREFIX + seatId;
        String holdKey = HOLD_KEY_PREFIX + seatId;

        try {
            RLock lock = redissonClient.getLock(lockKey);
            RBucket<Long> holdBucket = redissonClient.getBucket(holdKey);
            if (lock == null || holdBucket == null) {
                log.warn("Redis client unavailable, relying on JPA Pessimistic Lock for Seat {}", seatId);
                return true;
            }

            // Acquire short-term distributed lock to atomically set seat hold state
            boolean acquired = lock.tryLock(2, 5, TimeUnit.SECONDS);
            if (!acquired) {
                log.warn("Could not acquire atomic lock for Seat {} by User {}", seatId, userId);
                return false;
            }

            try {
                Long existingHolder = holdBucket.get();
                if (existingHolder != null && !existingHolder.equals(userId)) {
                    log.warn("Seat {} is already held by User {}", seatId, existingHolder);
                    return false;
                }

                // Set hold key in Redis with configured TTL
                holdBucket.set(userId, lockTtlMinutes, TimeUnit.MINUTES);
                log.info("Seat {} successfully held for User {} for {} minutes", seatId, userId, lockTtlMinutes);
                return true;
            } finally {
                if (lock.isHeldByCurrentThread()) {
                    lock.unlock();
                }
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("Interrupted while locking seat {}", seatId, e);
            return false;
        } catch (Exception e) {
            log.warn("Redis unavailable or error for seat {}, falling back to DB lock: {}", seatId, e.getMessage());
            return true;
        }
    }

    public void unlockSeat(Long seatId) {
        String holdKey = HOLD_KEY_PREFIX + seatId;
        String lockKey = LOCK_KEY_PREFIX + seatId;
        try {
            RBucket<Long> holdBucket = redissonClient.getBucket(holdKey);
            if (holdBucket != null) {
                holdBucket.delete();
            }

            RLock lock = redissonClient.getLock(lockKey);
            if (lock != null && lock.isLocked() && lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
            log.info("Seat {} hold released", seatId);
        } catch (Exception e) {
            log.error("Error unlocking seat {}", seatId, e);
        }
    }

    public boolean isSeatLocked(Long seatId) {
        String holdKey = HOLD_KEY_PREFIX + seatId;
        String lockKey = LOCK_KEY_PREFIX + seatId;
        try {
            RBucket<Long> holdBucket = redissonClient.getBucket(holdKey);
            if (holdBucket != null && holdBucket.isExists()) {
                return true;
            }
            RLock lock = redissonClient.getLock(lockKey);
            return lock != null && lock.isLocked();
        } catch (Exception e) {
            log.error("Error checking lock for seat {}", seatId, e);
            return false;
        }
    }
}

