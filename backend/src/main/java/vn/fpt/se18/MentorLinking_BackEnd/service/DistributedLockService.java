package vn.fpt.se18.MentorLinking_BackEnd.service;

/**
 * Distributed lock service to prevent race conditions in booking process.
 * Ensures only one user can book a specific schedule at a time.
 */
public interface DistributedLockService {
    
    /**
     * Try to acquire a lock for a specific schedule.
     * 
     * @param scheduleId the schedule ID to lock
     * @param timeoutSeconds maximum time to wait for the lock
     * @return true if lock acquired successfully, false if timeout or lock already held
     */
    boolean tryLock(Long scheduleId, int timeoutSeconds);
    
    /**
     * Release the lock for a specific schedule.
     * 
     * @param scheduleId the schedule ID to unlock
     */
    void unlock(Long scheduleId);
    
    /**
     * Check if a schedule is currently locked.
     * 
     * @param scheduleId the schedule ID to check
     * @return true if locked, false otherwise
     */
    boolean isLocked(Long scheduleId);
}
