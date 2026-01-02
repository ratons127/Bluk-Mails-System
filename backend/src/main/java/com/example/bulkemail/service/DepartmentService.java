package com.example.bulkemail.service;

import com.example.bulkemail.dto.DepartmentDto;
import com.example.bulkemail.entity.Department;
import com.example.bulkemail.repo.DepartmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DepartmentService {
    private final DepartmentRepository departmentRepository;

    public DepartmentService(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    public DepartmentDto create(DepartmentDto dto) {
        Department department = new Department();
        applyDto(department, dto);
        Department saved = departmentRepository.save(department);
        return toDto(saved);
    }

    public DepartmentDto update(Long id, DepartmentDto dto) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Department not found"));
        applyDto(department, dto);
        return toDto(departmentRepository.save(department));
    }

    public void delete(Long id) {
        departmentRepository.deleteById(id);
    }

    public List<DepartmentDto> list() {
        return departmentRepository.findAll().stream().map(this::toDto).toList();
    }

    private void applyDto(Department department, DepartmentDto dto) {
        department.setName(dto.getName());
        if (dto.getParentId() != null) {
            Department parent = departmentRepository.findById(dto.getParentId())
                    .orElseThrow(() -> new IllegalArgumentException("Parent not found"));
            department.setParent(parent);
        } else {
            department.setParent(null);
        }
    }

    public DepartmentDto toDto(Department department) {
        DepartmentDto dto = new DepartmentDto();
        dto.setId(department.getId());
        dto.setName(department.getName());
        dto.setParentId(department.getParent() != null ? department.getParent().getId() : null);
        return dto;
    }
}
