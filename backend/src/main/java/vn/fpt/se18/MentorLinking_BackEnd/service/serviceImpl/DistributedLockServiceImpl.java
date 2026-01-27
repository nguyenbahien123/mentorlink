package vn.fpt.se18.MentorLinking_BackEnd.service.serviceImpl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import vn.fpt.se18.MentorLinking_BackEnd.service.DistributedLockService;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

/**
 * In-memory implementation of distributed lock service.
 * For production with multiple servers, consider using Redis or database-based locks.
 */
@Service
@Slf4j
public class DistributedLockServiceImpl implements DistributedLockService {
    
    private final Map<Long, Lock> scheduleLocks = new ConcurrentHashMap<>();
    
    @Override
    public boolean tryLock(Long scheduleId, int timeoutSeconds) {
        if (scheduleId == null) {
            return false;
        }
        
        // Get or create lock for this schedule
        Lock lock = scheduleLocks.computeIfAbsent(scheduleId, k -> new ReentrantLock(true));
        
        try {
            boolean acquired = lock.tryLock(timeoutSeconds, TimeUnit.SECONDS);
            if (acquired) {
                log.info("Lock acquired for schedule: {}", scheduleId);
            } else {
                log.warn("Failed to acquire lock for schedule: {} (timeout)", scheduleId);
            }
            return acquired;
        } catch (InterruptedException e) {
            log.error("Lock acquisition interrupted for schedule: {}", scheduleId, e);
            Thread.currentThread().interrupt();
            return false;
        }
    }
    
    @Override
    public void unlock(Long scheduleId) {
        if (scheduleId == null) {
            return;
        }
        
        Lock lock = scheduleLocks.get(scheduleId);
        if (lock != null) {
            try {
                lock.unlock();
                log.info("Lock released for schedule: {}", scheduleId);
            } catch (IllegalMonitorStateException e) {
                log.warn("Attempted to unlock schedule {} but lock was not held", scheduleId);
            }
        }
    }
    
    @Override
    public boolean isLocked(Long scheduleId) {
        if (scheduleId == null) {
            return false;
        }
        
        Lock lock = scheduleLocks.get(scheduleId);
        if (lock instanceof ReentrantLock) {
            return ((ReentrantLock) lock).isLocked();
        }
        return false;
    }
}
