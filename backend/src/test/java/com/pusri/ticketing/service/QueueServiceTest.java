package com.pusri.ticketing.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.redisson.api.RBucket;
import org.redisson.api.RScoredSortedSet;
import org.redisson.api.RedissonClient;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class QueueServiceTest {

    @Mock
    private RedissonClient redissonClient;

    @Mock
    private RScoredSortedSet queueSet;

    @Mock
    private RBucket tokenBucket;

    private QueueService queueService;

    @BeforeEach
    void setUp() {
        queueService = new QueueService(redissonClient);
    }

    @Test
    void joinQueue_AssignsPositionAndToken_WhenInTopLimit() {
        doReturn(queueSet).when(redissonClient).getScoredSortedSet(anyString());
        doReturn(tokenBucket).when(redissonClient).getBucket(anyString());

        when(queueSet.rank("100")).thenReturn(null).thenReturn(0);
        when(tokenBucket.get()).thenReturn("QTOKEN-TEST1234");

        Map<String, Object> result = queueService.joinQueue(10L, 100L);

        assertEquals("SERVING", result.get("status"));
        assertEquals(1, result.get("position"));
        assertEquals("QTOKEN-TEST1234", result.get("queueToken"));
        verify(queueSet).add(anyDouble(), eq("100"));
    }

    @Test
    void validateQueueToken_ReturnsTrue_WhenTokenMatches() {
        doReturn(tokenBucket).when(redissonClient).getBucket(anyString());
        when(tokenBucket.get()).thenReturn("QTOKEN-MATCH");

        boolean isValid = queueService.validateQueueToken(10L, 100L, "QTOKEN-MATCH");

        assertTrue(isValid);
    }
}
