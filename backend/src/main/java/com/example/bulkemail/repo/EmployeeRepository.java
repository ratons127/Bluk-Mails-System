package com.example.bulkemail.repo;

import com.example.bulkemail.entity.Employee;
import com.example.bulkemail.entity.EmployeeStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long>, JpaSpecificationExecutor<Employee> {
    Optional<Employee> findByEmail(String email);
    long countByStatus(EmployeeStatus status);
}
