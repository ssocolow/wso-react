// React imports
import React from "react";
import PropTypes from "prop-types";

// Component imports
import FactrakHome from "./FactrakHome";
import FactrakPolicy from "./FactrakPolicy";
import FactrakModerate from "./FactrakModerate";
import FactrakSurveyIndex from "./FactrakSurveyIndex";
import FactrakSurvey from "./FactrakSurvey";
import FactrakLayout from "./FactrakLayout";
import FactrakAOS from "./FactrakAOS";
import FactrakCourse from "./FactrakCourse";
import FactrakProfessor from "./FactrakProfessor";
import FactrakSearch from "./FactrakSearch";

// Redux/ Router imports
import { connect } from "react-redux";
import { createRouteNodeSelector, actions } from "redux-router5";
import { getToken } from "../../../selectors/auth";

// Additional Imports
import { scopes, containsScopes, getTokenLevel } from "../../../lib/general";

const FactrakMain = ({ route, token, navigateTo }) => {
  const factrakBody = () => {
    const splitRoute = route.name.split(".");
    if (splitRoute.length === 1) return <FactrakHome />;

    switch (splitRoute[1]) {
      case "policy":
        return <FactrakPolicy />;
      case "surveys":
        return <FactrakSurveyIndex />;
      case "newSurvey":
        return <FactrakSurvey edit={false} />;
      case "editSurvey":
        return <FactrakSurvey edit />;
      case "moderate":
        return <FactrakModerate />;
      case "areasOfStudy":
        return <FactrakAOS />;
      case "courses":
        return <FactrakCourse />;
      case "professors":
        return <FactrakProfessor />;
      case "search":
        return <FactrakSearch />;
      default:
        return <FactrakHome />;
    }
  };

  // Returns body only if the user has the respective scopes
  if (
    containsScopes(token, [
      scopes.ScopeFactrakFull,
      scopes.ScopeFactrakAdmin,
      scopes.ScopeFactrakLimited,
    ])
  ) {
    return <FactrakLayout>{factrakBody()}</FactrakLayout>;
  }

  // Token level of 3 corresponds to an authenticated user.
  if (getTokenLevel(token) > 2) {
    return (
      <FactrakLayout>
        <FactrakPolicy />
      </FactrakLayout>
    );
  }

  navigateTo("login");
  return null;
};

FactrakMain.propTypes = {
  route: PropTypes.object.isRequired,
  token: PropTypes.string.isRequired,
  navigateTo: PropTypes.func.isRequired,
};

const mapStateToProps = () => {
  const routeNodeSelector = createRouteNodeSelector("factrak");

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
)(FactrakMain);