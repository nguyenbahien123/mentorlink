package vn.fpt.se18.MentorLinking_BackEnd.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.fpt.se18.MentorLinking_BackEnd.entity.ChatMessageEntity;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessageEntity, Long> {
    
    // Lấy lịch sử chat giữa 2 người (sắp xếp theo thời gian tăng dần)
    @Query("SELECT c FROM ChatMessageEntity c WHERE " +
           "(c.sender = :user1 AND c.recipient = :user2) OR " +
           "(c.sender = :user2 AND c.recipient = :user1) " +
           "ORDER BY c.timestamp ASC")
    List<ChatMessageEntity> findChatHistory(@Param("user1") String user1, 
                                           @Param("user2") String user2);
    
    // Lấy 50 tin nhắn gần nhất giữa 2 người (từ mới nhất đến cũ nhất, sau đó reverse)
    @Query(value = "SELECT * FROM mentor_link.message WHERE " +
           "(from_user = :user1 AND recipient = :user2) OR " +
           "(from_user = :user2 AND recipient = :user1) " +
           "ORDER BY send_date_time DESC LIMIT 50", nativeQuery = true)
    List<ChatMessageEntity> findLast50Messages(@Param("user1") String user1, 
                                               @Param("user2") String user2);

    // Lấy last message giữa 2 người (mới nhất)
    @Query(value = "SELECT * FROM mentor_link.message WHERE " +
           "(from_user = :user1 AND recipient = :user2) OR " +
           "(from_user = :user2 AND recipient = :user1) " +
           "ORDER BY send_date_time DESC LIMIT 1", nativeQuery = true)
    ChatMessageEntity findLastMessageBetween(@Param("user1") String user1,
                                             @Param("user2") String user2);

    // Lấy danh sách đối tác chat cùng last time để hiển thị danh sách cuộc trò chuyện
    @Query(value = "SELECT CASE WHEN from_user = :userEmail THEN recipient ELSE from_user END AS partner, " +
            "MAX(send_date_time) AS last_time " +
            "FROM mentor_link.message " +
            "WHERE from_user = :userEmail OR recipient = :userEmail " +
            "GROUP BY partner " +
            "ORDER BY last_time DESC", nativeQuery = true)
    List<Object[]> findConversationPartners(@Param("userEmail") String userEmail);
    
    // Lấy tất cả chat của một user
    @Query("SELECT c FROM ChatMessageEntity c WHERE " +
           "c.sender = :userEmail OR c.recipient = :userEmail " +
           "ORDER BY c.timestamp DESC")
    List<ChatMessageEntity> findAllByUser(@Param("userEmail") String userEmail);
}
