package io.qdrant.client.models;

public class VectorParams {
    private int size;
    private Distance distance;

    public static Builder newBuilder() {
        return new Builder();
    }

    public int getSize() { return size; }
    public Distance getDistance() { return distance; }

    public static class Builder {
        private final VectorParams vp = new VectorParams();
        public Builder setSize(int size) { vp.size = size; return this; }
        public Builder setDistance(Distance distance) { vp.distance = distance; return this; }
        public VectorParams build() { return vp; }
    }
}
