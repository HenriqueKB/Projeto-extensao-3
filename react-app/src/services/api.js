const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let message = "Erro ao comunicar com o servidor.";
    try {
      const errorData = await response.json();
      if (errorData.error) {
        message = errorData.error;
      }
    } catch (_error) {
      // keep fallback message
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export async function fetchPatients() {
  const result = await request("/patients");
  return result.data || [];
}

export async function createPatient(payload) {
  return request("/patients", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchAppointments() {
  const result = await request("/appointments");
  return result.data || [];
}

export async function createAppointment(payload) {
  return request("/appointments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAppointmentById(id, payload) {
  return request(`/appointments/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteAppointmentById(id) {
  return request(`/appointments/${id}`, { method: "DELETE" });
}

export async function fetchPatientHistoryById(id) {
  return request(`/patients/${id}/history`);
}
