import 'bootstrap/dist/css/bootstrap.min.css';
import { Container } from "react-bootstrap";
import { useSelector } from 'react-redux';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import Header from './component/Header';
import AddStaffScreen from './screens/AddStaffScreen';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';

function App() {

  const adminLogin = useSelector((state) => state.adminLogin);
  const {userInfo} = adminLogin;
  // const navigate = useNavigate();

  // useEffect(() => {
  //   if(userInfo){
  //     navigate('/');
  //   }else{
  //     navigate('/login');
  //   }
  // })

  return (
    <Router>
      <Header />
      <Container>
        <Routes>
          <Route path="/login" element={userInfo ? <Navigate to="/" /> : <LoginScreen />} />
          <Route path="/addstaff" element={userInfo ? <AddStaffScreen /> : <Navigate to="/login" />} />
          <Route path="/" element={userInfo ? <HomeScreen /> : <Navigate to="/login" />} />        </Routes>
      </Container>
    </Router>
  );
}

export default App;
