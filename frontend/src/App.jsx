import 'bootstrap/dist/css/bootstrap.min.css';
import { Container } from "react-bootstrap";
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import Header from './component/Header';
import AddStaffScreen from './screens/AddStaffScreen';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';

function App() {
  return (
    <Router>
      <Header />
      <Container>
        <Routes>
          <Route path="/login" element={<LoginScreen/>} />
          {/* <Route path="/staffprofile" element={<StaffProfileScreen/>} /> */}
          <Route path="/addstaff" element={<AddStaffScreen />} />
          <Route path="/" element={<HomeScreen />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
