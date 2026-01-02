package com.example.bulkemail.api;

import com.example.bulkemail.dto.DepartmentDto;
import com.example.bulkemail.dto.EmployeeDto;
import com.example.bulkemail.dto.EmployeeBulkRequest;
import com.example.bulkemail.dto.LocationDto;
import com.example.bulkemail.entity.EmployeeStatus;
import com.example.bulkemail.service.DepartmentService;
import com.example.bulkemail.service.EmployeeService;
import com.example.bulkemail.service.LocationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/directory")
@Tag(name = "Directory")
public class DirectoryController {
    private final DepartmentService departmentService;
    private final LocationService locationService;
    private final EmployeeService employeeService;

    public DirectoryController(DepartmentService departmentService, LocationService locationService,
                               EmployeeService employeeService) {
        this.departmentService = departmentService;
        this.locationService = locationService;
        this.employeeService = employeeService;
    }

    @PostMapping("/departments")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN','DEPT_ADMIN')")
    public DepartmentDto createDepartment(@RequestBody DepartmentDto dto) {
        return departmentService.create(dto);
    }

    @PutMapping("/departments/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN','DEPT_ADMIN')")
    public DepartmentDto updateDepartment(@PathVariable Long id, @RequestBody DepartmentDto dto) {
        return departmentService.update(id, dto);
    }

    @DeleteMapping("/departments/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN')")
    public void deleteDepartment(@PathVariable Long id) {
        departmentService.delete(id);
    }

    @GetMapping("/departments")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN','DEPT_ADMIN','AUDITOR','SENDER','APPROVER')")
    public List<DepartmentDto> listDepartments() {
        return departmentService.list();
    }

    @PostMapping("/locations")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN','DEPT_ADMIN')")
    public LocationDto createLocation(@RequestBody LocationDto dto) {
        return locationService.create(dto);
    }

    @PutMapping("/locations/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN','DEPT_ADMIN')")
    public LocationDto updateLocation(@PathVariable Long id, @RequestBody LocationDto dto) {
        return locationService.update(id, dto);
    }

    @DeleteMapping("/locations/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN')")
    public void deleteLocation(@PathVariable Long id) {
        locationService.delete(id);
    }

    @GetMapping("/locations")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN','DEPT_ADMIN','AUDITOR','SENDER','APPROVER')")
    public List<LocationDto> listLocations() {
        return locationService.list();
    }

    @PostMapping("/employees")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN','DEPT_ADMIN')")
    public EmployeeDto createEmployee(@RequestBody EmployeeDto dto) {
        return employeeService.create(dto);
    }

    @PutMapping("/employees/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN','DEPT_ADMIN')")
    public EmployeeDto updateEmployee(@PathVariable Long id, @RequestBody EmployeeDto dto) {
        return employeeService.update(id, dto);
    }

    @DeleteMapping("/employees/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN')")
    public void deleteEmployee(@PathVariable Long id) {
        employeeService.delete(id);
    }

    @PostMapping("/employees/bulk")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN')")
    public void bulkEmployees(@RequestBody EmployeeBulkRequest request) {
        employeeService.bulkAction(request);
    }

    @GetMapping("/employees")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN','DEPT_ADMIN','AUDITOR','SENDER','APPROVER')")
    public List<EmployeeDto> listEmployees(@RequestParam(required = false) Long departmentId,
                                           @RequestParam(required = false) Long locationId,
                                           @RequestParam(required = false) EmployeeStatus status,
                                           @RequestParam(required = false) String titleContains) {
        return employeeService.list(departmentId, locationId, status, titleContains);
    }

    @PostMapping(value = "/employees/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN')")
    public String importEmployees(@RequestPart("file") MultipartFile file) {
        int imported = employeeService.syncCsv(file);
        return "Imported " + imported + " employees";
    }
}
