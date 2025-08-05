import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./responsibles.css";
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import { useNavigate } from "react-router-dom";
import db from "./firebase/firebase";
import {
  collection,
  getDocs,
  query,
  updateDoc,
  doc,
  getDoc,
  addDoc,
  setDoc,
} from "firebase/firestore";
import Button from "react-bootstrap/Button";
import { set } from "mongoose";


function Responsibles() {
  const [developers,setDevelopers] = useState(['Marcin Kowalski', 'Marcel Kowal', 'Marcin Nowak']);
  const [responsibleData, setResponsibleData] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [business, setBusiness] = useState({});
  const [itResponsibles, setItResponsibles] = useState({});
  const [description, setDescription] = useState("");
  const navigate = useNavigate();
  
  async function getDevs() {
    const ref = doc(db, "responsibles", "gycKnUsnEyPNGJJwmAjX");
    const docSnap = await getDoc(ref);
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.Devs) {
        setDevelopers(data.Devs);
      }
      console.log("Developers fetched successfully:", data.Devs);
    } 
  }

  async function addProject() {
    navigate("/Cp");
  }
  function upgradeDevelopers() {
    setDevelopers([...developers,""]);
    const ref = doc(db, "responsibles", "gycKnUsnEyPNGJJwmAjX");
    setDoc(ref,{["Devs"]:developers}, {merge: true})
  }
  
  async function getData() {
    let colRef = collection(db, "departments");
    let q = query(colRef);
    let querySnapshot = await getDocs(q);
    let departmentList = [];

    querySnapshot.forEach((doc) => {
      departmentList = [...departmentList, doc.data().key];
    });
    setDepartments(departmentList);

    colRef = collection(db, "responsibles");
    q = query(colRef);
    querySnapshot = await getDocs(q);

    setResponsibleData([]);
    let b;
    querySnapshot.forEach((doc) => {
      b = doc.data();
    });
    setItResponsibles(b.IT);
    setBusiness(b.business);
  }

  const handleAddInput = (department, type) => {
    const updatedResponsibles =
      type === "Business" ? { ...business } : { ...itResponsibles };

    if (!updatedResponsibles[department]) {
      updatedResponsibles[department] = [];
    }
    updatedResponsibles[department].push("");

    if (type === "Business") {
      setBusiness(updatedResponsibles);
    } else {
      setItResponsibles(updatedResponsibles);
    }
  };

  const handleRemoveInput = async (department, type, index) => {
    const updatedResponsibles =
      type === "Business" ? { ...business } : { ...itResponsibles };

    updatedResponsibles[department].splice(index, 1);

    if (type === "Business") {
      setBusiness(updatedResponsibles);
    } else {
      setItResponsibles(updatedResponsibles);
    }

    if (type == "Business") type = "business";
    await setDoc(
      doc(db, "responsibles", "gycKnUsnEyPNGJJwmAjX"),
      {
        [type]: updatedResponsibles,
      },
      { merge: true }
    );
  };

  const handleInputChange = async (e, department, type, index) => {
    const updatedResponsibles =
      type === "Business" ? { ...business } : { ...itResponsibles };

    updatedResponsibles[department][index] = e.target.value;

    if (type === "Business") {
      setBusiness(updatedResponsibles);
      const responsibleDocRef = doc(db, "responsibles", "gycKnUsnEyPNGJJwmAjX");

      await updateDoc(responsibleDocRef, {
        business: {
          ...updatedResponsibles,
        },
      });
    } else {
      setItResponsibles(updatedResponsibles);
      const responsibleDocRef = doc(db, "responsibles", "gycKnUsnEyPNGJJwmAjX");

      await updateDoc(responsibleDocRef, {
        IT: {
          ...updatedResponsibles,
        },
      });
    }
  };

  useEffect(() => {
    getData();
    getDevs();
  }, []);

  return (
    <Container>
      <Navbar expand="lg" className="bg-body-tertiary glass-navbar">
        <Navbar.Brand className="brand-gradient" style={{ marginLeft: "20px" }}>
          MTU Excel Project
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link onClick={addProject} className="link">
              Create a Project
            </Nav.Link>
            <Nav.Link className="link">Responsibles</Nav.Link>
          </Nav>
        </Navbar.Collapse>
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
          maxWidth: 1000,
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
          Business Responsibles
        </h2>
        <div
          className="Responsibles__departments"
          style={{
            background: "#fefae0",
            borderRadius: 16,
            boxShadow: "0 2px 8px #e9edc9cc",
            padding: "24px 18px",
            marginBottom: 32,
          }}
        >
          {departments.map((department) => (
            <div
              key={department}
              className="DepartmentName"
              style={{
                background: "#fff",
                borderRadius: 12,
                boxShadow: "0 2px 8px #e9edc9cc",
                padding: 18,
                margin: 8,
                flex: "0 1 30%",
              }}
            >
              <div
                style={{ fontWeight: 700, color: "#b4845c", marginBottom: 8 }}
              >
                {department}:
              </div>
              {Array.isArray(business[department]) &&
                business[department].map((responsible, index) => (
                  <div
                    key={index}
                    className="responsible-input-container"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: 10,
                    }}
                  >
                    <input
                      type="text"
                      onChange={(e) =>
                        handleInputChange(e, department, "Business", index)
                      }
                      value={responsible}
                      placeholder="Marcin Kowalski"
                      className="department-input"
                      style={{
                        background: "#fefae0",
                        border: "1.5px solid #faedcd",
                        borderRadius: 8,
                        color: "#b4845c",
                        fontWeight: 600,
                        marginRight: 8,
                        flex: 1,
                      }}
                    />
                    <button
                      onClick={() =>
                        handleRemoveInput(department, "Business", index)
                      }
                      className="delete-btn"
                      style={{
                        color: "#d9534f",
                        fontSize: 20,
                        marginLeft: 4,
                        background: "none",
                        border: "none",
                      }}
                    >
                      ❌
                    </button>
                  </div>
                ))}
              <button
                onClick={() => handleAddInput(department, "Business")}
                className="add-btn"
                style={{
                  color: "#198754",
                  fontWeight: 700,
                  fontSize: 18,
                  marginTop: 6,
                  background: "none",
                  border: "none",
                }}
              >
                ➕ Add Responsible
              </button>
            </div>
          ))}
        </div>

        <h2
          style={{
            textAlign: "center",
            fontWeight: 700,
            letterSpacing: 1,
            color: "#b4845c",
            marginBottom: 32,
          }}
        >
          IT Responsibles
        </h2>
        <div
          className="Responsibles__departments"
          style={{
            background: "#fefae0",
            borderRadius: 16,
            boxShadow: "0 2px 8px #e9edc9cc",
            padding: "24px 18px",
          }}
        >
          {departments.map((department) => (
            <div
              key={department}
              className="DepartmentName"
              style={{
                background: "#fff",
                borderRadius: 12,
                boxShadow: "0 2px 8px #e9edc9cc",
                padding: 18,
                margin: 8,
                flex: "0 1 30%",
              }}
            >
              <div
                style={{ fontWeight: 700, color: "#b4845c", marginBottom: 8 }}
              >
                {department}:
              </div>
              {Array.isArray(itResponsibles[department]) &&
                itResponsibles[department].map((responsible, index) => (
                  <div
                    key={index}
                    className="responsible-input-container"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: 10,
                    }}
                  >
                    <textarea
                      type="text"
                      onChange={(e) =>
                        handleInputChange(e, department, "IT", index)
                      }
                      value={responsible}
                      placeholder="Marcel Kowal"
                      className="department-input"
                      style={{
                        background: "#fefae0",
                        border: "1.5px solid #faedcd",
                        borderRadius: 8,
                        color: "#b4845c",
                        fontWeight: 600,
                        marginRight: 8,
                        flex: 1,
                        minHeight: 40,
                        maxHeight: 80,
                      }}
                    />
                    <button
                      onClick={() => handleRemoveInput(department, "IT", index)}
                      className="delete-btn"
                      style={{
                        color: "#d9534f",
                        fontSize: 20,
                        marginLeft: 4,
                        background: "none",
                        border: "none",
                      }}
                    >
                      ❌
                    </button>
                  </div>
                ))}
              <button
                onClick={() => handleAddInput(department, "IT")}
                className="add-btn"
                style={{
                  color: "#198754",
                  fontWeight: 700,
                  fontSize: 18,
                  marginTop: 6,
                  background: "none",
                  border: "none",
                }}
              >
                ➕ Add Responsible
              </button>
            </div>
          ))}
        </div>
      <div>
        <h2
          style={{
            textAlign: "center",
            fontWeight: 700,
            letterSpacing: 1,
            color: "#b4845c",
            marginBottom: 32,
          }}
        >
          Developer List
        </h2> 
        <div
          className="Responsibles__departments"
          style={{
            background: "#fefae0",
            borderRadius: 16,
            boxShadow: "0 2px 8px #e9edc9cc",
            padding: "24px 18px",
          }}
        >
          {
            developers.map((dev,index) => (
              <div style={{display: "flex", alignItems: "center", marginBottom: "10px"}}>
              <input 
              key={index}
              type="text"
              placeholder ="Developer Name"
              value={dev}
              onChange={(e) => {
                const newDevs = [...developers];
                newDevs[index] = e.target.value;
                setDevelopers(newDevs);
                // console.log("Developer Name Changed", developers);
                const ref = doc(db, "responsibles", "gycKnUsnEyPNGJJwmAjX");
                setDoc(ref, {["Devs"]: newDevs}, {merge: true})
              }}
              style={{display: "block", marginBottom:"8px",width:"300px"}}
            />
            <button 
            style={{
              position: 'relative',
              top: '-6px',
              marginLeft: '8px',
              backgroundColor: '#e63946',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '6px 10px',
              cursor: 'pointer',
              width: '50px',
              height: '50px',
             }}
             onClick={(el) => {
              console.log("Delete Developer", index)
              const newDevs = [...developers];
              newDevs.pop(index);
              setDevelopers(newDevs);
             }}>
              ❌
            </button>
            </div>
            ))
          }
          <button 
          onClick={() => {
            setDevelopers([...developers, ""]);
          }}
          style={{padding: '8px 12px', cursor: 'pointer',color: "beige", backgroundColor: '#cbe0edff', border: 'none', borderRadius: '4px', fontWeight: 'bold'}}>
            Add A Developer
          </button>
        </div>
      </div>
      </div>
    </Container>
  );
}

export default Responsibles;
