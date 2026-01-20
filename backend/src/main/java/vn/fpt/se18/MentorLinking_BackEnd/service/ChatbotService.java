package vn.fpt.se18.MentorLinking_BackEnd.service;

import vn.fpt.se18.MentorLinking_BackEnd.entity.Policy;
import vn.fpt.se18.MentorLinking_BackEnd.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vn.fpt.se18.MentorLinking_BackEnd.dto.ChatMessageDTO;
import vn.fpt.se18.MentorLinking_BackEnd.dto.ChatResponseDTO;
import vn.fpt.se18.MentorLinking_BackEnd.dto.MentorRecommendationDTO;
import vn.fpt.se18.MentorLinking_BackEnd.entity.User;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Chatbot service that handles AI-powered responses
 * Combines Qdrant vector search with Gemini API for intelligent responses
 */
@Service
@Slf4j
public class ChatbotService {

    private static final String MENTOR_COLLECTION = "mentors";
    private static final String FAQ_COLLECTION = "faqs";
    private static final String BLOG_COLLECTION = "blogs";
    private static final String POLICY_COLLECTION = "policies";
    private static final int SEARCH_LIMIT = 5;

    @Autowired(required = false)
    private UserRepository userRepository;

    @Autowired(required = false)
    private FaqRepository faqRepository;

    @Autowired(required = false)
    private MentorRepository mentorRepository;

    @Autowired(required = false)
    private MentorCountryRepository mentorCountryRepository;

    @Autowired(required = false)
    private PolicyRepository policyRepository;

    @Autowired(required = false)
    private CustomerPolicyRepository customerPolicyRepository;

    @Autowired(required = false)
    private BlogRepository blogRepository;

    @Autowired
    private DataSyncService dataSyncService;

    /**
     * Process user message and generate AI response
     */
    public ChatResponseDTO processMessage(ChatMessageDTO messageDTO) {
        try {
            String userMessage = messageDTO.getMessage();
            log.info("Processing chat message: {}", userMessage);

            // Try to use full AI pipeline
            try {
                // Prefer DB-based answers (fallback) so we can run without external services
                String answer = generateDbBasedResponse(userMessage);
                List<MentorRecommendationDTO> recommendations = extractAndRecommendMentorsFromDb(userMessage);
                double confidence = recommendations.isEmpty() ? 0.6 : 0.9;

                return ChatResponseDTO.builder()
                        .message(answer)
                        .recommendedMentors(recommendations)
                        .confidence(confidence)
                        .build();
            } catch (Exception aiException) {
                log.warn("AI pipeline failed, using fallback response", aiException);
                // Fallback: return simple response without AI
                return generateFallbackResponse(userMessage);
            }

        } catch (Exception e) {
            log.error("Error processing chat message", e);
            return ChatResponseDTO.builder()
                    .message("Xin lỗi, tôi gặp lỗi khi xử lý yêu cầu của bạn. Vui lòng thử lại sau.")
                    .recommendedMentors(new ArrayList<>())
                    .confidence(0.0)
                    .build();
        }
    }

