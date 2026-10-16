package com.doctorappointment.repository;

import com.doctorappointment.model.Appointment;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Repository
public class AppointmentRepository {

    private final List<Appointment> appointments = new CopyOnWriteArrayList<>();
    private final AtomicLong idCounter = new AtomicLong(1);

    public AppointmentRepository() {
        save(new Appointment(null, "John Doe", "Dr. Rao", "2026-10-12", "10:00–10:30", "Booked"));
        save(new Appointment(null, "Sarah Smith", "Dr. Mehta", "2026-10-12", "11:00–11:30", "Booked"));
        save(new Appointment(null, "Michael Green", "Dr. Sharma", "2026-10-12", "09:30–10:00", "Cancelled"));
        save(new Appointment(null, "Emily Clark", "Dr. Rao", "2026-10-16", "14:00–14:30", "Completed"));
    }

    public List<Appointment> findAll() {
        return appointments;
    }

    public Optional<Appointment> findById(Long id) {
        return appointments.stream()
                .filter(a -> a.getId().equals(id))
                .findFirst();
    }

    public Appointment save(Appointment appointment) {
        if (appointment.getId() == null) {
            appointment.setId(idCounter.getAndIncrement());
            appointments.add(appointment);
        } else {
            findById(appointment.getId()).ifPresent(existing -> {
                existing.setPatientName(appointment.getPatientName());
                existing.setDoctorName(appointment.getDoctorName());
                existing.setDate(appointment.getDate());
                existing.setTimeSlot(appointment.getTimeSlot());
                existing.setStatus(appointment.getStatus());
            });
        }
        return appointment;
    }

    public boolean deleteById(Long id) {
        return appointments.removeIf(a -> a.getId().equals(id));
    }
}
