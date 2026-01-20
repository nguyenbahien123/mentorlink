package vn.fpt.se18.MentorLinking_BackEnd.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vn.fpt.se18.MentorLinking_BackEnd.service.EmailService;

@RestController
@RequiredArgsConstructor
@Slf4j(topic = "Email controller")
public class EmailController {

    private final EmailService emailService;

    @GetMapping("/send-email")
    public void send(@RequestParam String to, @RequestParam String subject, @RequestParam String body) {
        emailService.send(to, subject, body);
    }

}