    /**
     * Generate a response based on DB contents (FAQ, policies, blogs, mentors)
     */
    private String generateDbBasedResponse(String userMessage) {
        if (userMessage == null || userMessage.isBlank()) {
            return "Xin lỗi, tôi không thể trả lời những câu không liên quan.";
        }

        // Tokenize user message
        Set<String> userTokens = tokenize(userMessage);
        String userLower = userMessage.toLowerCase();

        // If after tokenization there's nothing meaningful, consider it unrelated
        if (userTokens.isEmpty()) {
            return "Xin lỗi, tôi không thể trả lời những câu không liên quan.";
        }

        // Enhanced FAQ pattern matching with 10 categories - highest priority
        String structuredResponse = handleStructuredFAQ(userMessage, userLower, userTokens);
        if (structuredResponse != null) {
            return structuredResponse;
        }

        // Handle specific mentor search requests
        boolean mentionsMentor = userLower.contains("mentor") || userLower.contains("cố vấn") ||
                userLower.contains("tìm mentor") || userLower.contains("tìm cố vấn") ||
                userLower.contains("gợi ý mentor") || userLower.contains("mentor nào");

        if (mentionsMentor && !userLower.contains("blog") && !userLower.contains("bài viết")) {
            List<MentorRecommendationDTO> mentorResults = extractAndRecommendMentorsFromDbWithScoring(userMessage, userTokens);
            if (!mentorResults.isEmpty()) {
                StringBuilder sb = new StringBuilder();
                sb.append("🎯 Gợi ý mentor phù hợp với bạn:\n");
                mentorResults.stream().limit(3).forEach(m -> {
                    sb.append("\n👨‍🎓 ").append(m.getName())
                            .append("\n   📚 ").append(m.getExpertise())
                            .append("\n   ⭐ Rating: ").append(String.format("%.1f", m.getRating()))
                            .append("/5\n");
                });
                sb.append("\n💡 Bạn có thể xem chi tiết và đặt lịch tại trang 'Tìm Cố vấn'!");
                return sb.toString();
            }
        }

        // 1) FAQ — compute token overlap / Jaccard and pick best match
        if (faqRepository != null) {
            List<vn.fpt.se18.MentorLinking_BackEnd.entity.FAQ> faqs = faqRepository.findAll();
            double bestScore = 0.0;
            vn.fpt.se18.MentorLinking_BackEnd.entity.FAQ bestFaq = null;

            for (var faq : faqs) {
                String combined = (faq.getQuestion() == null ? "" : faq.getQuestion()) + " " + (faq.getAnswer() == null ? "" : faq.getAnswer());
                double score = jaccardSimilarity(userTokens, tokenize(combined));
                if (score > bestScore) {
                    bestScore = score;
                    bestFaq = faq;
                }
            }

            if (bestFaq != null && bestScore >= 0.25) { // threshold for confident FAQ match
                return "FAQ: " + bestFaq.getQuestion() + "\n" + bestFaq.getAnswer();
            }
        }

        // 2) Policy / Blog search: look for top-matching titles/content
        Map<String, Double> policyMatches = new LinkedHashMap<>();
        if (policyRepository != null) {
            for (var p : policyRepository.findAll()) {
                double s = jaccardSimilarity(userTokens, tokenize(p.getTitle() + " " + (p.getDescription() == null ? "" : p.getDescription())));
                if (s > 0.15) policyMatches.put("MENTOR_POLICY:" + p.getId() + ":" + p.getTitle(), s);
            }
        }
        if (customerPolicyRepository != null) {
            for (var p : customerPolicyRepository.findAll()) {
                double s = jaccardSimilarity(userTokens, tokenize(p.getTitle() + " " + (p.getDescription() == null ? "" : p.getDescription())));
                if (s > 0.15) policyMatches.put("CUSTOMER_POLICY:" + p.getId() + ":" + p.getTitle(), s);
            }
        }

        // Also check blogs: compute similarity and combine with view count
        List<vn.fpt.se18.MentorLinking_BackEnd.entity.Blog> allBlogs = blogRepository != null ? blogRepository.findAll() : List.of();
        int maxViews = allBlogs.stream().map(b -> b.getViewCount() == null ? 0 : b.getViewCount()).max(Integer::compareTo).orElse(1);

        Map<vn.fpt.se18.MentorLinking_BackEnd.entity.Blog, Double> blogScores = new LinkedHashMap<>();
        for (var b : allBlogs) {
            double j = jaccardSimilarity(userTokens, tokenize(b.getTitle() + " " + (b.getContent() == null ? "" : b.getContent())));
            double viewNorm = (b.getViewCount() == null ? 0 : b.getViewCount()) / (double) Math.max(1, maxViews);
            double combined = 0.7 * j + 0.3 * viewNorm;
            if (combined > 0.08) blogScores.put(b, combined);
        }

        // Special-case: explicit blog popularity queries ("nhiều lượt xem", "ít lượt xem")
        boolean mentionsBlog = userMessage.toLowerCase().contains("blog") || userMessage.toLowerCase().contains("bài blog");
        boolean asksMost = userMessage.toLowerCase().contains("nhiều nhất") || userMessage.toLowerCase().contains("nhiều lượt xem") || userMessage.toLowerCase().contains("nhiều");
        boolean asksLeast = userMessage.toLowerCase().contains("ít nhất") || userMessage.toLowerCase().contains("ít lượt xem") || userMessage.toLowerCase().contains("ít ");

        if (mentionsBlog && (asksMost || asksLeast)) {
            // return top or bottom blogs by view count
            List<vn.fpt.se18.MentorLinking_BackEnd.entity.Blog> blogs = allBlogs.stream().filter(b -> b.getIsPublished() != null && b.getIsPublished()).collect(Collectors.toList());
            if (blogs.isEmpty()) return "Hiện tại không có bài blog nào được xuất bản.";
            if (asksMost) {
                blogs.sort(Comparator.comparingInt(b -> -(b.getViewCount() == null ? 0 : b.getViewCount())));
                StringBuilder sb = new StringBuilder();
                sb.append("Các bài blog nhiều lượt xem nhất:\n");
                blogs.stream().limit(5).forEach(b -> sb.append("- ").append(b.getTitle()).append(" (").append(b.getViewCount() == null ? 0 : b.getViewCount()).append(" lượt xem)\n"));
                return sb.toString();
            } else {
                blogs.sort(Comparator.comparingInt(b -> (b.getViewCount() == null ? 0 : b.getViewCount())));
                StringBuilder sb = new StringBuilder();
                sb.append("Các bài blog ít lượt xem nhất:\n");
                blogs.stream().limit(5).forEach(b -> sb.append("- ").append(b.getTitle()).append(" (").append(b.getViewCount() == null ? 0 : b.getViewCount()).append(" lượt xem)\n"));
                return sb.toString();
            }
        }

        if (!policyMatches.isEmpty() || !blogScores.isEmpty()) {
            StringBuilder sb = new StringBuilder();
            if (!policyMatches.isEmpty()) {
                var topPolicies = policyMatches.entrySet().stream().sorted(Map.Entry.<String, Double>comparingByValue().reversed()).limit(3).collect(Collectors.toList());
                sb.append("Các chính sách liên quan:\n");
                for (var e : topPolicies) {
                    sb.append("- ").append(e.getKey().split(":", 3)[2]).append("\n");
                }
            }
            if (!blogScores.isEmpty()) {
                var topBlogs = blogScores.entrySet().stream().sorted(Map.Entry.<vn.fpt.se18.MentorLinking_BackEnd.entity.Blog, Double>comparingByValue().reversed()).limit(5).collect(Collectors.toList());
                sb.append("\nCác bài blog liên quan hoặc phổ biến:\n");
                for (var e : topBlogs) {
                    sb.append("- ").append(e.getKey().getTitle()).append("\n");
                }
            }
            return sb.toString();
        }

        // 3) Mentor matching: match by services, title, bio, country
        List<MentorRecommendationDTO> mentors = extractAndRecommendMentorsFromDbWithScoring(userMessage, userTokens);
        if (!mentors.isEmpty()) {
            StringBuilder sb = new StringBuilder();
            sb.append("Tôi tìm thấy các mentor phù hợp:\n");
            mentors.stream().limit(5).forEach(m -> sb.append("- ").append(m.getName()).append("\n"));
            return sb.toString();
        }

        // 4) Fallback: treat as unrelated
        return "Xin lỗi, tôi không thể trả lời những câu không liên quan.";
    }

