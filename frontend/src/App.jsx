import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = window.location.port === '5173' ? 'http://localhost:8080/api/appointments' : '/api/appointments';

const DOCTORS = ['Dr. Rao', 'Dr. Mehta', 'Dr. Sharma'];
const TIME_SLOTS = [
  '09:00–09:30',
  '09:30–10:00',
  '10:00–10:30',
  '10:30–11:00',
  '11:00–11:30',
  '11:30–12:00',
  '14:00–14:30',
  '14:30–15:00',
  '15:00–15:30',
  '15:30–16:00'
];

export default function App() {
  const [appointments, setAppointments] = useState([]);
  const [doctorFilter, setDoctorFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [view, setView] = useState('table');
  const [selectedDate, setSelectedDate] = useState('2026-10-12');

  const [formData, setFormData] = useState({
    patientName: '',
    doctorName: 'Dr. Rao',
    date: '2026-10-12',
    timeSlot: '10:00–10:30',
    status: 'Booked'
  });

  const [editingId, setEditingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchAppointments = async () => {
    try {
      const params = new URLSearchParams();
      if (doctorFilter !== 'All') params.append('doctor', doctorFilter);
      if (statusFilter !== 'All') params.append('status', statusFilter);
      
      const res = await fetch(`${API_URL}?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [doctorFilter, statusFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const url = editingId ? `${API_URL}/${editingId}` : API_URL;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.status === 409) {
        setErrorMsg(data.message || 'Conflict: Slot already booked');
        return;
      }

      if (!res.ok) {
        setErrorMsg(data.message || 'Failed to save appointment');
        return;
      }

      setSuccessMsg(editingId ? 'Appointment updated successfully!' : 'Appointment booked successfully!');
      setEditingId(null);
      setFormData({
        patientName: '',
        doctorName: 'Dr. Rao',
        date: '2026-10-12',
        timeSlot: '10:00–10:30',
        status: 'Booked'
      });
      fetchAppointments();
    } catch (err) {
      setErrorMsg('Server connection error');
    }
  };

  const handleEdit = (appt) => {
    setEditingId(appt.id);
    setFormData({
      patientName: appt.patientName,
      doctorName: appt.doctorName,
      date: appt.date,
      timeSlot: appt.timeSlot,
      status: appt.status
    });
    setErrorMsg('');
    setSuccessMsg('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      patientName: '',
      doctorName: 'Dr. Rao',
      date: '2026-10-12',
      timeSlot: '10:00–10:30',
      status: 'Booked'
    });
    setErrorMsg('');
  };

  const handleCancelAppointment = async (appt) => {
    try {
      setErrorMsg('');
      const res = await fetch(`${API_URL}/${appt.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...appt, status: 'Cancelled' })
      });
      if (res.ok) {
        setSuccessMsg(`Appointment for ${appt.patientName} cancelled.`);
        fetchAppointments();
      }
    } catch (err) {
      setErrorMsg('Failed to cancel appointment');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this appointment?')) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchAppointments();
      }
    } catch (err) {
      setErrorMsg('Failed to delete');
    }
  };

  const calendarDays = Array.from({ length: 31 }, (_, i) => {
    const day = i + 1;
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    return `2026-10-${dayStr}`;
  });

  const getAppointmentsForDay = (dateStr) => {
    return appointments.filter((a) => a.date === dateStr);
  };

  const selectedDayAppointments = getAppointmentsForDay(selectedDate);

  return (
    <div className="container">
      <header className="header">
        <h2>Doctor Appointment Booking</h2>
      </header>

      {errorMsg && <div className="alert alert-error">{errorMsg}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      <div className="card">
        <h3>{editingId ? 'Reschedule / Update Appointment' : 'Add New Appointment'}</h3>
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group">
            <label>Patient Name:</label>
            <input
              type="text"
              required
              value={formData.patientName}
              placeholder="e.g. John Doe"
              onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Doctor Name:</label>
            <select
              value={formData.doctorName}
              onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
            >
              {DOCTORS.map((doc) => (
                <option key={doc} value={doc}>{doc}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Date:</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Time Slot (30 mins):</label>
            <select
              value={formData.timeSlot}
              onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
            >
              {TIME_SLOTS.map((slot) => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
          </div>

          {editingId && (
            <div className="form-group">
              <label>Status:</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Booked">Booked</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Save Changes' : 'Book Appointment'}
            </button>
            {editingId && (
              <button type="button" onClick={handleCancelEdit} className="btn btn-secondary">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="view-toggle">
        <button
          className={`toggle-btn ${view === 'table' ? 'active' : ''}`}
          onClick={() => setView('table')}
        >
          Table View
        </button>
        <button
          className={`toggle-btn ${view === 'calendar' ? 'active' : ''}`}
          onClick={() => setView('calendar')}
        >
          Calendar View
        </button>
      </div>

      {view === 'table' ? (
        <div className="card">
          <div className="filters-row">
            <div className="filter-item">
              <label>Filter Doctor: </label>
              <select value={doctorFilter} onChange={(e) => setDoctorFilter(e.target.value)}>
                <option value="All">All Doctors</option>
                {DOCTORS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="filter-item">
              <label>Filter Status: </label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="All">All Statuses</option>
                <option value="Booked">Booked</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Time Slot</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                    No appointments found
                  </td>
                </tr>
              ) : (
                appointments.map((appt) => (
                  <tr key={appt.id}>
                    <td>{appt.patientName}</td>
                    <td>{appt.doctorName}</td>
                    <td>{appt.date}</td>
                    <td>{appt.timeSlot}</td>
                    <td>
                      <span className={`status-badge status-${appt.status.toLowerCase()}`}>
                        {appt.status}
                      </span>
                    </td>
                    <td>
                      <button onClick={() => handleEdit(appt)} className="btn-link">
                        Edit / Reschedule
                      </button>
                      {appt.status !== 'Cancelled' && (
                        <button onClick={() => handleCancelAppointment(appt)} className="btn-link cancel">
                          Cancel
                        </button>
                      )}
                      <button onClick={() => handleDelete(appt.id)} className="btn-link delete">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card">
          <h3>October 2026 Calendar</h3>
          <p className="hint">Click on any day to list that day's appointments.</p>
          <div className="calendar-grid">
            {calendarDays.map((dateStr) => {
              const dayNum = dateStr.split('-')[2];
              const dayAppts = getAppointmentsForDay(dateStr);
              const count = dayAppts.length;
              const isSelected = selectedDate === dateStr;

              return (
                <div
                  key={dateStr}
                  className={`calendar-cell ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedDate(dateStr)}
                >
                  <div className="day-number">{dayNum}</div>
                  {count > 0 && (
                    <div className="day-count">
                      {count} {count === 1 ? 'appt' : 'appts'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="day-details">
            <h4>Appointments on {selectedDate}</h4>
            {selectedDayAppointments.length === 0 ? (
              <p>No appointments for this date.</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Time Slot</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedDayAppointments.map((appt) => (
                    <tr key={appt.id}>
                      <td>{appt.patientName}</td>
                      <td>{appt.doctorName}</td>
                      <td>{appt.timeSlot}</td>
                      <td>
                        <span className={`status-badge status-${appt.status.toLowerCase()}`}>
                          {appt.status}
                        </span>
                      </td>
                      <td>
                        <button onClick={() => handleEdit(appt)} className="btn-link">
                          Edit
                        </button>
                        {appt.status !== 'Cancelled' && (
                          <button onClick={() => handleCancelAppointment(appt)} className="btn-link cancel">
                            Cancel
                          </button>
                        )}
                        <button onClick={() => handleDelete(appt.id)} className="btn-link delete">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
