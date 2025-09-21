

import React, { useContext } from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext';
import { UserRole } from './types';

// Layouts
import AdminLayout from './components/layout/AdminLayout';
import TeacherLayout from './components/layout/TeacherLayout';
import StudentLayout from './components/layout/StudentLayout';

// Pages
import LoginPage from './pages/Login';
import ProfilePage from './pages/Profile';
import NotFoundPage from './pages/NotFound';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminTeachers from './pages/admin/Teachers';
import AdminStudents from './pages/admin/Students';
import AdminGroups from './pages/admin/Groups';
import AdminGroupDetail from './pages/admin/GroupDetail';
import AdminSchedule from './pages/admin/Schedule';
import AdminFinance from './pages/admin/Finance';
import AdminReports from './pages/admin/Reports';

// Teacher Pages
import TeacherDashboard from './pages/teacher/Dashboard';
import TeacherSchedule from './pages/teacher/Schedule';
import TeacherClasses from './pages/teacher/Classes';
import TeacherClassDetail from './pages/teacher/ClassDetail';
import TeacherSession from './pages/teacher/Session';
import TeacherHomework from './pages/teacher/Homework';
import TeacherStudents from './pages/teacher/Students';
import TeacherChessLibrary from './pages/teacher/ChessLibrary';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import StudentSchedule from './pages/student/Schedule';
import StudentClasses from './pages/student/Classes';
import StudentClassDetail from './pages/student/ClassDetail';
import StudentSession from './pages/student/Session';
import StudentHomework from './pages/student/Homework';
import StudentProgress from './pages/student/Progress';


interface ProtectedRouteProps {
  allowedRoles: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const auth = useContext(AuthContext);

  if (!auth?.user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(auth.user.role)) {
    // Redirect to a role-specific dashboard or a not-authorized page
    const homePath = `/${auth.user.role.toLowerCase()}/dashboard`;
    return <Navigate to={homePath} replace />;
  }

  return <Outlet />;
};


const App: React.FC = () => {
    const auth = useContext(AuthContext);

    if (auth?.isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-base-200">
                <div className="text-primary font-bold text-xl animate-pulse">Loading Nexus LMS...</div>
            </div>
        );
    }

    return (
        <HashRouter>
            <Routes>
                <Route 
                    path="/login" 
                    element={
                        auth?.user ? (
                            <Navigate to={`/${auth.user.role.toLowerCase()}/dashboard`} replace />
                        ) : (
                            <LoginPage />
                        )
                    } 
                />
                
                <Route path="/" element={!auth?.user ? <Navigate to="/login" /> : <Navigate to={`/${auth.user.role.toLowerCase()}/dashboard`} />} />

                {/* Admin Routes */}
                <Route element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]} />}>
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="teachers" element={<AdminTeachers />} />
                        <Route path="students" element={<AdminStudents />} />
                        <Route path="groups" element={<AdminGroups />} />
                        <Route path="groups/:groupId" element={<AdminGroupDetail />} />
                        <Route path="schedule" element={<AdminSchedule />} />
                        <Route path="finance" element={<AdminFinance />} />
                        <Route path="reports" element={<AdminReports />} />
                        <Route path="profile" element={<ProfilePage />} />
                    </Route>
                </Route>

                {/* Teacher Routes */}
                <Route element={<ProtectedRoute allowedRoles={[UserRole.TEACHER]} />}>
                    <Route path="/teacher" element={<TeacherLayout />}>
                        <Route path="dashboard" element={<TeacherDashboard />} />
                        <Route path="schedule" element={<TeacherSchedule />} />
                        <Route path="classes" element={<TeacherClasses />} />
                        <Route path="classes/:classId" element={<TeacherClassDetail />} />
                        <Route path="session/:sessionId" element={<TeacherSession />} />
                        <Route path="homework" element={<TeacherHomework />} />
                        <Route path="students" element={<TeacherStudents />} />
                        <Route path="chess-library" element={<TeacherChessLibrary />} />
                        <Route path="profile" element={<ProfilePage />} />
                    </Route>
                </Route>

                {/* Student Routes */}
                <Route element={<ProtectedRoute allowedRoles={[UserRole.STUDENT]} />}>
                    <Route path="/student" element={<StudentLayout />}>
                        <Route path="dashboard" element={<StudentDashboard />} />
                        <Route path="schedule" element={<StudentSchedule />} />
                        <Route path="classes" element={<StudentClasses />} />
                        <Route path="classes/:classId" element={<StudentClassDetail />} />
                        <Route path="session/:sessionId" element={<StudentSession />} />
                        <Route path="homework" element={<StudentHomework />} />
                        <Route path="progress" element={<StudentProgress />} />
                        <Route path="profile" element={<ProfilePage />} />
                    </Route>
                </Route>
                
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </HashRouter>
    );
};

export default App;