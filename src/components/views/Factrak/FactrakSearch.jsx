// React imports
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

// Redux/ Router imports
import { connect } from "react-redux";
import { getToken } from "../../../selectors/auth";
import { createRouteNodeSelector } from "redux-router5";

// Additional imports
import { checkAndHandleError } from "../../../lib/general";
import { getProfessors, getCourses } from "../../../api/factrak";
import { Link } from "react-router5";

// FactrakSearch refers to the search result page
const FactrakSearch = ({ token, route }) => {
  const [profs, updateProfs] = useState(null);
  const [courses, updateCourses] = useState(null);

  useEffect(() => {
    const loadProfs = async () => {
      const queryParams = {
        q: route.params.q ? route.params.q : undefined,
        preload: ["office"],
      };
      const profsResponse = await getProfessors(token, queryParams);

      if (checkAndHandleError(profsResponse)) {
        updateProfs(profsResponse.data.data.sort((a, b) => a.name > b.name));
      } else updateProfs([]);
    };

    const loadCourses = async () => {
      const queryParams = {
        q: route.params.q ? route.params.q : undefined,
        preload: ["areaOfStudy", "professors"],
      };
      const coursesResponse = await getCourses(token, queryParams);
      if (checkAndHandleError(coursesResponse)) {
        updateCourses(
          coursesResponse.data.data.sort(
            (a, b) =>
              a.areaOfStudy.abbreviation + a.number >
              b.areaOfStudy.abbreviation + b.number
          )
        );
      } else updateCourses([]);
    };

    loadProfs();
    loadCourses();
  }, [token, route.params.q]);

  // Generates the row for one of the professor results.
  const professorRow = (prof) => {
    // Doesn't check for existence of professor in LDAP.
    return (
      <tr key={prof.name}>
        <td>
          <Link
            routeName="factrak.professors"
            routeParams={{ profID: prof.id }}
          >
            {prof.name}
          </Link>
        </td>
        <td>{prof.unixID || ""}</td>
        <td>{prof.office.number || ""}</td>
      </tr>
    );
  };

  // Generates the table of professor results.
  const professorDisplay = () => {
    if (!profs || profs.length === 0) return null;
    return (
      <section className="margin-vertical-small">
        <br />
        <h4>Professors</h4>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th className="unix-column">Unix</th>
              <th>Office</th>
            </tr>
          </thead>
          <tbody>{profs.map((prof) => professorRow(prof))}</tbody>
        </table>
      </section>
    );
  };

  // Generate the links to the course's professors.
  const courseRowProfs = (course) => {
    if (course.professors) {
      return course.professors
        .map((prof) => (
          <Link
            key={`${course.id}?profID=${prof.id}`}
            routeName="factrak.courses.singleProf"
            routeParams={{
              courseID: course.id,
              profID: prof.id,
            }}
          >
            {prof.name}
          </Link>
        ))
        .reduce((prev, curr) => [prev, ", ", curr]);
    }

    return null;
  };

  // Generates one row of course results.
  const courseRow = (course) => {
    return (
      <tr key={course.id}>
        <td className="col-20">
          <Link
            routeName="factrak.courses"
            routeParams={{ courseID: course.id }}
          >
            {course.areaOfStudy.abbreviation} {course.number}
          </Link>
        </td>
        <td className="col-80">{courseRowProfs(course)}</td>
      </tr>
    );
  };

  // Generates the table of course results.
  const courseDisplay = () => {
    if (!courses || courses.length === 0) return null;
    return (
      <section className="margin-vertical-small">
        <h4>Courses</h4>
        <table>
          <thead>
            <tr>
              <th className="col-20">Course</th>
              <th className="col-80">Professors</th>
            </tr>
          </thead>
          <tbody>{courses.map((course) => courseRow(course))}</tbody>
        </table>
      </section>
    );
  };

  // Returns "No results" if there are no results for the given query.
  const noResults = () => {
    if ((!courses || courses.length === 0) && (!profs || profs.length === 0)) {
      return (
        <>
          <br />
          <h1 className="no-matches-found">No matches were found.</h1>
        </>
      );
    }
    return null;
  };

  return (
    <article className="factrak-home">
      {professorDisplay()}
      {courseDisplay()}
      {noResults()}
    </article>
  );
};

FactrakSearch.propTypes = {
  token: PropTypes.string.isRequired,
  route: PropTypes.object.isRequired,
};

FactrakSearch.defaultProps = {};

const mapStateToProps = () => {
  const routeNodeSelector = createRouteNodeSelector("factrak.search");

  return (state) => ({
    token: getToken(state),
    ...routeNodeSelector(state),
  });
};

export default connect(mapStateToProps)(FactrakSearch);