// React imports
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import FactrakComment from "./FactrakComment";

// Redux/ Router imports
import { connect } from "react-redux";
import { createRouteNodeSelector, actions } from "redux-router5";
import { getToken } from "../../../selectors/auth";

// Additional imports
import { getCourse, getSurveys, getProfessors } from "../../../api/factrak";
import { checkAndHandleError } from "../../../lib/general";
import { Link } from "react-router5";

const FactrakCourse = ({ route, token }) => {
  const [course, updateCourse] = useState({});
  const [courseSurveys, updateSurveys] = useState([]);
  const [courseProfs, updateProfs] = useState([]);

  useEffect(() => {
    const courseID = route.params.courseID;
    const profID = route.params.profID ? route.params.profID : -1;

    const loadCourse = async () => {
      const courseResponse = await getCourse(token, courseID);
      if (checkAndHandleError(courseResponse)) {
        updateCourse(courseResponse.data.data);
      }
    };

    const loadSurveys = async () => {
      const queryParams = {
        preload: ["professor", "course"],
        courseID,
        populateAgreements: true,
        populateClientAgreement: true,
      };
      if (profID > 0) {
        queryParams.professorID = profID;
      }
      const surveyResponse = await getSurveys(token, queryParams);
      if (checkAndHandleError(surveyResponse)) {
        updateSurveys(surveyResponse.data.data);
      }
    };

    const loadProfs = async () => {
      const params = { courseID };
      const profResponse = await getProfessors(token, params);
      if (checkAndHandleError(profResponse)) {
        updateProfs(profResponse.data.data);
      }
    };

    loadCourse();
    loadSurveys();
    loadProfs();
  }, [token, route.params.course, route.params.profID, route.params.courseID]);

  // Generates the list of professors who teach the course
  const professorList = () => {
    if (courseProfs.length === 0) return null;
    return (
      <div>
        {`View comments only for `}
        <br />
        {course && course.id
          ? courseProfs.map((prof) => (
              <React.Fragment key={prof.name}>
                <Link
                  routeName="factrak.courses.singleProf"
                  routeParams={{
                    courseID: course.id,
                    profID: prof.id,
                  }}
                >
                  {prof.name}
                </Link>
                &emsp;
              </React.Fragment>
            ))
          : null}
      </div>
    );
  };

  // Generates the factrak survey comments of the course
  const commentList = () => {
    return (
      <div className="factrak-prof-comments">
        {courseSurveys.length === 0
          ? "None yet."
          : courseSurveys.map((comment) => (
              <FactrakComment
                comment={comment}
                abridged={false}
                showProf
                key={comment.id}
              />
            ))}
      </div>
    );
  };

  return (
    <article className="facebook-profile">
      <section className="info">
        <h3>
          {`${course.areaOfStudy ? course.areaOfStudy.abbreviation : ""} ${
            course.number
          }`}
        </h3>
        <br />
        {professorList()}
        <br />
        {commentList()}
      </section>
    </article>
  );
};

FactrakCourse.propTypes = {
  token: PropTypes.string.isRequired,
  route: PropTypes.object.isRequired,
};

FactrakCourse.defaultProps = {};

const mapStateToProps = () => {
  const routeNodeSelector = createRouteNodeSelector("factrak.courses");

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
)(FactrakCourse);