// React imports
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "../../stylesheets/FactrakSurvey.css";

// Redux/ Routing imports
import { connect } from "react-redux";
import { getToken } from "../../../selectors/auth";
import { createRouteNodeSelector, actions } from "redux-router5";

// External Imports
import {
  getProfessor,
  postSurvey,
  patchSurvey,
  getSurvey,
  getAreasOfStudy,
} from "../../../api/factrak";
import { checkAndHandleError } from "../../../lib/general";

const FactrakSurvey = ({ token, route, navigateTo }) => {
  const [survey, updateSurvey] = useState(null);
  const [prof, updateProf] = useState(null);

  const edit = route.name.split(".")[1] === "editSurvey";

  const [comment, updateComment] = useState("");
  const [courseAOS, updateCourseAOS] = useState("");
  const [errors, updateErrors] = useState([]);
  // Use string to accomodate tutorial course numbers
  const [courseNumber, updateCourseNumber] = useState("");
  const [wouldRecommendCourse, updateRecommend] = useState(null);
  const [wouldTakeAnother, updateTakeAnother] = useState(null);
  const [workload, updateWorkload] = useState(null);
  const [approachability, updateApprochability] = useState(null);
  const [lecture, updateLecture] = useState(null);
  const [discussion, updateDiscussion] = useState(null);
  const [helpful, updateHelpful] = useState(null);

  const professorParam = route.params.profID;
  const surveyParam = route.params.surveyID;
  const [areasOfStudy, updateAreasOfStudy] = useState([]);

  const submitHandler = async (event) => {
    event.preventDefault();
    // Parse integers here rather than below to minimize the expensive operation
    const surveyParams = {
      areaOfStudyAbbreviation: courseAOS,
      professorID: prof.id,
      courseNumber,
      comment,
      wouldRecommendCourse,
      wouldTakeAnother,
      // Parse ints should work without errors here since users do not have access to these
      // variables
      courseWorkload: parseInt(workload, 10),
      approachability: parseInt(approachability, 10),
      leadLecture: parseInt(lecture, 10),
      promoteDiscussion: parseInt(discussion, 10),
      outsideHelpfulness: parseInt(helpful, 10),
    };

    const response = edit
      ? await patchSurvey(token, surveyParams, survey.id)
      : await postSurvey(token, surveyParams);

    if (checkAndHandleError(response)) {
      navigateTo("factrak.surveys");
    } else {
      updateErrors([response.data.error.message]);
    }
  };

  useEffect(() => {
    const loadProf = async (professorID) => {
      const profResponse = await getProfessor(token, professorID);
      if (checkAndHandleError(profResponse)) {
        updateProf(profResponse.data.data);
      }
    };

    const loadSurvey = async (surveyID) => {
      const surveyResponse = await getSurvey(token, surveyID);
      if (checkAndHandleError(surveyResponse)) {
        const surveyData = surveyResponse.data.data;

        // Could use a defaultSurvey and update that object, but will hardly save any lines.
        updateSurvey(surveyData);
        updateProf(surveyData.professor);
        updateCourseAOS(surveyData.course.areaOfStudy.abbreviation);
        updateRecommend(surveyData.wouldRecommendCourse);
        updateWorkload(surveyData.courseWorkload);
        updateApprochability(surveyData.approachability);
        updateLecture(surveyData.leadLecture);
        updateHelpful(surveyData.outsideHelpfulness);
        updateDiscussion(surveyData.promoteDiscussion);
        updateRecommend(surveyData.wouldRecommendCourse);
        updateTakeAnother(surveyData.wouldTakeAnother);
        updateComment(surveyData.comment);
      }
    };

    const loadAreasOfStudy = async () => {
      const areasOfStudyResponse = await getAreasOfStudy(token);
      if (checkAndHandleError(areasOfStudyResponse)) {
        updateAreasOfStudy(areasOfStudyResponse.data.data);
      }
    };

    if (surveyParam) loadSurvey(surveyParam);
    if (professorParam) loadProf(professorParam);
    loadAreasOfStudy();
  }, [token, professorParam, surveyParam]);

  // Generates the dropdown for the department
  const deptDropdown = () => {
    if (areasOfStudy.length === 0)
      return (
        <select className="select-dept">
          <option>Loading...</option>
        </select>
      );
    return (
      <select
        className="select-dept"
        onChange={(event) => updateCourseAOS(event.target.value)}
      >
        {areasOfStudy.map((areaOfStudy) => (
          <option value={areaOfStudy.abbreviation} key={areaOfStudy.id}>
            {areaOfStudy.abbreviation}
          </option>
        ))}
      </select>
    );
  };

  // Constructor which helps us build the option bubbles for each option
  const optionBuilder = (type, changeHandler) => {
    return [1, 2, 3, 4, 5, 6, 7].map((ans) => {
      return (
        <React.Fragment key={ans}>
          {ans}
          &nbsp;
          <input
            type="radio"
            checked={edit && type ? type === ans : false}
            onChange={() => changeHandler(ans)}
          />
        </React.Fragment>
      );
    });
  };

  // Generates the title of the survey
  const surveyTitle = () => {
    if (prof) {
      return (
        <>
          {edit && survey ? (
            <h3>
              Editing review on
              {survey.course
                ? ` ${survey.course.areaOfStudy.abbreviation} ${survey.course.number} with `
                : " "}
              {prof.name}
            </h3>
          ) : null}
          <h3>{`Review of ${prof.name}`}</h3>
        </>
      );
    }
    return null;
  };

  return (
    <div className="article">
      <section>
        <article>
          <div id="errors">
            {errors ? errors.map((msg) => <p key={msg}>{msg}</p>) : null}
          </div>

          <form onSubmit={(event) => submitHandler(event)}>
            {surveyTitle()}
            <table id="factrak-survey-table">
              <tbody>
                <tr>
                  <td align="left">
                    <strong>What course is this for?*</strong>
                  </td>
                  <td align="left">
                    <div className="survey_course_name">
                      {deptDropdown()}
                      <input
                        placeholder="NUMBER"
                        type="text"
                        onChange={(event) =>
                          updateCourseNumber(event.target.value)
                        }
                        id="factrak_survey_course_num"
                        defaultValue={
                          survey && survey.course ? survey.course.number : ""
                        }
                      />
                    </div>
                  </td>
                </tr>

                <tr>
                  <td align="left">
                    <strong>
                      Would you would recommend this course to a friend?
                    </strong>
                  </td>
                  <td align="left">
                    Yes&nbsp;
                    <input
                      type="radio"
                      checked={wouldRecommendCourse}
                      onChange={() => updateRecommend(true)}
                    />
                    No&nbsp;
                    <input
                      type="radio"
                      onChange={() => updateRecommend(false)}
                      checked={
                        wouldRecommendCourse !== null &&
                        wouldRecommendCourse === false
                      }
                    />
                  </td>
                </tr>

                <tr>
                  <td align="left">
                    <strong>
                      Would you take another course with this professor?
                    </strong>
                  </td>
                  <td align="left">
                    Yes&nbsp;
                    <input
                      type="radio"
                      checked={wouldTakeAnother}
                      onChange={() => updateTakeAnother(true)}
                    />
                    No&nbsp;
                    <input
                      type="radio"
                      checked={
                        wouldTakeAnother !== null && wouldTakeAnother === false
                      }
                      onChange={() => updateTakeAnother(false)}
                    />
                  </td>
                </tr>

                <tr>
                  <td align="left">
                    <strong>
                      How does the workload compare to other courses you&apos;ve
                      taken?
                    </strong>
                  </td>
                  <td align="left">
                    {optionBuilder(workload, updateWorkload)}
                  </td>
                </tr>

                <tr>
                  <td align="left">
                    <strong>How approachable was this professor?</strong>
                  </td>
                  <td align="left">
                    {optionBuilder(approachability, updateApprochability)}
                  </td>
                </tr>

                <tr>
                  <td align="left">
                    <strong>
                      If applicable, how effective was this professor at
                      lecturing?
                    </strong>
                  </td>
                  <td align="left">{optionBuilder(lecture, updateLecture)}</td>
                </tr>

                <tr>
                  <td align="left">
                    <strong>
                      If applicable, how effective was this professor at
                      promoting discussion?
                    </strong>
                  </td>
                  <td align="left">
                    {optionBuilder(discussion, updateDiscussion)}
                  </td>
                </tr>

                <tr>
                  <td align="left">
                    <strong>
                      How helpful was this professor outside of class?
                    </strong>
                  </td>
                  <td align="left">{optionBuilder(helpful, updateHelpful)}</td>
                </tr>

                <tr>
                  <td colSpan="2">
                    <br />
                    <strong>Comments*</strong>
                    <textarea
                      style={{ minHeight: "100px" }}
                      placeholder="Minimum 100 characters"
                      value={comment}
                      onChange={(event) => updateComment(event.target.value)}
                    />
                    <input
                      type="submit"
                      value="Save"
                      data-disable-with="Save"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </form>
        </article>
      </section>
    </div>
  );
};

FactrakSurvey.propTypes = {
  token: PropTypes.string.isRequired,
  route: PropTypes.object.isRequired,
  navigateTo: PropTypes.func.isRequired,
};

FactrakSurvey.defaultProps = {};

const mapStateToProps = () => {
  const routeNodeSelector = createRouteNodeSelector("factrak.surveys");

  return (state) => ({
    token: getToken(state),
    ...routeNodeSelector(state),
  });
};

const mapDispatchToProps = (dispatch) => ({
  navigateTo: (location) => dispatch(actions.navigateTo(location)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(FactrakSurvey);