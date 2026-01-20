package vn.fpt.se18.MentorLinking_BackEnd.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * DataSyncService placeholder when Qdrant client is not available.
 * In production enable the Qdrant dependency and restore real implementation.
 */
@Service
@Slf4j
public class DataSyncService {

    public void initializeCollections() {
        log.info("Qdrant client not configured in this environment - skipping collection initialization");
    }

    public void syncAllDataToQdrant() {
        log.info("Qdrant client not configured - skipping data sync");
    }

    // Individual sync methods are intentionally no-ops when Qdrant is disabled
    public void syncMentorsToQdrant() { }
    public void syncFaqsToQdrant() { }
    public void syncBlogsToQdrant() { }
    public void syncPoliciesToQdrant() { }
}
