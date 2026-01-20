package vn.fpt.se18.MentorLinking_BackEnd.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for storing vector data in Qdrant
 * Represents a document that will be embedded and stored
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VectorDocumentDTO {
    private String id; // Unique identifier for the document
    private String content; // Text content to be embedded
    private String type; // Type: MENTOR, FAQ, BLOG, POLICY, BOOKING
    private String metadata; // Additional metadata as JSON
    private Long sourceId; // Reference to original entity ID
}
