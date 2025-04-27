import { React, useEffect } from 'react';
import { Alert, ListGroup } from 'react-bootstrap';
import { useDispatch, useSelector } from "react-redux";
import { listStaff } from '../actions/staffAction';
import Loader from '../component/Loader';
import StaffItem from '../component/StaffItem';

function HomeScreen() {
  const dispatch = useDispatch();
  const adminLogin = useSelector((state) => state.adminLogin);
  const staffList = useSelector((state) => state.staffList);
  const {loading,success,staff = [], error} = staffList;
  const {userInfo} = adminLogin;
  const admin_id = userInfo.admin_id;
  useEffect(() => {
    dispatch(listStaff())
  },[dispatch]);
        
  // useEffect(() => {
  //   dispatch(getAudit(staff))
  // },[dispatch,staff]);

  return (
    <div className="mt-4">
      <h2>Staff List</h2>

      {loading && <Loader />}

      {error && <Alert variant="danger">{error}</Alert>}

      {!loading && !error && !Array.isArray(staff) && (
        <Alert variant="warning">No staff found</Alert>
      )}

      {!loading && !error && Array.isArray(staff)  && (
        <ListGroup>
          {staff.map((member) => (
            <ListGroup.Item key={member.id} className="p-3">
              {/* <Link to={`/staff/${member.id}`} className="text-decoration-none"> */}
                <StaffItem staff={member} />
              {/* </Link> */}
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
  
    </div>
  );
}

export default HomeScreen;
