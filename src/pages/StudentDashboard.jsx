// src/pages/StudentDashboard.jsx
import React, { useEffect, useState } from "react";
import { getDatabase, ref, get } from "firebase/database";
import { getAuth } from "firebase/auth";
import { app } from "../firebase";
import { useLocation, useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const db = getDatabase(app);
  const auth = getAuth(app);

  // Try get student from navigation state first
  const [student, setStudent] = useState(location.state?.student || null);
  const [loadingStudent, setLoadingStudent] = useState(!student);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [error, setError] = useState("");

  // Fetch student data if missing
  useEffect(() => {
    if (!student) {
      const fetchStudent = async () => {
        if (!auth.currentUser) {
          navigate("/login");
          return;
        }

        try {
          setLoadingStudent(true);
          const uid = auth.currentUser.uid;
          const userSnapshot = await get(ref(db, `users/${uid}`));

          if (userSnapshot.exists()) {
            const userData = userSnapshot.val();
            if (userData.role !== "student") {
              alert("You are not authorized to view this page.");
              navigate("/login");
              return;
            }
            if (!userData.rollNo) {
              alert("Student roll number not found. Please contact admin.");
              navigate("/login");
              return;
            }
            setStudent({
              email: userData.email,
              rollNo: userData.rollNo,
              uid,
            });
          } else {
            alert("Student data not found. Please login again.");
            navigate("/login");
          }
        } catch (err) {
          alert("Failed to fetch student data. Please login again.");
          navigate("/login");
        } finally {
          setLoadingStudent(false);
        }
      };

      fetchStudent();
    }
  }, [student, auth.currentUser, db, navigate]);

  // Fetch attendance records once student data is available
  useEffect(() => {
    if (!student) return;

    const fetchAttendance = async () => {
      setLoadingAttendance(true);
      setError("");
      try {
        const attendanceRef = ref(db, "attendance");
        const snapshot = await get(attendanceRef);

        if (!snapshot.exists()) {
          setError("No attendance data found.");
          setAttendanceRecords([]);
          setLoadingAttendance(false);
          return;
        }

        const attendanceData = snapshot.val();
        const records = [];

        for (const date in attendanceData) {
          if (attendanceData[date][student.rollNo]) {
            records.push({
              date,
              ...attendanceData[date][student.rollNo],
            });
          }
        }

        if (records.length === 0) {
          setError("No attendance records found for your roll number.");
        }

        setAttendanceRecords(records);
      } catch (err) {
        setError("Failed to load attendance: " + err.message);
      } finally {
        setLoadingAttendance(false);
      }
    };

    fetchAttendance();
  }, [student, db]);

  const handleLogout = () => {
    auth.signOut();
    navigate("/login");
  };

  if (loadingStudent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading student data...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        Student data missing. Please login again.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Student Dashboard</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      <p className="mb-4">
        <strong>Welcome:</strong> {student.email}
      </p>

      <p className="mb-6">
        <strong>Roll Number:</strong> {student.rollNo}
      </p>

      {loadingAttendance ? (
        <p>Loading attendance data...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div>
          <h2 className="text-xl font-semibold mb-4">Attendance Record</h2>
          <table className="w-full border-collapse border">
            <thead>
              <tr>
                <th className="border px-4 py-2">Date</th>
                <th className="border px-4 py-2">Time</th>
                <th className="border px-4 py-2">Mode</th>
                <th className="border px-4 py-2">Name</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRecords.map((rec, idx) => (
                <tr key={idx} className="text-center">
                  <td className="border px-4 py-2">{rec.date}</td>
                  <td className="border px-4 py-2">{rec.time}</td>
                  <td className="border px-4 py-2">{rec.mode}</td>
                  <td className="border px-4 py-2">{rec.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
