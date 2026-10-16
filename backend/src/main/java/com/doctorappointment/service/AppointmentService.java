package com.doctorappointment.service;

import com.doctorappointment.model.Appointment;
import com.doctorappointment.repository.AppointmentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AppointmentService {

    private final AppointmentRepository repository;

    public AppointmentService(AppointmentRepository repository) {
        this.repository = repository;
    }

    public List<Appointment> getAppointments(String doctor, String status) {
        return repository.findAll().stream()
                .filter(a -> doctor == null || doctor.isEmpty() || doctor.equalsIgnoreCase("All") || a.getDoctorName().equalsIgnoreCase(doctor))
                .filter(a -> status == null || status.isEmpty() || status.equalsIgnoreCase("All") || a.getStatus().equalsIgnoreCase(status))
                .collect(Collectors.toList());
    }

    public Optional<Appointment> getAppointmentById(Long id) {
        return repository.findById(id);
    }

    public String checkConflict(Long excludeId, String doctor, String date, String slot) {
        String targetDoctor = doctor != null ? doctor.trim() : "";
        String targetDate = date != null ? date.trim() : "";
        String targetSlot = normalizeSlot(slot);

        for (Appointment a : repository.findAll()) {
            if (excludeId != null && a.getId().equals(excludeId)) {
                continue;
            }
            if ("Cancelled".equalsIgnoreCase(a.getStatus())) {
                continue;
            }
            if (a.getDoctorName().trim().equalsIgnoreCase(targetDoctor) &&
                a.getDate().trim().equals(targetDate) &&
                normalizeSlot(a.getTimeSlot()).equals(targetSlot)) {

                String startTime = slot.split("[-–]")[0].trim();
                String formattedDate = formatDate(date);
                return doctor + " is already booked at " + startTime + " on " + formattedDate;
            }
        }
        return null;
    }

    public Appointment createAppointment(Appointment appointment) {
        if (appointment.getStatus() == null || appointment.getStatus().isEmpty()) {
            appointment.setStatus("Booked");
        }
        return repository.save(appointment);
    }

    public Optional<Appointment> updateAppointment(Long id, Appointment updated) {
        return repository.findById(id).map(existing -> {
            existing.setPatientName(updated.getPatientName());
            existing.setDoctorName(updated.getDoctorName());
            existing.setDate(updated.getDate());
            existing.setTimeSlot(updated.getTimeSlot());
            existing.setStatus(updated.getStatus());
            return repository.save(existing);
        });
    }

    public boolean deleteAppointment(Long id) {
        return repository.deleteById(id);
    }

    private String normalizeSlot(String slot) {
        if (slot == null) return "";
        return slot.replace("–", "-").replace(" ", "").trim();
    }

    private String formatDate(String dateStr) {
        try {
            LocalDate d = LocalDate.parse(dateStr);
            return d.format(DateTimeFormatter.ofPattern("d MMM", Locale.ENGLISH));
        } catch (Exception e) {
            return dateStr;
        }
    }
}
