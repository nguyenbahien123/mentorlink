package vn.fpt.se18.MentorLinking_BackEnd.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.fpt.se18.MentorLinking_BackEnd.entity.ChatMessageEntity;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessageEntity, Long> {
    
    // Lấy lịch sử chat giữa 2 người
    @Query("SELECT c FROM ChatMessageEntity c WHERE " +
           "(c.sender = :user1 AND c.recipient = :user2) OR " +
           "(c.sender = :user2 AND c.recipient = :user1) " +
           "ORDER BY c.timestamp ASC")
    List<ChatMessageEntity> findChatHistory(@Param("user1") String user1, 
                                           @Param("user2") String user2);
    
    // Lấy tất cả chat của một user
    @Query("SELECT c FROM ChatMessageEntity c WHERE " +
           "c.sender = :userEmail OR c.recipient = :userEmail " +
           "ORDER BY c.timestamp DESC")
    List<ChatMessageEntity> findAllByUser(@Param("userEmail") String userEmail);
}
