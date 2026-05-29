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
}
