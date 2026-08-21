package auca.ac.rw.diabetesmonitoring.service;

import auca.ac.rw.diabetesmonitoring.exception.ResourceNotFoundException;
import auca.ac.rw.diabetesmonitoring.model.Doctor;
import auca.ac.rw.diabetesmonitoring.repository.DoctorRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;

    public DoctorService(DoctorRepository doctorRepository) {
        this.doctorRepository = doctorRepository;
    }

    public Doctor create(Doctor doctor) {
        validate(doctor);
        return doctorRepository.save(doctor);
    }

    public List<Doctor> getAll() {
        return doctorRepository.findAll();
    }

    public Doctor getById(Long id) {
        return doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + id));
    }

    public Doctor update(Long id, Doctor updatedDoctor) {
        Doctor existing = getById(id);
        validate(updatedDoctor);
        existing.setFullName(updatedDoctor.getFullName());
        existing.setEmail(updatedDoctor.getEmail());
        existing.setSpecialty(updatedDoctor.getSpecialty());
        return doctorRepository.save(existing);
    }

    public void delete(Long id) {
        Doctor existing = getById(id);
        doctorRepository.delete(existing);
    }

    private void validate(Doctor doctor) {
        if (doctor.getFullName() == null || doctor.getFullName().isBlank()) {
            throw new IllegalArgumentException("Doctor name is required");
        }
        if (doctor.getEmail() == null || doctor.getEmail().isBlank()) {
            throw new IllegalArgumentException("Doctor email is required");
        }
    }
}
