package com.doctorappointment.controller;

import com.doctorappointment.model.Appointment;
import com.doctorappointment.service.AppointmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "*")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @GetMapping
    public List<Appointment> getAppointments(
            @RequestParam(required = false) String doctor,
            @RequestParam(required = false) String status) {
        return appointmentService.getAppointments(doctor, status);
    }

    @PostMapping
    public ResponseEntity<?> createAppointment(@RequestBody Appointment appointment) {
        if (!"Cancelled".equalsIgnoreCase(appointment.getStatus())) {
            String conflictError = appointmentService.checkConflict(
                    null,
                    appointment.getDoctorName(),
                    appointment.getDate(),
                    appointment.getTimeSlot()
            );
            if (conflictError != null) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", conflictError));
            }
        }

        Appointment created = appointmentService.createAppointment(appointment);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAppointment(@PathVariable Long id, @RequestBody Appointment updated) {
        if (!"Cancelled".equalsIgnoreCase(updated.getStatus())) {
            String conflictError = appointmentService.checkConflict(
                    id,
                    updated.getDoctorName(),
                    updated.getDate(),
                    updated.getTimeSlot()
            );
            if (conflictError != null) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", conflictError));
            }
        }

        return appointmentService.updateAppointment(id, updated)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAppointment(@PathVariable Long id) {
        boolean deleted = appointmentService.deleteAppointment(id);
        if (!deleted) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Appointment not found"));
        }
        return ResponseEntity.ok(Map.of("message", "Deleted successfully"));
    }
}
