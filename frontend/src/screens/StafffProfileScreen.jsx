import React from 'react';

function StaffProfileScreen({ id }) {
  const [staff, setStaff] = useState(null);

  useEffect(() => {
    axios.get(`/api/staff/${id}`)
      .then(response => setStaff(response.data))
      .catch(error => console.error('Error fetching staff details:', error));
  }, [id]);

  if (!staff) return <p>Loading...</p>;

  return (
    <Container className="mt-4">
      <h2>{staff.name}</h2>
      <p>Role: {staff.role}</p>
      <p>Email: {staff.email}</p>
    </Container>
  );
}

export default StafffProfileScreen
