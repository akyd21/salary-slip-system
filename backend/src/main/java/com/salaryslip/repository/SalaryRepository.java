package com.salaryslip.repository;
import com.salaryslip.entity.SalaryRecord;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SalaryRepository extends MongoRepository<SalaryRecord, String> {
    List<SalaryRecord> findByMonth(String month);
    Optional<SalaryRecord> findByEmployeeIdAndMonth(String employeeId, String month);
    List<SalaryRecord> findByStatus(String status);
     // ✅ LINE 1 ADD KARO — purane records delete karne ke liye
    void deleteByMonth(String month);

    // ✅ LINE 2 ADD KARO — sirf PENDING records fetch karne ke liye
    List<SalaryRecord> findByMonthAndStatus(String month, String status);
}