    // --- Improved mentor recommendation with scoring ---
    private List<MentorRecommendationDTO> extractAndRecommendMentorsFromDbWithScoring(String userMessage, Set<String> userTokens) {
        List<MentorRecommendationDTO> recommendations = new ArrayList<>();
        if (mentorRepository == null) return recommendations;

        List<vn.fpt.se18.MentorLinking_BackEnd.entity.User> mentors = mentorRepository.findAll();

        for (var m : mentors) {
            double score = 0.0;

            // service names overlap
            if (m.getMentorServices() != null && !m.getMentorServices().isEmpty()) {
                String services = m.getMentorServices().stream().map(s -> s.getServiceName() == null ? "" : s.getServiceName()).collect(Collectors.joining(" "));
                score += 0.5 * jaccardSimilarity(userTokens, tokenize(services));
            }

            // bio and title overlap
            String bioTitle = (m.getBio() == null ? "" : m.getBio()) + " " + (m.getTitle() == null ? "" : m.getTitle());
            score += 0.3 * jaccardSimilarity(userTokens, tokenize(bioTitle));

            // country match heuristic
            if (m.getMentorCountries() != null) {
                for (vn.fpt.se18.MentorLinking_BackEnd.entity.MentorCountry mc : m.getMentorCountries()) {
                    if (mc.getCountry() != null && mc.getCountry().getName() != null) {
                        if (userTokens.contains(mc.getCountry().getName().toLowerCase())) {
                            score += 0.4; // strong boost for explicit country match
                        }
                    }
                }
            }

            // rating weight
            double rating = m.getRating() == null ? 0.0 : m.getRating();
            score += 0.1 * (rating / 5.0);

            if (score > 0.05) {
                MentorRecommendationDTO dto = MentorRecommendationDTO.builder()
                        .mentorId(m.getId())
                        .name(m.getFullname())
                        .expertise(String.join(", ", m.getMentorServices() == null ? List.of("Chưa cập nhật") : m.getMentorServices().stream().map(s -> s.getServiceName()).limit(3).collect(Collectors.toList())))
                        .rating(m.getRating() == null ? 0.0 : m.getRating())
                        .profileImage(m.getProfileImage())
                        .reason("Gợi ý dựa trên nội dung hồ sơ và từ khoá trong câu hỏi")
                        .relevanceScore(score)
                        .build();
                recommendations.add(dto);
            }
        }

        recommendations.sort(Comparator.comparingDouble(MentorRecommendationDTO::getRelevanceScore).reversed());
        return recommendations;
    }

