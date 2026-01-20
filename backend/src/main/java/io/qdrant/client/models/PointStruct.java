package io.qdrant.client.models;

import java.util.HashMap;
import java.util.Map;

public class PointStruct {
    private long id;
    private float[] vectors;
    private Map<String, Object> payload = new HashMap<>();

    public static Builder newBuilder() {
        return new Builder();
    }

    public long getId() { return id; }
    public float[] getVectors() { return vectors; }
    public Map<String,Object> getPayload() { return payload; }

    public static class Builder {
        private final PointStruct p = new PointStruct();

        public Builder setId(long id) { p.id = id; return this; }
        public Builder setVectors(float[] vectors) { p.vectors = vectors; return this; }
        public Builder putPayload(String key, Object value) { p.payload.put(key, value); return this; }
        public PointStruct build() { return p; }
    }
}

