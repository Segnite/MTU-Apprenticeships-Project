import { useEffect, useRef, useState } from "react";
import "./Cp.css";

import "bootstrap/dist/css/bootstrap.min.css";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";

import db from "./firebase/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";

import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

function Cp() {
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm();
  const departmentRef = useRef();
  const [departments, setDepartments] = useState([]);
  async function getDepartments() {
    const colRef = collection(db, "departments");
    const q = query(colRef);

    const querySnapshot = await getDocs(q);
    setDepartments([]);
    let antes = [];

    querySnapshot.forEach((doc) => {
      antes = [...antes, doc.data().key];
    });
    setDepartments(antes);
  }

  useEffect(() => {
    getDepartments();
  }, []);

  async function addDepartment() {
    const colRef = collection(db, "departments");
    const q = query(colRef, where("key", "==", departmentRef.current.value));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty && departmentRef.current.value.trim() != "") {
      const docRef = await addDoc(collection(db, "departments"), {
        ["key"]: departmentRef.current.value.trim(),
      });
      getDepartments();
    }
    departmentRef.current.value = "";
  }

  async function addProject(d) {
    console.log("Works");
    const docRef = await addDoc(collection(db, "projects"), {
      ...d,
    });
    navigate("/");
  }
  return (
    <>
      <Container>
        <Navbar expand="lg" className="bg-body-tertiary glass-navbar">
          <Navbar.Brand
            className="brand-gradient"
            style={{ marginLeft: "20px" }}
          >
            MTU Excel Project
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav"></Navbar.Collapse>
        </Navbar>
        <Button
          className="back-button"
          variant="outline-secondary"
          style={{
            margin: "24px 0 12px 0",
            borderRadius: 8,
            color: "#b4845c",
            borderColor: "#b4845c",
            fontWeight: 600,
          }}
          onClick={() => navigate("/")}
        >
          ← Back to Home
        </Button>
        <div
          className="glass-card"
          style={{
            margin: "40px auto",
            maxWidth: 700,
            borderRadius: 18,
            boxShadow: "0 4px 24px #e9edc9cc",
            background: "#fff",
            padding: "40px 36px 32px 36px",
          }}
        >
          <h2
            style={{
              textAlign: "center",
              fontWeight: 700,
              letterSpacing: 1,
              color: "#b4845c",
              marginBottom: 32,
            }}
          >
            Create a Project
          </h2>
          <Form onSubmit={handleSubmit(addProject)}>
            <Row className="mb-3">
              <Form.Group as={Col} controlId="formGridEmail">
                <Form.Label style={{ fontWeight: 600, color: "#b4845c" }}>
                  Name Of The Project
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="MDM 2020"
                  {...register("NameOfTheProject")}
                  required={true}
                  className="dev-input"
                  style={{
                    background: "#fefae0",
                    border: "1.5px solid #faedcd",
                    borderRadius: 8,
                    color: "#b4845c",
                    fontWeight: 600,
                  }}
                />
              </Form.Group>
              <Form.Group as={Col} controlId="formGridPassword">
                <Form.Label style={{ fontWeight: 600, color: "#b4845c" }}>
                  Remarks
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ongoing"
                  {...register("Remarks")}
                  required={true}
                  className="dev-input"
                  style={{
                    background: "#fefae0",
                    border: "1.5px solid #faedcd",
                    borderRadius: 8,
                    color: "#b4845c",
                    fontWeight: 600,
                  }}
                />
              </Form.Group>
            </Row>
            <Form.Group className="mb-3" controlId="formGridAddress1">
              <Form.Label style={{ fontWeight: 600, color: "#b4845c" }}>
                PSP MUC
              </Form.Label>
              <Form.Control
                type="number"
                placeholder="3000707016"
                {...register("PSPMUC")}
                required={true}
                className="dev-input"
                style={{
                  background: "#fefae0",
                  border: "1.5px solid #faedcd",
                  borderRadius: 8,
                  color: "#b4845c",
                  fontWeight: 600,
                }}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formGridAddress2">
              <Form.Label style={{ fontWeight: 600, color: "#b4845c" }}>
                PSP POL
              </Form.Label>
              <Form.Control
                type="number"
                placeholder="5000100119"
                {...register("PSPPOL")}
                required={true}
                className="dev-input"
                style={{
                  background: "#fefae0",
                  border: "1.5px solid #faedcd",
                  borderRadius: 8,
                  color: "#b4845c",
                  fontWeight: 600,
                }}
              />
            </Form.Group>
            <Row className="mb-3">
              <Form.Group
                as={Col}
                controlId="formGridCity"
                className="formDepartment"
              >
                <Form.Label style={{ fontWeight: 600, color: "#b4845c" }}>
                  Cover Via
                </Form.Label>
                <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                  <input
                    ref={departmentRef}
                    type="text"
                    placeholder="Add Department"
                    className="dev-input"
                    style={{
                      background: "#fff",
                      border: "1.5px solid #faedcd",
                      borderRadius: 8,
                      color: "#b4845c",
                      fontWeight: 600,
                      padding: "8px 12px",
                    }}
                  />
                  <Button
                    type="button"
                    onClick={(val) => {
                      addDepartment(val);
                    }}
                    style={{
                      borderRadius: 8,
                      background: "linear-gradient(90deg,#d4a373,#faedcd)",
                      border: "none",
                      fontWeight: 700,
                      color: "#fff",
                      boxShadow: "0 2px 8px #e9edc9cc",
                      padding: "8px 24px",
                      fontSize: "1.08rem",
                    }}
                  >
                    Add
                  </Button>
                </div>
                <Form.Select
                  {...register("COVERVIA")}
                  required={true}
                  style={{
                    background: "#fefae0",
                    border: "1.5px solid #faedcd",
                    borderRadius: 8,
                    color: "#b4845c",
                    fontWeight: 600,
                  }}
                >
                  <option value="">----------------------</option>
                  {departments &&
                    departments.map((x, i) => (
                      <option key={i} value={x}>
                        {x}
                      </option>
                    ))}
                </Form.Select>
              </Form.Group>
              <Form.Group as={Col} controlId="formGridState">
                <Form.Label style={{ fontWeight: 600, color: "#b4845c" }}>
                  State
                </Form.Label>
                <Form.Control
                  placeholder="Ongoing"
                  {...register("State")}
                  required={true}
                  className="dev-input"
                  style={{
                    background: "#fefae0",
                    border: "1.5px solid #faedcd",
                    borderRadius: 8,
                    color: "#b4845c",
                    fontWeight: 600,
                  }}
                />
              </Form.Group>
              <Form.Group as={Col} controlId="formGridZip">
                <Form.Label style={{ fontWeight: 600, color: "#b4845c" }}>
                  Sum (h)
                </Form.Label>
                <Form.Control
                  {...register("Sum")}
                  required={true}
                  type="number"
                  className="dev-input"
                  style={{
                    background: "#fefae0",
                    border: "1.5px solid #faedcd",
                    borderRadius: 8,
                    color: "#b4845c",
                    fontWeight: 600,
                  }}
                />
              </Form.Group>
            </Row>
            <Button
              variant="primary"
              type="submit"
              style={{
                borderRadius: 8,
                background: "linear-gradient(90deg,#d4a373,#faedcd)",
                border: "none",
                fontWeight: 700,
                color: "#fff",
                boxShadow: "0 2px 8px #e9edc9cc",
                padding: "12px 0",
                fontSize: "1.1rem",
                width: "100%",
                marginTop: 18,
              }}
            >
              Submit
            </Button>
          </Form>
        </div>
      </Container>
    </>
  );
}

export default Cp;
