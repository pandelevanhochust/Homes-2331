import { React, useEffect } from 'react';
import { Alert, Container, ListGroup } from 'react-bootstrap';
import { useDispatch, useSelector } from "react-redux";
import { listStaff } from '../actions/staffAction';
import Loader from '../component/Loader';
import StaffItem from '../component/StaffItem';

function HomeScreen() {
  const dispatch = useDispatch();
  const staffList = useSelector((state) => state.staffList);
  const {loading,success,staff = [], error} = staffList;
  
  useEffect(() => {
    dispatch(listStaff())
  },[dispatch]);

  console.log(staff);

  return (
    <Container className="mt-4">
      <h2>Staff List</h2>

      {loading && <Loader />}

      {error && <Alert variant="danger">{error}</Alert>}

      {!loading && !error && staff.length === 0 && (
        <Alert variant="warning">No staff found</Alert>
      )}

      {!loading && !error && staff.length > 0 && (
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
  
    </Container>
  );
}

export default HomeScreen;
