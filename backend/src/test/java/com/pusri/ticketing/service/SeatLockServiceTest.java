package com.pusri.ticketing.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.redisson.api.RBucket;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;

import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SeatLockServiceTest {

    @Mock
    private RedissonClient redissonClient;

    @Mock
    private RLock rLock;

    @Mock
    private RBucket rBucket;

    private SeatLockService seatLockService;

    @BeforeEach
    void setUp() {
        seatLockService = new SeatLockService(redissonClient);
    }

    @Test
    void tryLockSeat_Success() throws InterruptedException {
        when(redissonClient.getLock(anyString())).thenReturn(rLock);
        doReturn(rBucket).when(redissonClient).getBucket(anyString());
        when(rLock.tryLock(anyLong(), anyLong(), any(TimeUnit.class))).thenReturn(true);
        when(rBucket.get()).thenReturn(null);
        when(rLock.isHeldByCurrentThread()).thenReturn(true);

        boolean locked = seatLockService.tryLockSeat(1L, 100L);

        assertTrue(locked);
        verify(rBucket).set(eq(100L), anyLong(), any(TimeUnit.class));
        verify(rLock).unlock();
    }

    @Test
    void tryLockSeat_AlreadyLockedByOtherUser() throws InterruptedException {
        when(redissonClient.getLock(anyString())).thenReturn(rLock);
        doReturn(rBucket).when(redissonClient).getBucket(anyString());
        when(rLock.tryLock(anyLong(), anyLong(), any(TimeUnit.class))).thenReturn(true);
        when(rBucket.get()).thenReturn(200L);
        when(rLock.isHeldByCurrentThread()).thenReturn(true);

        boolean locked = seatLockService.tryLockSeat(1L, 100L);

        assertFalse(locked);
        verify(rBucket, never()).set(anyLong(), anyLong(), any(TimeUnit.class));
        verify(rLock).unlock();
    }

    @Test
    void unlockSeat_DeletesBucketAndUnlocks() {
        doReturn(rBucket).when(redissonClient).getBucket(anyString());
        when(redissonClient.getLock(anyString())).thenReturn(rLock);
        when(rLock.isLocked()).thenReturn(true);
        when(rLock.isHeldByCurrentThread()).thenReturn(true);

        seatLockService.unlockSeat(1L);

        verify(rBucket).delete();
        verify(rLock).unlock();
    }

    @Test
    void isSeatLocked_ReturnsTrue_WhenBucketExists() {
        doReturn(rBucket).when(redissonClient).getBucket(anyString());
        when(rBucket.isExists()).thenReturn(true);

        boolean locked = seatLockService.isSeatLocked(1L);

        assertTrue(locked);
    }
}