    // --- Tokenization & similarity helpers ---
    private static final Set<String> STOP_WORDS = Set.of("và", "là", "của", "cho", "có", "tôi", "muốn", "những", "theo", "trong", "với", "cần", "được", "để", "cái", "một", "các");

    private Set<String> tokenize(String text) {
        if (text == null) return Collections.emptySet();
        String normalized = text.toLowerCase().replaceAll("[^a-z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ\\s]", " ");
        String[] parts = normalized.split("\\s+");
        Set<String> tokens = new HashSet<>();
        for (String p : parts) {
            if (p == null || p.length() < 2) continue;
            if (STOP_WORDS.contains(p)) continue;
            tokens.add(p);
        }
        return tokens;
    }

    private double jaccardSimilarity(Set<String> a, Set<String> b) {
        if ((a == null || a.isEmpty()) && (b == null || b.isEmpty())) return 1.0;
        if (a == null || a.isEmpty() || b == null || b.isEmpty()) return 0.0;
        Set<String> intersection = new HashSet<>(a);
        intersection.retainAll(b);
        Set<String> union = new HashSet<>(a);
        union.addAll(b);
        return (double) intersection.size() / (double) union.size();
    }

    /**
     * Handle structured FAQ patterns with 10 comprehensive categories
     */
    private String handleStructuredFAQ(String userMessage, String userLower, Set<String> userTokens) {
        // Special handling for frequently asked questions with improved patterns

        // Blog-related questions - handle these specifically
        if (matchesPattern(userLower, "số câu hỏi thường xuyên", "câu hỏi thường gặp", "câu hỏi phổ biến", "hỏi thường xuyên")) {
            return "Các câu hỏi thường gặp về MentorLink:\n• Cách tìm và chọn mentor phù hợp\n• Quy trình đặt lịch và thanh toán\n• Chính sách hoàn tiền và hủy lịch\n• Các quốc gia và chương trình du học được hỗ trợ\n• Cách trở thành mentor trên nền tảng\n\nBạn có thể hỏi cụ thể về bất kỳ chủ đề nào!";
        }

        // Booking/Schedule related
        if (matchesPattern(userLower, "đặt lịch", "book", "hẹn", "lịch hẹn", "booking")) {
            return "Hướng dẫn đặt lịch với mentor:\n1. Vào trang 'Tìm Cố vấn' để chọn mentor\n2. Xem hồ sơ và đánh giá của mentor\n3. Chọn thời gian phù hợp trong lịch trống\n4. Thanh toán qua VNPay/MoMo/Credit Card\n5. Nhận email xác nhận và link meeting\n\n💡 Lưu ý: Có thể hủy/đổi lịch trước 3 tiếng để được hoàn tiền 100%";
        }

        // Mentor finding
        if (matchesPattern(userLower, "tìm mentor", "chọn mentor", "mentor phù hợp", "tìm cố vấn")) {
            return "Cách tìm mentor phù hợp:\n• Sử dụng bộ lọc theo quốc gia (Mỹ, Hàn, Úc, Canada...)\n• Chọn theo chuyên ngành (Business, IT, Y khoa...)\n• Xem rating và review từ học viên trước\n• So sánh mức giá và kinh nghiệm\n• Đọc bio và background của mentor\n\n🔍 Tip: Nên đọc kỹ hồ sơ và đặt câu hỏi cụ thể khi booking!";
        }

        // Policy questions - Customer policies
        if (matchesPattern(userLower, "chính sách người dùng", "chính sách khách hàng", "quy định người dùng", "điều khoản sử dụng")) {
            if (customerPolicyRepository != null) {
                List<vn.fpt.se18.MentorLinking_BackEnd.entity.CustomerPolicy> policies = customerPolicyRepository.findAll();
                if (!policies.isEmpty()) {
                    StringBuilder sb = new StringBuilder();
                    sb.append("Chính sách dành cho người dùng MentorLink:\n");
                    policies.stream().limit(5).forEach(p -> sb.append("• ").append(p.getTitle()).append("\n"));
                    sb.append("\nXem chi tiết tại mục 'Chính sách' trên website.");
                    return sb.toString();
                }
            }
            return "Chính sách người dùng MentorLink bao gồm:\n• Quy định sử dụng dịch vụ\n• Chính sách bảo mật thông tin\n• Quy trình khiếu nại và hỗ trợ\n• Điều khoản thanh toán và hoàn tiền\n\nVui lòng xem chi tiết tại mục 'Chính sách' trên website.";
        }

        // Policy questions - Mentor policies  
        if (matchesPattern(userLower, "chính sách mentor", "quy định mentor", "chính sách cố vấn")) {
            if (policyRepository != null) {
                List<Policy> policies = policyRepository.findAll();
                if (!policies.isEmpty()) {
                    StringBuilder sb = new StringBuilder();
                    sb.append("Chính sách dành cho mentor:\n");
                    policies.stream().limit(5).forEach(p -> sb.append("• ").append(p.getTitle()).append("\n"));
                    sb.append("\nCác mentor cần tuân thủ nghiêm ngặt các quy định này.");
                    return sb.toString();
                }
            }
            return "Chính sách dành cho mentor:\n• Tiêu chuẩn tuyển chọn và xác minh\n• Quy định về chất lượng tư vấn\n• Chính sách hoa hồng và thanh toán\n• Quy trình xử lý khiếu nại\n• Điều khoản hợp tác\n\nXem chi tiết tại mục dành cho mentor.";
        }

        // Countries and programs
        if (matchesPattern(userLower, "quốc gia", "nước nào", "hỗ trợ quốc gia", "mentor ở đâu", "châu á", "châu âu")) {
            if (mentorCountryRepository != null) {
                List<vn.fpt.se18.MentorLinking_BackEnd.entity.MentorCountry> mentorCountries = mentorCountryRepository.findAll();
                Set<String> countries = mentorCountries.stream()
                        .filter(mc -> mc.getCountry() != null && mc.getCountry().getName() != null)
                        .map(mc -> mc.getCountry().getName())
                        .collect(Collectors.toSet());

                if (!countries.isEmpty()) {
                    StringBuilder sb = new StringBuilder();
                    sb.append("MentorLink hiện có mentor từ các quốc gia:\n");
                    countries.stream().limit(10).forEach(country -> sb.append("• ").append(country).append("\n"));
                    sb.append("\n🔍 Bạn có thể lọc mentor theo quốc gia cụ thể tại trang 'Tìm Cố vấn'");
                    return sb.toString();
                }
            }
            return "MentorLink hỗ trợ mentor từ nhiều quốc gia:\n• Hoa Kỳ (USA)\n• Hàn Quốc (Korea) \n• Úc (Australia)\n• Canada\n• Nhật Bản\n• Singapore\n• Các nước Châu Âu\n\n🌍 Danh sách đang được mở rộng thường xuyên!";
        }

        // I. Platform & Concept Questions
        if (matchesPattern(userLower, "mentorlink là gì", "nền tảng là gì", "giới thiệu mentorlink", "mentorlink hoạt động")) {
            return "MentorLink là nền tảng kết nối bạn với các mentor - những người đã từng du học tại các quốc gia khác nhau. Chúng tôi giúp bạn tìm mentor phù hợp, đặt lịch tư vấn trực tuyến và nhận hướng dẫn cá nhân về du học, học bổng và định hướng nghề nghiệp.";
        }

        if (matchesPattern(userLower, "ai có thể tham gia", "đối tượng sử dụng", "ai dùng được mentorlink")) {
            return "MentorLink phù hợp với:\n• Học sinh, sinh viên có ý định du học\n• Người muốn tìm hiểu về cuộc sống và học tập ở nước ngoài\n• Ai cần hỗ trợ chuẩn bị hồ sơ, học bổng\n• Người muốn được tư vấn từ những người có kinh nghiệm thực tế";
        }

        if (matchesPattern(userLower, "có phải trả phí", "miễn phí", "chi phí sử dụng")) {
            return "Việc đăng ký và tìm kiếm mentor trên MentorLink hoàn toàn miễn phí. Bạn chỉ trả phí cho các buổi tư vấn trực tiếp với mentor theo giá mà từng mentor đặt ra.";
        }

        // II. Mentor & Services Questions
        if (matchesPattern(userLower, "mentor được kiểm duyệt", "mentor có thật", "xác minh mentor", "mentor tin cậy")) {
            return "Tất cả mentor trên MentorLink đều được kiểm duyệt kỹ lưỡng:\n• Xác minh danh tính và bằng cấp\n• Kiểm tra kinh nghiệm du học thực tế\n• Đánh giá hồ sơ và năng lực tư vấn\n• Theo dõi feedback từ học viên";
        }

        if (matchesPattern(userLower, "tìm mentor phù hợp", "chọn mentor", "lọc mentor")) {
            return "Bạn có thể tìm mentor phù hợp bằng cách:\n• Lọc theo quốc gia du học (Mỹ, Hàn, Úc, Canada...)\n• Chọn theo chuyên ngành (Business, IT, Y khoa...)\n• Xem đánh giá và review từ học viên trước\n• So sánh giá và kinh nghiệm của các mentor";
        }

        if (matchesPattern(userLower, "mentor giúp gì", "dịch vụ mentor", "mentor hỗ trợ", "mentor làm gì")) {
            return "Mentor có thể hỗ trợ bạn:\n• Tư vấn chọn trường, chọn ngành phù hợp\n• Hướng dẫn chuẩn bị hồ sơ du học\n• Viết và sửa SOP, Personal Statement\n• Luyện phỏng vấn xin học bổng/visa\n• Chia sẻ kinh nghiệm sống và học tập";
        }

        // III. Booking Questions
        if (matchesPattern(userLower, "đặt lịch", "book lịch", "hẹn mentor", "đặt hẹn")) {
            return "Để đặt lịch với mentor:\n1. Chọn mentor phù hợp\n2. Xem lịch trống của mentor\n3. Chọn thời gian phù hợp\n4. Thanh toán qua hệ thống\n5. Nhận email xác nhận và link meeting";
        }

        if (matchesPattern(userLower, "hủy lịch", "đổi giờ", "thay đổi lịch hẹn")) {
            return "Bạn có thể hủy hoặc đổi lịch hẹn:\n• Hủy/đổi trước 3 tiếng: hoàn tiền 100%\n• Hủy/đổi trước 12h: hoàn tiền 50%\n• Hủy trong 12h: không hoàn tiền\n• Nếu mentor hủy: hoàn tiền 100%";
        }

        // IV. Session Questions
        if (matchesPattern(userLower, "buổi tư vấn", "mentoring session", "buổi mentoring", "buổi hẹn")) {
            return "Buổi mentoring diễn ra:\n• Thời gian: 45-60 phút\n• Hình thức: Video call trực tuyến\n• Chuẩn bị: Danh sách câu hỏi, hồ sơ hiện tại\n• Sau buổi: Nhận summary và tài liệu hỗ trợ";
        }

        // V. Payment Questions
        if (matchesPattern(userLower, "thanh toán", "payment", "trả tiền", "phương thức thanh toán")) {
            return "MentorLink hỗ trợ thanh toán qua:\n• VNPay (ATM, QR Code)\n• MoMo, ZaloPay\n• Thẻ tín dụng/ghi nợ\n• Chuyển khoản ngân hàng\nTất cả giao dịch đều được bảo mật SSL.";
        }

        if (matchesPattern(userLower, "hoàn tiền", "refund", "chính sách hoàn tiền")) {
            return "Chính sách hoàn tiền MentorLink:\n• Hủy trước 3 tiếng: hoàn 100%\n• Mentor không xuất hiện: hoàn 100%\n• Sự cố kỹ thuật: hoàn 100%\n• Thời gian hoàn tiền: 3-7 ngày làm việc\n• Hoàn về tài khoản/ví điện tử gốc";
        }

        // VI. Notification Questions
        if (matchesPattern(userLower, "email xác nhận", "thông báo", "notification", "nhắc lịch")) {
            return "Hệ thống thông báo MentorLink:\n• Email xác nhận sau khi đặt lịch\n• SMS/Email nhắc trước 24h và 2h\n• Thông báo qua app (nếu có)\n• Link meeting được gửi trước 30 phút";
        }

        // VII. Account Questions
        if (matchesPattern(userLower, "đăng ký", "tạo tài khoản", "register", "sign up")) {
            return "Đăng ký tài khoản MentorLink:\n1. Click 'Đăng ký' trên trang chủ\n2. Nhập email và tạo mật khẩu\n3. Xác nhận qua email\n4. Hoàn thiện hồ sơ cá nhân\n5. Bắt đầu tìm mentor phù hợp!";
        }

        if (matchesPattern(userLower, "quên mật khẩu", "reset password", "khôi phục mật khẩu")) {
            return "Để khôi phục mật khẩu:\n1. Click 'Quên mật khẩu' tại trang đăng nhập\n2. Nhập email đã đăng ký\n3. Kiểm tra email và click link reset\n4. Tạo mật khẩu mới\n5. Đăng nhập với mật khẩu mới";
        }

        if (matchesPattern(userLower, "lịch sử", "history", "đơn hàng", "booking history")) {
            return "Xem lịch sử đặt lịch tại:\n• Trang 'Tài khoản của tôi'\n• Mục 'Lịch sử booking'\n• Bao gồm: lịch hẹn, trạng thái, mentor, thời gian\n• Có thể tải hóa đơn và đánh giá mentor";
        }

        // VIII. Country Questions
        if (matchesPattern(userLower, "quốc gia", "mentor ở đâu", "nước nào", "châu á", "châu âu", "mỹ", "hàn", "úc", "canada")) {
            return "MentorLink hiện có mentor từ:\n• Mỹ (USA) - nhiều nhất\n• Hàn Quốc (Korea)\n• Úc (Australia)\n• Canada\n• Nhật Bản, Singapore\n• Châu Âu (Đức, Anh, Pháp)\nBạn có thể lọc mentor theo quốc gia ở trang tìm kiếm.";
        }

        // IX. Policy & Support Questions
        if (matchesPattern(userLower, "chính sách", "điều khoản", "bảo mật", "privacy")) {
            return "Chính sách MentorLink:\n• Bảo mật thông tin cá nhân tuyệt đối\n• Không chia sẻ dữ liệu với bên thứ 3\n• Tuân thủ GDPR và luật bảo vệ dữ liệu\n• Xem chi tiết tại mục 'Điều khoản sử dụng'";
        }

        if (matchesPattern(userLower, "hỗ trợ", "support", "liên hệ", "khiếu nại")) {
            return "Liên hệ hỗ trợ MentorLink:\n• Email: support@mentorlink.vn\n• Hotline: 1900-xxx-xxx\n• Live chat tại website\n• Thời gian: 8h-22h hàng ngày\n• Phản hồi trong 24h";
        }

        // X. General Questions
        if (matchesPattern(userLower, "trở thành mentor", "đăng ký mentor", "apply mentor")) {
            return "Để trở thành mentor trên MentorLink:\n• Có kinh nghiệm du học ít nhất 1 năm\n• Tốt nghiệp hoặc đang học tại trường uy tín\n• Gửi CV, bằng cấp, chứng minh tài chính\n• Vượt qua phỏng vấn và đào tạo\n• Bắt đầu nhận học viên sau khi được duyệt";
        }

        if (matchesPattern(userLower, "fpt", "startup", "sinh viên fpt", "trường fpt")) {
            return "MentorLink là dự án khởi nghiệp được phát triển bởi sinh viên FPT University, với mục tiêu kết nối cộng đồng du học Việt Nam và tạo cơ hội cho các bạn trẻ tiếp cận mentor chất lượng.";
        }

        return null; // No structured match found
    }

