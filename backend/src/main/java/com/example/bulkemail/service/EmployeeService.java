package com.example.bulkemail.service;

import com.example.bulkemail.dto.EmployeeDto;
import com.example.bulkemail.dto.EmployeeBulkRequest;
import com.example.bulkemail.dto.EmployeeBulkAction;
import com.example.bulkemail.entity.Department;
import com.example.bulkemail.entity.Employee;
import com.example.bulkemail.entity.EmployeeStatus;
import com.example.bulkemail.entity.Location;
import com.example.bulkemail.repo.DepartmentRepository;
import com.example.bulkemail.repo.EmployeeRepository;
import com.example.bulkemail.repo.LocationRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

@Service
public class EmployeeService {
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final LocationRepository locationRepository;

    public EmployeeService(EmployeeRepository employeeRepository, DepartmentRepository departmentRepository,
                           LocationRepository locationRepository) {
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
        this.locationRepository = locationRepository;
    }

    public EmployeeDto create(EmployeeDto dto) {
        Employee employee = new Employee();
        applyDto(employee, dto);
        return toDto(employeeRepository.save(employee));
    }

    public EmployeeDto update(Long id, EmployeeDto dto) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found"));
        applyDto(employee, dto);
        return toDto(employeeRepository.save(employee));
    }

    public void delete(Long id) {
        employeeRepository.deleteById(id);
    }

    public void bulkAction(EmployeeBulkRequest request) {
        if (request.getIds() == null || request.getIds().isEmpty()) {
            return;
        }
        if (request.getAction() == EmployeeBulkAction.DELETE) {
            employeeRepository.deleteAllById(request.getIds());
            return;
        }
        if (request.getAction() == EmployeeBulkAction.DEACTIVATE) {
            List<Employee> employees = employeeRepository.findAllById(request.getIds());
            for (Employee employee : employees) {
                employee.setStatus(EmployeeStatus.INACTIVE);
            }
            employeeRepository.saveAll(employees);
        }
    }

    public List<EmployeeDto> list(Long departmentId, Long locationId, EmployeeStatus status, String titleContains) {
        Specification<Employee> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (departmentId != null) {
                predicates.add(cb.equal(root.get("department").get("id"), departmentId));
            }
            if (locationId != null) {
                predicates.add(cb.equal(root.get("location").get("id"), locationId));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (titleContains != null && !titleContains.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("title")), "%" + titleContains.toLowerCase() + "%"));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        return employeeRepository.findAll(spec).stream().map(this::toDto).toList();
    }

    public int syncCsv(MultipartFile file) {
        int count = 0;
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String line;
            String[] headers = null;
            while ((line = reader.readLine()) != null) {
                if (headers == null) {
                    headers = splitCsv(line);
                    continue;
                }
                if (line.isBlank()) {
                    continue;
                }
                String[] parts = splitCsv(line);
                if (parts.length < 4) {
                    continue;
                }
                String email = valueFor(headers, parts, "Email Address", "email");
                String fullName = valueFor(headers, parts, "Employee Name", "fullName");
                String title = valueFor(headers, parts, "Designation", "title");
                String statusRaw = valueFor(headers, parts, "status", "Status");
                String departmentName = valueFor(headers, parts, "Department", "department");
                String locationName = valueFor(headers, parts, "Branch/SBU", "Location", "location");
                String externalId = valueFor(headers, parts, "Employee ID", "externalId");
                String whatsapp = valueFor(headers, parts, "Whats App Number", "WhatsApp", "whatsappNumber");

                Department department = departmentName != null && !departmentName.isBlank()
                        ? departmentRepository.findByName(departmentName)
                        .orElseGet(() -> departmentRepository.save(createDepartment(departmentName)))
                        : null;
                Location location = locationName != null && !locationName.isBlank()
                        ? locationRepository.findByName(locationName)
                        .orElseGet(() -> locationRepository.save(createLocation(locationName)))
                        : null;
                Employee employee = employeeRepository.findByEmail(email).orElseGet(Employee::new);
                employee.setEmail(email);
                employee.setFullName(fullName);
                employee.setTitle(title);
                employee.setStatus(parseStatus(statusRaw));
                employee.setDepartment(department);
                employee.setLocation(location);
                employee.setExternalId(externalId);
                employee.setWhatsappNumber(whatsapp);
                employeeRepository.save(employee);
                count++;
            }
        } catch (IOException e) {
            throw new IllegalArgumentException("CSV import failed", e);
        }
        return count;
    }

    private EmployeeStatus parseStatus(String value) {
        if (value == null || value.isBlank()) {
            return EmployeeStatus.ACTIVE;
        }
        return EmployeeStatus.valueOf(value.trim().toUpperCase());
    }

    private Department createDepartment(String name) {
        Department department = new Department();
        department.setName(name);
        return department;
    }

    private Location createLocation(String name) {
        Location location = new Location();
        location.setName(name);
        return location;
    }

    private void applyDto(Employee employee, EmployeeDto dto) {
        employee.setEmail(dto.getEmail());
        employee.setFullName(dto.getFullName());
        employee.setTitle(dto.getTitle());
        employee.setWhatsappNumber(dto.getWhatsappNumber());
        employee.setStatus(dto.getStatus() != null ? dto.getStatus() : EmployeeStatus.ACTIVE);
        if (dto.getDepartmentId() != null) {
            Department department = departmentRepository.findById(dto.getDepartmentId())
                    .orElseThrow(() -> new IllegalArgumentException("Department not found"));
            employee.setDepartment(department);
        }
        if (dto.getLocationId() != null) {
            Location location = locationRepository.findById(dto.getLocationId())
                    .orElseThrow(() -> new IllegalArgumentException("Location not found"));
            employee.setLocation(location);
        }
        employee.setExternalId(dto.getExternalId());
    }

    private EmployeeDto toDto(Employee employee) {
        EmployeeDto dto = new EmployeeDto();
        dto.setId(employee.getId());
        dto.setEmail(employee.getEmail());
        dto.setFullName(employee.getFullName());
        dto.setTitle(employee.getTitle());
        dto.setWhatsappNumber(employee.getWhatsappNumber());
        dto.setStatus(employee.getStatus());
        dto.setDepartmentId(employee.getDepartment() != null ? employee.getDepartment().getId() : null);
        dto.setLocationId(employee.getLocation() != null ? employee.getLocation().getId() : null);
        dto.setExternalId(employee.getExternalId());
        return dto;
    }

    private String[] splitCsv(String line) {
        return line.split(",");
    }

    private String valueFor(String[] headers, String[] parts, String... names) {
        for (String name : names) {
            int idx = indexOf(headers, name);
            if (idx >= 0 && idx < parts.length) {
                String value = parts[idx].trim();
                return value.isBlank() ? null : value;
            }
        }
        return null;
    }

    private int indexOf(String[] headers, String name) {
        for (int i = 0; i < headers.length; i++) {
            if (headers[i] == null) continue;
            String header = headers[i].trim();
            if (header.equalsIgnoreCase(name)) {
                return i;
            }
        }
        return -1;
    }
}
