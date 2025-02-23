import React, { useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { useDispatch, useSelector } from "react-redux";
import { Link } from 'react-router-dom';
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
      {
        loading ?  (<Loader/>)
        : error ? (<h1> {error} </h1>)
        :(
          <ul className="list-group">
          {staff.map(member => (
              <li key={member._id} className="list-group-item">
                  <Link to={`/staff/${member._id}`} className="text-decoration-none">
                    <StaffItem key={member._id} staff={member} />
                  </Link>
              </li>
          ))}
          </ul>
        )
      }

    </Container>
  );
}

export default HomeScreen;
