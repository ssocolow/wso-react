// React imports
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

// Redux/ Router imports
import { connect } from "react-redux";
import { getToken } from "../../../selectors/auth";
import { createRouteNodeSelector, actions } from "redux-router5";

// Additional Imports
import {
  getProfessors,
  getCourses,
  getAreaOfStudy,
} from "../../../api/factrak";
import { checkAndHandleError } from "../../../lib/general";
import { Link } from "react-router5";

const FactrakAOS = ({ route, token }) => {
  const [courses, updateCourses] = useState([]);
  const [profs, updateProfs] = useState([]);
  const [area, updateArea] = useState({});

  // Equivalent to ComponentDidMount
  useEffect(() => {
    const areaParam = route.params.area;

    // Loads professors of the Area of Study
    const loadProfs = async (areaOfStudyID) => {
      const params = { areaOfStudyID };
      const profsResponse = await getProfessors(token, params);
      if (checkAndHandleError(profsResponse)) {
        updateProfs(profsResponse.data.data);
      }
    };

    // Loads courses of the Area of Study
    const loadCourses = async (areaOfStudyID) => {
      const params = { areaOfStudyID, preload: ["professors"] };
      const coursesResponse = await getCourses(token, params);
      if (checkAndHandleError(coursesResponse)) {
        const coursesData = coursesResponse.data.data;
        updateCourses(coursesData.sort((a, b) => a.number > b.number));
      }
    };

    // Loads additional information regarding the area of study
    const loadAOS = async (areaID) => {
      const areaOfStudyResponse = await getAreaOfStudy(token, areaID);
      if (checkAndHandleError(areaOfStudyResponse)) {
        updateArea(areaOfStudyResponse.data.data);
      }
    };

    loadProfs(areaParam);
    loadCourses(areaParam);
    loadAOS(areaParam);
  }, [route.params.area, token]);

  // Generates a row containing the prof information.
  const generateProfRow = (prof) => {
    return (
      <tr key={prof.id}>
        <td>
          <Link
            routeName="factrak.professors"
            routeParams={{ profID: prof.id }}
          >
            {prof.name}
          </Link>
        </td>

        <td>{prof.title}</td>
        <td>
          <a href={`mailto:${prof.unixID}@williams.edu`}>{prof.unixID}</a>
        </td>
      </tr>
    );
  };

  // Generates the component which holds the list of professors in the area of study
  const generateProfs = () => {
    // If no profs were found, return null. Should not happen for Area of Study unless it's new.
    if (profs.length === 0) return null;
    return (
      <>
        <br />
        <h4>{`Professors in ${area && area.name ? area.name : ""}`}</h4>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Title</th>
              <th className="unix-column">Unix</th>
            </tr>
          </thead>
          <tbody>{profs.map((prof) => generateProfRow(prof))}</tbody>
        </table>
      </>
    );
  };

  // Generate a course's professors' information
  const generateCourseProfessors = (course) => {
    if (course.professors) {
      return course.professors
        .map((prof) => {
          return (
            <Link
              routeName="factrak.courses.singleProf"
              routeParams={{
                courseID: course.id,
                profID: prof.id,
              }}
              key={prof.id}
            >
              {prof.name}
            </Link>
          );
        })
        .reduce((prev, curr) => [prev, ", ", curr]);
    }

    return null;
  };

  // Generates a row containing the course information.
  const generateCourseRow = (course) => {
    return (
      <tr key={course.id}>
        <td className="col-20">
          <Link
            routeName="factrak.courses"
            routeParams={{ courseID: course.id }}
          >
            {`${area.abbreviation} ${course.number}`}
          </Link>
        </td>
        <td className="col-80">{generateCourseProfessors(course)}</td>
      </tr>
    );
  };

  // Generates the component which holds the list of courses in the area of study
  const generateCourses = () => {
    // If no profs were found, return null. Should not happen for Area of Study unless it's new.
    if (profs.length === 0) return null;
    return (
      <>
        <h4>Courses</h4>
        <table>
          <thead>
            <tr>
              <th className="col-20">Course</th>
              <th className="col-80">Professors</th>
            </tr>
          </thead>
          <tbody>{courses.map((course) => generateCourseRow(course))}</tbody>
        </table>
      </>
    );
  };

  return (
    <article className="factrak-home">
      <section className="margin-vertical-small">
        <h3>{area && area.name ? area.name : ""}</h3>
        {generateProfs()}
      </section>

      <section className="margin-vertical-small">{generateCourses()}</section>
    </article>
  );
};

FactrakAOS.propTypes = {
  route: PropTypes.object.isRequired,
  token: PropTypes.string.isRequired,
};

const mapStateToProps = () => {
  const routeNodeSelector = createRouteNodeSelector("factrak.areasOfStudy");

  return (state) => ({
    token: getToken(state),
    ...routeNodeSelector(state),
  });
};

const mapDispatchToProps = (dispatch) => ({
  navigateTo: (location, params, opts) =>
    dispatch(actions.navigateTo(location, params, opts)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FactrakAOS);