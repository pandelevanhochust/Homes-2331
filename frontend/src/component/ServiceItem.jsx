import React from 'react';
import { Button, Form, ListGroup } from 'react-bootstrap';
    
const ServiceItem = ({ service, index, toggleEdit, handleSave, handleChange, handleRemove }) => {
    return (
      <ListGroup.Item className="text-start m-3">
        <div>
          <strong>Service:</strong>{" "}
          {service.editMode ? (
                    <Form.Select
                      value={service.service}
                      required
                      onChange={(e) => handleChange(index, "service", e.target.value)}
                    >
                      <option value="">Select a service</option>
                      <option value="sm">Sm</option>
                      <option value="Sakura">Sakura</option>
                      <option value="Imlive">Imlive</option>
                      <option value="Chat">Chat</option>
                      <option value="Many vid">Many vid</option>
                    </Form.Select>
                  ) : (
                    service.service )}
          <br />
  
          <strong>Username:</strong>{" "}
          {service.editMode ? (
            <Form.Control
              type="text"
              value={service.username}
              onChange={(e) => handleChange(index, "username", e.target.value)}
            />
          ) : (
            service.username
          )}
          {" | "}
          <strong>Password:</strong>{" "}
          {service.editMode ? (
            <Form.Control
              type="text"
              value={service.password}
              onChange={(e) => handleChange(index, "password", e.target.value)}
            />
          ) : (
            service.password
          )}
          <br />
  
          {service.editMode ? (
            <div className="d-flex gap-2 mt-3">
              <Button variant="success" size="sm" onClick={() => handleSave(index)}>
                Save
              </Button>
              <Button variant="danger" size="sm" onClick={() => handleRemove(index)}>
                🗑 Remove
              </Button>
            </div>
          ) : (
            <Button variant="info" size="sm" className="mt-2" onClick={() => toggleEdit(index)}>
              Edit
            </Button>
          )}
        </div>
      </ListGroup.Item>
    );
  };
  
export default ServiceItem
