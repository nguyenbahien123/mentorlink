package vn.fpt.se18.MentorLinking_BackEnd.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

/**
 * QdrantConfig placeholder when the Qdrant client library is not available.
 * To enable real Qdrant integration, add the proper dependency and restore this class to create
 * a QdrantClient bean.
 */
@Configuration
@Slf4j
public class QdrantConfig {

    @Value("${qdrant.host:localhost}")
    private String qdrantHost;

    @Value("${qdrant.port:6334}")
    private int qdrantPort;

    @Value("${qdrant.api-key:#{null}}")
    private String qdrantApiKey;

    @Value("${qdrant.tls:true}")
    private boolean useTls;

    // No bean is created in this environment. The application will use DB-based fallbacks instead.
}