    /**
     * Helper method to check if user message matches any of the given patterns
     */
    private boolean matchesPattern(String userLower, String... patterns) {
        for (String pattern : patterns) {
            if (userLower.contains(pattern)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Extract mentor recommendations using DB (simple heuristic)
     */
    private List<MentorRecommendationDTO> extractAndRecommendMentorsFromDb(String userMessage) {
        List<MentorRecommendationDTO> recommendations = new ArrayList<>();
        if (mentorRepository == null) return recommendations;

        String lower = userMessage == null ? "" : userMessage.toLowerCase();
        // Simple: if user asks for mentor, return top-rated mentors
        if (lower.contains("mentor") || lower.contains("cố vấn")) {
            List<vn.fpt.se18.MentorLinking_BackEnd.entity.User> mentors = mentorRepository.findAll();
            mentors.sort(Comparator.comparing(u -> u.getRating() == null ? 0.0f : -u.getRating()));
            mentors.stream().limit(3).forEach(m -> {
                MentorRecommendationDTO dto = MentorRecommendationDTO.builder()
                        .mentorId(m.getId())
                        .name(m.getFullname())
                        .expertise(String.join(", ", m.getMentorServices() == null ? List.of("Chưa cập nhật") : m.getMentorServices().stream().map(s -> s.getServiceName()).limit(3).collect(Collectors.toList())))
                        .rating(m.getRating() == null ? 0.0 : m.getRating())
                        .profileImage(m.getProfileImage())
                        .reason("Gợi ý dựa trên hồ sơ và đánh giá")
                        .relevanceScore(0.75)
                        .build();
                recommendations.add(dto);
            });
        }

        return recommendations;
    }

    /**
     * Generate fallback response when AI services are unavailable
     */
    private ChatResponseDTO generateFallbackResponse(String userMessage) {
        return ChatResponseDTO.builder()
                .message("Xin lỗi, tôi không thể trả lời những câu không liên quan.")
                .recommendedMentors(new ArrayList<>())
                .confidence(0.5)
                .build();
    }

    /**
     * Search for relevant context from Qdrant collections
     */
    private String searchRelevantContext(String query) {
        StringBuilder context = new StringBuilder();
        // Qdrant is not configured in this environment — return empty context.
        context.append("(Context search disabled - Qdrant not configured)");
        return context.toString();
    }

    /**
     * Search a specific Qdrant collection
     */
    private String searchCollection(String collectionName, float[] queryEmbedding) {
        StringBuilder results = new StringBuilder();
        // Qdrant disabled — no results
        return "";
    }

    /**
     * Generate AI response using Gemini with Vietnamese context
     */
    private String generateAIResponse(String userMessage, String context) {
        // Generative model is not available in this environment. Use DB-based or fallback response.
        String dbAnswer = generateDbBasedResponse(userMessage);
        if (dbAnswer != null && !dbAnswer.isBlank()) return dbAnswer;
        return "Xin lỗi, tính năng tạo phản hồi nâng cao chưa được cấu hình. Vui lòng thử hỏi điều khác hoặc liên hệ hỗ trợ.";
    }

    /**
     * Extract mentor recommendations from context
     */
    private List<MentorRecommendationDTO> extractAndRecommendMentors(String userMessage, String context) {
        // Qdrant disabled - use DB-based recommendation
        return extractAndRecommendMentorsFromDb(userMessage);
    }

    /**
     * Extract expertise areas from mentor profile
     */
    private List<String> extractExpertise(User mentor) {
        if (mentor.getMentorServices() == null || mentor.getMentorServices().isEmpty()) {
            return List.of("Chưa cập nhật");
        }
        return mentor.getMentorServices().stream()
                .map(s -> s.getServiceName())
                .limit(3)
                .collect(Collectors.toList());
    }

    /**
     * Generate embedding for query (same method as in DataSyncService)
     */
    private float[] generateQueryEmbedding(String text) {
        float[] embedding = new float[768];
        String[] words = text.toLowerCase().split("\\s+");

        for (int i = 0; i < 768; i++) {
            float value = 0;
            for (String word : words) {
                value += (float) Math.sin(word.hashCode() * (i + 1)) / words.length;
            }
            embedding[i] = value / 2;
        }

        return embedding;
    }

    /**
     * Calculate confidence score for the response
     */
    private double calculateConfidence(String userMessage, String context) {
        // Simple confidence calculation based on context relevance
        int keywordMatches = 0;
        String[] keywords = userMessage.toLowerCase().split("\\s+");
        String contextLower = context.toLowerCase();

        for (String keyword : keywords) {
            if (keyword.length() > 3 && contextLower.contains(keyword)) {
                keywordMatches++;
            }
        }

        return Math.min(1.0, (double) keywordMatches / keywords.length);
    }

    /**
     * Ensure data is synced to Qdrant (check if collections have data)
     */
    private void ensureDataSynced() {
        try {
            // Qdrant is not available; ensureDataSynced will attempt a noop sync
            dataSyncService.syncAllDataToQdrant();
        } catch (Exception e) {
            log.warn("Failed to check collections (Qdrant disabled), attempting to sync", e);
        }
    }
}
