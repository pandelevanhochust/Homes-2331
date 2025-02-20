import React, { useState } from 'react';
import { Button, Container, Form } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createStaff } from '../actions/staffAction';

function AddStaffScreen() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("staff");
  const [service, setService] = useState("none");
  const [image, setImage] = useState("none");
  const [type,setType] = useState("none")
  const [errors, setErrors] = useState({});

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const validateForm = () => {
    let newErrors = {};

    if (!username.includes("@")) {
      newErrors.username = "Gmail must contain '@'.";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const staff = {
    name,
    role,
    type,
    service,
    username,
    password,
    image: image ? image.name : "none", 
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()){
      dispatch(createStaff(staff));
    };
    console.log("Submitted Data:", staff);
    setTimeout(() => {
      navigate("/");
    }, 1500);
  };

  return (
    <Container className="mt-4">
      <h2>Add Staff</h2>
      <Form onSubmit={handleSubmit}>
        {/* Name */}
        <Form.Group className="mb-3">
          <Form.Label>Name</Form.Label>
          <Form.Control 
            type="text" 
            placeholder="Enter name" 
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Form.Group>

        {/* Role Selection (Radio Buttons) */}
        <Form.Group className="mb-3">
          <Form.Label>Role</Form.Label>
          <div>
            <Form.Check
              type="radio"
              label="Staff"
              name="role"
              value="staff"
              checked={role === "staff"}
              onChange={(e) => setRole(e.target.value)}
            />
            <Form.Check
              type="radio"
              label="Admin"
              name="role"
              value="admin"
              checked={role === "admin"}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>
        </Form.Group>

        {role === "staff" ?
        <>
          <Form.Group className="mb-3">
          <Form.Label>Type</Form.Label>
          <div className="d-flex gap-3">
            <Form.Check
              type="radio"
              label="Online"
              name="type"
              value="online"
              checked={type === "online"}
              onChange={(e) => setType(e.target.value)}
            />
            <Form.Check
              type="radio"
              label="Offline"
              name="type"
              value="offline"
              checked={type === "offline"}
              onChange={(e) => setType(e.target.value)}
            />
          </div>
            </Form.Group>
              <Form.Group className="mb-3">
              <Form.Label>Service</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Enter service" 
                value={service}
                onChange={(e) => setService(e.target.value)}
                isInvalid={!!errors.username}
              />
              <Form.Control.Feedback type="invalid">
                {errors.username}
              </Form.Control.Feedback>
            </Form.Group>
        </>
        :
        <>
        </>
        }

          <Form.Group className="mb-3">
            <Form.Label>Username</Form.Label>
            <Form.Control 
              type="email" 
              placeholder="Enter email" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              isInvalid={!!errors.username}
            />
            <Form.Control.Feedback type="invalid">
              {errors.username}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control 
              type="password" 
              placeholder="Enter password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control 
              type="password" 
              placeholder="Confirm password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              isInvalid={!!errors.confirmPassword}
            />
            <Form.Control.Feedback type="invalid">
              {errors.confirmPassword}
            </Form.Control.Feedback>
          </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Upload Image</Form.Label>
          <Form.Control type="file" accept="image/*" onChange={handleImageChange} />
          {image === "none"? <></> : <> {image && <p className="mt-2">Selected: {image.name}</p>} </> }
        </Form.Group>

        <Button variant="primary" type="submit">Submit</Button>
      </Form>
    </Container>
  );
}

export default AddStaffScreen;
