import React,{ useEffect, useRef, useState } from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import db from "./firebase/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Resend } from "resend";

function Home() {
  const [filters, setFilters] = React.useState({
  remarks: "",
  PSPMUC: "",
  PSPPOL: "",
  COVERVIA: "",
  State: "",
  Sum: "",
  businessResponsible: "",
  itResponsible: "",
  developer: "",});

  const resend = new Resend("re_e9Mf5nvX_GBEc8bbA3KK3jcoyw2ki8Lui");
  const DevHoursRefs = useRef({});
  const DevHoursRefs2 = useRef({});
  const DevHoursName = useRef();
  const devInput = useRef();
  const navigate = useNavigate();
  const emailRef = useRef();
  const emailRefInput = useRef();
  const devHoursRef1 = useRef();
  const [Projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [business, setBusiness] = useState();
  const [IT, setIT] = useState();
  const [dev, setDev] = useState();
  const [hours, setHours] = useState();
  const [selectedP, setSelectedP] = useState();
  const limitHit1 = useRef();
  const limitHit2 = useRef();
  const [developers,setDevelopers] = useState([]);
  const sumP = 0,
    sumD = 0;

  let PlannedHours = 0,
    HoursDone = 0;
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  async function deleteProject(project, index) {
    // console.log(project, index);
    await deleteDoc(doc(db, "projects", project.id));
    setSelectedProject(null);
    getProjects();
  }

  async function deleteDev(el) {
    const projectId = selectedProject.id;
    let temp = { ...selectedProject };
    delete temp.Devs[el];
    await setDoc(doc(db, "projects", projectId), temp);
    setSelectedProject({ ...temp });
  }

  function checkSum(action) {
    if (!selectedProject || !selectedProject.Devs) return 0;
    let tempCounter = 0;
    const monthsArr = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    Object.values(selectedProject.Devs).forEach((dev) => {
      const hoursObj = action === 1 ? dev.FinalHours : dev.HoursDone;
      monthsArr.forEach((month) => {
        const val = hoursObj?.[month];
        if (val !== undefined && !isNaN(val)) tempCounter += parseFloat(val);
      });
    });
    if (action === 1 && tempCounter > selectedProject.Sum) {
      if (limitHit1.current) limitHit1.current.style.color = "red";
    } else if (action == 1 && tempCounter <= selectedProject.Sum) {
      if (limitHit1.current) limitHit1.current.style.color = "green";
    }

    if (action === 2 && tempCounter > selectedProject.Sum) {
      if (limitHit2.current) limitHit2.current.style.color = "red";
    } else if (action == 2 && tempCounter <= selectedProject.Sum) {
      if (limitHit2.current) limitHit2.current.style.color = "green";
    }
    console.log("TempCounter: ", tempCounter);
    const hours = Math.floor(tempCounter);
    const minutes = Math.round((tempCounter - hours) * 60);

    return `${hours}h ${minutes}m`;
  }

  const [editingDevs, setEditingDevs] = useState({});

  function handleDevInputChange(username, action, month, value) {
    setEditingDevs((prev) => ({
      ...prev,
      [username]: {
        ...prev[username],
        [action === 1 ? "FinalHours" : "HoursDone"]: {
          ...((prev[username] &&
            prev[username][action === 1 ? "FinalHours" : "HoursDone"]) ||
            {}),
          [month]: value,
        },
      },
    }));
  }

  async function handleDevInputBlur(username, action, month) {
    const value =
    editingDevs?.[username]?.[action === 1 ? "FinalHours" : "HoursDone"]?.[
      month
    ];
    if (value === undefined) return;
    let tempDevs = { ...selectedProject.Devs };
    let obj = { ...tempDevs[username] };
    
    if (action === 1) {
      obj.FinalHours = { ...obj.FinalHours, [month]: parseFloat(value.replace(",", ".")) || 0 };
    } else if (action === 2) {
      obj.HoursDone = { ...obj.HoursDone, [month]: parseFloat(value.replace(",", ".")) || 0 };
    }
    tempDevs[username] = obj;
    const colRef = doc(db, "projects", selectedProject.id);
    await updateDoc(colRef, { Devs: tempDevs });
    const updatedProject = { ...selectedProject, Devs: tempDevs };
    setSelectedProject(updatedProject);
    setEditingDevs((prev) => {
      const copy = { ...prev };
      if (copy[username]) {
        if (action === 1) delete copy[username].FinalHours[month];
        else delete copy[username].HoursDone[month];
        if (
          Object.keys(copy[username].FinalHours || {}).length === 0 &&
          Object.keys(copy[username].HoursDone || {}).length === 0
        )
          delete copy[username];
      }
      return copy;
    });
  }
  
  async function DisplayHours() {
    const colRef = doc(db, "hoursAssigned", "iLYT4JcVB59rUi9vmPqQ");
    const docSnapshot = await getDoc(colRef);

    if (docSnapshot.exists()) {
      const documentData = docSnapshot.data();
      setHours(documentData.Hours);
    }
  }

  async function addDeveloper() {
    const department = selectedProject.COVERVIA;
    const colRef = doc(db, "responsibles", "gycKnUsnEyPNGJJwmAjX");
    const docSnapshot = await getDoc(colRef);

    let temp = { ...selectedProject };
    let startFormatting = devInput.current.value.toLowerCase();
    let DataArray = startFormatting.split(" ");
    let formattedName = DataArray[0] + "_" + DataArray[1];
    if (temp["Devs"] == undefined) {
      temp["Devs"] = {
        [formattedName]: {
          FinalHours: Object.fromEntries(months.map((m) => [m, 0])),
          HoursDone: Object.fromEntries(months.map((m) => [m, 0])),
        },
      };
      await setDoc(doc(db, "projects", temp.id), temp);
    } else {
      temp["Devs"] = {
        ...temp["Devs"],
        [formattedName]: {
          FinalHours: Object.fromEntries(months.map((m) => [m, 0])),
          HoursDone: Object.fromEntries(months.map((m) => [m, 0])),
        },
      };
      await setDoc(doc(db, "projects", temp.id), temp);
    }
    setSelectedProject({ ...temp });
    devInput.current.value = "";
  }

  async function getDevs() {
    const colRef = doc(db, "responsibles", "gycKnUsnEyPNGJJwmAjX");
    const docSnapshot = await getDoc(colRef);
    const documentData = docSnapshot.data();

    setDev(documentData.Devs);
  }

  async function ResponsiblesManagement() {
    const colRef = doc(db, "responsibles", "gycKnUsnEyPNGJJwmAjX");
    const docSnapshot = await getDoc(colRef);
    if (docSnapshot.exists()) {
      const documentData = docSnapshot.data();

      const businessData = documentData.business;
      setBusiness(businessData);

      const ITDATA = documentData.IT;
      setIT(ITDATA);
    }
  }

  async function addProject() {
    navigate("/Cp");
  }

  async function getDevelopers(){
    const colRef = doc(db, "responsibles", "gycKnUsnEyPNGJJwmAjX");
    const docSnapshot = await getDoc(colRef);
    if (docSnapshot.exists()) {
      const documentData = docSnapshot.data();
      setDevelopers(documentData.Devs);
    }
  }

  async function getProjects() {
    const colRef = collection(db, "projects");
    const q = query(colRef);
    const querySnapshot = await getDocs(q);
    let projectsData = [];
    let businessData = "";

    const getBusiness = doc(db, "responsibles", "gycKnUsnEyPNGJJwmAjX");
    getDoc(getBusiness).then((docSnapshot) => {
      businessData = docSnapshot.data().business;
    });
    let tempData = {};
    querySnapshot.forEach((doc) => {
      tempData = doc.data();
      projectsData.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    setProjects(projectsData);
  }

  useEffect(() => {
    getProjects();
    ResponsiblesManagement();
    getDevs();
    DisplayHours();
    getDevelopers();
  }, []);

  const handleProjectClick = (project, index) => {
    setSelectedProject(project);
    setSelectedP(index);
  };

  const closeProjectDetails = () => {
    setSelectedProject(null);
  };

  const filteredProjects = Projects.filter((project) => {
    const devKeys = project.Devs ? Object.keys(project.Devs).map((key) => key.toLowerCase()) : [];
    console.log(devKeys)
    const BR = business && business[project.COVERVIA] ? business[project.COVERVIA].map((val) => val.toLowerCase()) : [];
    const it = IT && IT[project.COVERVIA] ? IT[project.COVERVIA].map((val) => val.toLowerCase()) : [];
    
  return (
    (!filters.remarks || project.Remarks?.toLowerCase().includes(filters.remarks.toLowerCase())) &&
    (!filters.PSPMUC || project.PSPMUC?.toLowerCase().startsWith(filters.PSPMUC.toLowerCase())) &&
    (!filters.PSPPOL || project.PSPPOL?.toLowerCase().startsWith(filters.PSPPOL.toLowerCase())) &&
    (!filters.COVERVIA || project.COVERVIA?.toLowerCase().startsWith(filters.COVERVIA.toLowerCase())) &&
    (!filters.State || project.State?.toLowerCase().includes(filters.State.toLowerCase())) &&
    (!filters.Sum || String(project.Sum).startsWith(filters.Sum.toLowerCase())) &&
    (!filters.developer || 
  devKeys.some((dev) => {
    const devParts = dev.split("_");
    const searchParts = filters.developer.toLowerCase().split(" ").filter(Boolean);
    if (searchParts.length === 0) return true;
    
    const allPartsMatch = searchParts.every(searchPart =>
      devParts.some(devPart => devPart.startsWith(searchPart))
    );
    
    
    return allPartsMatch;
  })
) &&
    (!filters.businessResponsible ||
  (BR.length > 0 && 
    filters.businessResponsible
      .toLowerCase()
      .split(" ")
      .every(searchPart =>
        BR.some(br =>
          br
            .toLowerCase()
            .split(" ")
            .some(brPart => brPart.startsWith(searchPart))
        )
      )
  )
) &&
(!filters.itResponsible ||
  (it.length > 0 &&
    filters.itResponsible
      .toLowerCase()
      .split(" ")
      .every(searchPart =>
        it.some(ir =>
          ir
            .toLowerCase()
            .split(" ")
            .some(irPart => irPart.startsWith(searchPart))
        )
      )
  )
)
  );
});
  
  return (
    <Container>
      <Navbar expand="lg" className="glass-navbar" >
        <Navbar.Brand className="brand-gradient" style={{ marginLeft: 20}}>
          MTU Excel Project
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto" >
            <Nav.Link onClick={addProject} className="link" style={{color: "#033662" }}>
              Create a Project
            </Nav.Link>
            <Nav.Link
              onClick={() => navigate("/responsibles")}
              className="link"
            >
              Responsibles
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      {/* Projects Grid */}
      <div style={{ margin: "32px 0 24px 0" }}>
        <h2
          style={{
            textAlign: "center",
            fontWeight: 700,
            letterSpacing: 1,
            color: '#b4845c',
            marginBottom: 32,
          }}
        > 
          All Projects
        </h2>
        <div style={{ marginBottom: 24 }}>
          <input
            placeholder="Filter by Remarks"
            value={filters.remarks}
            onChange={(e) => setFilters({ ...filters, remarks: e.target.value })}
            style={{ marginBottom:20,marginRight: 8, width: 200,height: 38, padding: "0 12px", borderRadius: 8, border: "1.5px solid #faedcd", color: "#b4845c", fontWeight: 600 }}
          />
          <input
            placeholder="Filter by PSP MUC"
            value={filters.PSPMUC}
            onChange={(e) => setFilters({ ...filters, PSPMUC: e.target.value })}
            style={{ marginBottom:20,marginRight: 8, width: 200,height: 38, padding: "0 12px", borderRadius: 8, border: "1.5px solid #faedcd", color: "#b4845c", fontWeight: 600 }}
          />
          <input
            placeholder="Filter by PSP POL"
            value={filters.PSPPOL}
            onChange={(e) => setFilters({ ...filters, PSPPOL: e.target.value })}
            style={{ marginBottom:20,marginRight: 8, width: 200,height: 38, padding: "0 12px", borderRadius: 8, border: "1.5px solid #faedcd", color: "#b4845c", fontWeight: 600 }}
          />
          <input
            placeholder="Filter by COVERVIA"
            value={filters.COVERVIA}
            onChange={(e) => setFilters({ ...filters, COVERVIA: e.target.value })}
            style={{ marginBottom:20,marginRight: 8, width: 200,height: 38, padding: "0 12px", borderRadius: 8, border: "1.5px solid #faedcd", color: "#b4845c", fontWeight: 600 }}
          />
          <input
            placeholder="Filter by State"
            value={filters.State}
            onChange={(e) => setFilters({ ...filters, State: e.target.value })}
            style={{ marginBottom:20,marginRight: 8, width: 200,height: 38, padding: "0 12px", borderRadius: 8, border: "1.5px solid #faedcd", color: "#b4845c", fontWeight: 600 }}
          />
          <input
            placeholder="Filter by Sum"
            value={filters.Sum}
            onChange={(e) => setFilters({ ...filters, Sum: e.target.value })}
            style={{ marginBottom:20,marginRight: 8, width: 200,height: 38, padding: "0 12px", borderRadius: 8, border: "1.5px solid #faedcd", color: "#b4845c", fontWeight: 600 }}
          />
          
          <input
            placeholder="Filter by Business Responsible"
            value={filters.businessResponsible}
            onChange={(e) =>
              setFilters({ ...filters, businessResponsible: e.target.value })
            }
            style={{ marginBottom:20,marginRight: 8, width: 200,height: 38, padding: "0 12px", borderRadius: 8, border: "1.5px solid #faedcd", color: "#b4845c", fontWeight: 600 }}
          />
          
          <input
            placeholder="Filter by IT Responsible"
            value={filters.itResponsible}
            onChange={(e) => setFilters({ ...filters, itResponsible: e.target.value })}
            style={{ marginBottom:20,marginRight: 8, width: 200,height: 38, padding: "0 12px", borderRadius: 8, border: "1.5px solid #faedcd", color: "#b4845c", fontWeight: 600 }}
          />
          
          <input
            placeholder="Filter by Developer"
            value={filters.developer}
            onChange={(e) => setFilters({ ...filters, developer: e.target.value })}
            style={{ marginBottom:20,marginRight: 8, width: 200,height: 38, padding: "0 12px", borderRadius: 8, border: "1.5px solid #faedcd", color: "#b4845c", fontWeight: 600 }}
          />
        </div>
        <Row
          className="projects-grid"
          style={{ gap: 0, justifyContent: "center" }}
        >
          
          {filteredProjects.length > 0 ? (
          filteredProjects.map((project, index) => (
              <Col
                key={index}
                md={4}
                sm={6}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: 32,
                }}
              >
                <Card
                  className="project-card glass-card"
                  style={{
                    
                    width: "100%",
                    maxWidth: 370,
                    minHeight: 180,
                    borderRadius: 18,
                    boxShadow: "0 4px 24px #e9edc9cc",
                    border: "1px solid #e9edc9",
                    color: "#b4845c"
                  }}
                  onClick={() => handleProjectClick(project, index)}
                >
                  <Card.Body style={{ padding: "28px 24px" }}>
                    <Card.Title
                      className="project-title-gradient"
                      style={{
                        fontSize: "1.35rem",
                        fontWeight: 700,
                        marginBottom: 12,
                      }}
                    >
                      {project.NameOfTheProject}
                    </Card.Title>
                    <div
                      style={{
                        height: 1,
                        background: "#b4845c",
                        margin: "10px 0 18px 0",
                        borderRadius: 2,
                      }}
                    ></div>
                    <div>
                      <Button
                        style={{ marginRight: "20px", display: ""}}
                        className="delete-btn-home"
                        onClick={() => deleteProject(project, index)}
                      >
                        Delete
                      </Button>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                        
                      }}
                    >
                      <span style={{ fontWeight: 500, color: "#b4845c" }}>
                        <strong>Remarks:</strong>{" "}
                        <span style={{ color: "#b4845c" }}>{project.Remarks}</span>
                      </span>
                      <span style={{ fontWeight: 500, color: "#b4845c"  }}>
                        <strong>PSP MUC:</strong>{" "}
                        <span style={{ color: "#b4845c" }}>{project.PSPMUC}</span>
                      </span>
                      <span style={{ fontWeight: 500, color: "#b4845c"  }}>
                        <strong>PSP POL:</strong>{" "}
                        <span style={{ color: "#b4845c" }}>{project.PSPPOL}</span>
                      </span>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))
          ) : (
            <p style={{ textAlign: "center", color: "#b4845c" }}>
              No projects available.
            </p>
          )}
        </Row>
      </div>

      {/* Full Project Details Side Panel */}
      {selectedProject && (
        <div
          className="project-details-modal open glass-panel"
          style={{
            padding: 0,
            minHeight: "80vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              padding: "16px 36px 0 36px",
            }}
          >
            <Button
              variant="outline-secondary"
              onClick={closeProjectDetails}
              style={{
                fontWeight: 600,
                color: "#b4845c",
                borderColor: '#b4845c',
                marginRight: 12,
              }}
              className="back-button"
            >
              ← Back to Projects
            </Button>
            <button
              className="close-button"
              onClick={closeProjectDetails}
              title="Close"
            >
              &times;
            </button>
          </div>
          <div
            className="project-details-modal-content"
            style={{
              padding: '24px 36px 32px 36px', borderRadius: 18, boxShadow: '0 8px 32px #e9edc9cc', maxWidth: 900, margin: '0 auto', background: '#fff'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              className="project-title-gradient"
              style={{
                fontSize: "2rem",
                fontWeight: 800,
                textAlign: "center",
                marginBottom: 18,
                color: "#b4845c"
              }}
            >
              {selectedProject.NameOfTheProject}
            </h3>
            <div
              style={{
                height: 2, background: '#e9edc9', margin: '0 0 28px 0', borderRadius: 2
              }}
            ></div>
            <Container className="Cont" style={{ marginBottom: 24 }}>
              <Row>
                <Col
                  md={6}
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  <span style={{ fontWeight: 600, color: "#b4845c" }}>
                    <strong>Remarks:</strong>{" "}
                    <span style={{ color: "#b4845c" }}>
                      {selectedProject.Remarks}
                    </span>
                  </span>
                  <span style={{ fontWeight: 600, color: "#b4845c" }}>
                    <strong>PSP MUC:</strong>{" "}
                    <span style={{ color: "#b4845c" }}>
                      {selectedProject.PSPMUC}
                    </span>
                  </span>
                  <span style={{ fontWeight: 600, color: "#b4845c" }}>
                    <strong>PSP POL:</strong>{" "}
                    <span style={{ color: "#b4845c" }}>
                      {selectedProject.PSPPOL}
                    </span>
                  </span>
                  <span style={{ fontWeight: 600, color: "#b4845c" }}>
                    <strong>Cover Via:</strong>{" "}
                    <span style={{ color: "#b4845c" }}>
                      {selectedProject.COVERVIA}
                    </span>
                  </span>
                  <span style={{ fontWeight: 600, color: "#b4845c" }}>
                    <strong>State:</strong>{" "}
                    <span style={{ color: "#b4845c" }}>
                      {selectedProject.State}
                    </span>
                  </span>
                  <span style={{ fontWeight: 600, color: "#b4845c" }}>
                    <strong>Sum:</strong>{" "}
                    <span style={{ color: "#b4845c" }}>{selectedProject.Sum}</span>
                  </span>
                </Col>
                <Col
                  md={6}
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  <div className="responsibles-section" style={{ gap: 8 }}>
                    <span style={{ fontWeight: 700, color: "#b4845c" }}>
                      Business Responsibles:
                    </span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {business &&
                        business[selectedProject.COVERVIA] &&
                        business[selectedProject.COVERVIA].map((val) => (
                          <span
                            key={val}
                            className="IT__Responsibles badge badge-business"
                            style={{ backgroundColor: "#b4845c", color: "white" }}
                          >
                            {val}
                          </span>
                        ))}
                    </div>
                  </div>
                  <div className="responsibles-section" style={{ gap: 8 }}>
                    <span style={{ fontWeight: 700, color: "#b4845c", }}>
                      IT Responsibles:
                    </span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {IT &&
                        IT[selectedProject.COVERVIA] &&
                        IT[selectedProject.COVERVIA].map((val) => (
                          <span
                            className="IT__Responsibles badge badge-it"
                            key={val}
                            style={{ backgroundColor: "#b4845c", color: "white" }}
                          >
                            {val}
                          </span>
                        ))}
                    </div>
                  </div>
                </Col>
              </Row>
            </Container>
            <div style={{ margin: "32px 0 0 0", width: "100%" }}>
              <strong
                className="dev-title-gradient"
                style={{
                  fontSize: "1.3rem",
                  fontWeight: 700,
                  marginBottom: 18,
                  display: "block",
                  color: "#b4845c"
                }}
              >
                Dev Responsibles
              </strong>
              <div
                style={{
                  background: "#fefae0",
                  borderRadius: 16,
                  padding: "24px 18px",
                  boxShadow: "0 2px 8px #e9edc9cc",
                }}
              >
                <Container style={{ marginBottom: "18px" }}>
                  <Row className="dev-table-header">
                    <Col
                      style={{
                        fontWeight: 700,
                        color: "#b4845c",
                        textAlign: "center",
                      }}
                    >
                      Developer Name
                    </Col>
                    <Col
                      style={{
                        fontWeight: 700,
                        color: "#b4845c",
                        textAlign: "center",
                      }}
                    >
                      Planned Hours
                    </Col>
                    <Col
                      style={{
                        fontWeight: 700,
                        color: "#b4845c",
                        textAlign: "center",
                      }}
                    >
                      Hours Done
                    </Col>
                  </Row>
                  <Row>
                    <Col
                      style={{
                        fontWeight: 700,
                        color: "#b4845c",
                        textAlign: "center",
                      }}
                    >
                      To split:
                    </Col>
                    <Col
                      span="1"
                      style={{
                        fontWeight: 700,
                        color: "#b4845c",
                        textAlign: "center",
                      }}
                    >
                      <input
                        className="DevRespHours"
                        value={selectedProject.Sum}
                        readOnly
                        style={{
                          background: "#fff",
                          borderRadius: 8,
                          width: 80,
                          textAlign: "center",
                          border: "1.5px solid #faedcd",
                          color: "#b4845c",
                          fontWeight: 700,
                        }}
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col
                      style={{
                        color: "#b4845c",
                        textAlign: "center",
                        fontWeight: 700,
                      }}
                    >
                      Sum
                    </Col>
                    <Col
                      style={{
                        color: "#b4845c",
                        textAlign: "center",
                        fontWeight: 700,
                      }}
                      ref={limitHit1}
                    >
                      {checkSum(1)}
                    </Col>
                    <Col
                      style={{
                        color: "#b4845c",
                        textAlign: "center",
                        fontWeight: 700,
                      }}
                      ref={limitHit2}
                    >
                      {checkSum(2)}
                    </Col>
                  </Row>
                  {selectedProject.Devs &&
                    Object.keys(selectedProject["Devs"])
                      .sort()
                      .map((el) => {
                        let username = el;
                        let obj = selectedProject["Devs"][username];
                        let objHours = obj.FinalHours;
                        let objDone = obj.HoursDone;
                        return (
                          <Row
                            key={el}
                            className="dev-row"
                            style={{
                              alignItems: "center",
                              margin: "0 0 8px 0",
                              padding: "12px 0",
                            }}
                          >
                            <Col
                              style={{
                                display: "flex",
                                alignItems: "center",
                                fontWeight: 700,
                                color: "#b4845c",
                                fontSize: "1.08rem",
                                textAlign: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Button
                                style={{ marginRight: "20px", display: "" }}
                                className="delete-btn"
                                onClick={() => deleteDev(el)}
                              >
                                Delete
                              </Button>
                              <span
                                className="dev-avatar"
                                // style={{ width: "20px", height: "20px" }}
                              >
                                {username[0].toUpperCase()}
                              </span>{" "}
                              {username.replace("_", " ")}
                            </Col>
                            <Col>
                              <div className="dev-months-grid">
                                {months.map((month) => (
                                  <div key={month} className="dev-month-cell">
                                    <span className="dev-month-label">
                                      {month.slice(0, 3)}
                                    </span>
                                    <input
                                    style={{width: "80px"}}
                                      className="DevRespHours dev-input"
                                      value={
                                        editingDevs?.[username]?.FinalHours?.[
                                          month
                                        ] !== undefined
                                          ? String(
                                              editingDevs[username].FinalHours[
                                                month
                                              ]
                                            )
                                          : objHours[month] !== undefined &&
                                              objHours[month] !== null
                                            ? String(objHours[month])
                                            : ""
                                      }
                                      ref={(inputRef) => {
                                        if (!DevHoursRefs.current[username])
                                          DevHoursRefs.current[username] = {};
                                        DevHoursRefs.current[username][month] =
                                          inputRef;
                                      }}
                                      onChange={(e) =>
                                        handleDevInputChange(
                                          username,
                                          1,
                                          month,
                                          e.target.value
                                        )
                                      }
                                      onBlur={() =>
                                        handleDevInputBlur(username, 1, month)
                                      }
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          e.target.blur();
                                        }
                                      }}
                                      inputMode="numeric"
                                    />
                                  </div>
                                ))}
                              </div>
                            </Col>
                            <Col>
                              <div className="dev-months-grid">
                                {months.map((month) => (
                                  <div key={month} className="dev-month-cell">
                                    <span className="dev-month-label">
                                      {month.slice(0, 3)}
                                    </span>
                                    <input
                                      style={{width: "80px"}}
                                      className="DevRespHours dev-input"
                                      value={
                                        editingDevs?.[username]?.HoursDone?.[
                                          month
                                        ] !== undefined
                                          ? String(
                                              editingDevs[username].HoursDone[
                                                month
                                              ]
                                            )
                                          : objDone[month] !== undefined &&
                                              objDone[month] !== null
                                            ? String(objDone[month])
                                            : ""
                                      }
                                      ref={(inputRef) => {
                                        if (!DevHoursRefs.current[username])
                                          DevHoursRefs.current[username] = {};
                                        DevHoursRefs.current[username][month] =
                                          inputRef;
                                      }}
                                      onChange={(e) =>
                                        handleDevInputChange(
                                          username,
                                          2,
                                          month,
                                          e.target.value
                                        )
                                      }
                                      onBlur={() =>
                                        handleDevInputBlur(username, 2, month)
                                      }
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          e.target.blur();
                                        }
                                      }}
                                      inputMode="numeric"
                                    />
                                  </div>
                                ))}
                              </div>
                            </Col>
                          </Row>
                        );
                      })}
                </Container>
                <div className="add-dev-section">
                  <select
                  defaultValue="dev1"
                    type="text"
                    ref={devInput}
                    placeholder="Add Developer (e.g. Boleslaw Prus)"
                    className="DevInput"
                    style={{
                      borderRadius: 8,
                      border: "1.5px solid #faedcd",
                      padding: "8px 12px",
                      marginRight: 8,
                      width: 220,
                      fontWeight: 600,
                      color: "#7e9eb3",
                      background: "#fff",
                    }}
                  >
                    <option value="dev1" disabled>
                      Select Developer
                      </option>
                      {developers.map((dev, index) => (<option key={index} >{dev}</option>))}
                  </select>
                  <Button
                    className="DevInput"
                    variant="primary"
                    style={{
                      borderRadius: 8,
                      background: "white",
                      border: "none",
                      fontWeight: 700,
                      boxShadow: "0 2px 8px #e9edc9cc",
                      padding: "8px 24px",
                      fontSize: "1.08rem",
                      color: "#7e9eb3",
                      backgroundColor:"white"
                    }}
                    onClick={() => {
                      addDeveloper();
                    }}
                  >
                    Add Developer
                  </Button>
                </div>
              </div>
            </div>
            <Button
              variant="secondary"
              onClick={closeProjectDetails}
              style={{
                marginTop: 36,
                borderRadius: 8,
                background: "white",
                border: "none",
                fontWeight: 700,
                color: "#7e9eb3",
                boxShadow: "0 2px 8px #e9edc9cc",
                padding: "10px 36px",
                fontSize: "1.08rem",
                display: "block",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </Container>
  );
}

export default Home;
