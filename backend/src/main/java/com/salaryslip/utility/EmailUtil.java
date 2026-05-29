package com.salaryslip.utility;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

@Component
public class EmailUtil {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${app.company.name:ABC Pvt Ltd}")
    private String companyName;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendSalarySlipEmail(
            String toEmail,
            String employeeName,
            String month,
            byte[] pdfBytes) throws MessagingException {

        MimeMessage message = mailSender.createMimeMessage();

        MimeMessageHelper helper =
                new MimeMessageHelper(message, true, "UTF-8");

        // Fixed line
        helper.setFrom(fromEmail);

        helper.setTo(toEmail);

        helper.setSubject(
                "Salary Slip for " + month + " - " + companyName);

        helper.setText(
                buildEmailBody(employeeName, month),
                true);

        String filename =
                "SalarySlip_" + month.replace(" ", "_") + ".pdf";

        helper.addAttachment(
                filename,
                new ByteArrayResource(pdfBytes),
                "application/pdf");

        mailSender.send(message);
    }

    private String buildEmailBody(String name, String month) {

        return """
                <html>
                <body style="font-family: Arial, sans-serif;">
                    <h2>%s</h2>

                    <p>Dear <b>%s</b>,</p>

                    <p>Please find attached your salary slip for <b>%s</b>.</p>

                    <p>
                        Kindly review it and contact HR if you have any questions.
                    </p>

                    <br>

                    <p>
                        Regards,<br>
                        HR Team<br>
                        %s
                    </p>
                </body>
                </html>
                """.formatted(
                companyName,
                name,
                month,
                companyName
        );
    }
}